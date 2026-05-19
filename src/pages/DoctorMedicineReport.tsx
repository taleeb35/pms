import { useEffect, useMemo, useState } from "react";
import { format, subDays, differenceInCalendarDays } from "date-fns";
import { CalendarIcon, Pill, Search, Users, ClipboardList, Clock, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/TablePagination";

interface PrescribedRow {
  medicine_name: string;
  brand?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  timing?: string[] | null;
  duration?: string | null;
  duration_days?: number | null;
  patient_id: string;
  patient_name?: string;
  prescribed_at: string;
  appointment_id: string;
  source: "structured" | "parsed";
}

interface MedicineAgg {
  name: string;
  prescriptions: number;
  uniquePatients: number;
  doses: Record<string, number>;
  frequencies: Record<string, number>;
  totalDays: number;
  daysCount: number;
  lastPrescribed: string;
  rows: PrescribedRow[];
}

// Lightweight prescription text parser.
// Handles formats like:
//   "1. Augmentin 625mg — 1 tablet, 3 times a day, after meal — 7 days"
//   "Panadol 500mg twice daily x 5 days"
//   "Brufen 400 mg 1+0+1 for 3 days"
function parsePrescriptionText(text: string): Array<Pick<PrescribedRow, "medicine_name" | "dosage" | "frequency" | "duration" | "duration_days">> {
  if (!text) return [];
  const out: Array<Pick<PrescribedRow, "medicine_name" | "dosage" | "frequency" | "duration" | "duration_days">> = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (const raw of lines) {
    // skip headers like "--- Disease ---"
    if (/^[-=*]{2,}/.test(raw)) continue;
    if (/^(notes?|advice|general|--)/i.test(raw)) continue;

    // strip leading bullets/numbers
    const line = raw.replace(/^\s*(\d+[\.\)]|[-•*])\s*/, "");
    if (!line || line.length < 3) continue;

    // medicine = first token sequence of alpha words, until digits / em-dash / comma
    const nameMatch = line.match(/^([A-Za-z][A-Za-z0-9\-\+\/']*(?:\s+[A-Za-z][A-Za-z0-9\-\+\/']*){0,3})/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();
    if (name.length < 2 || /^(take|tab|cap|syp|inj|notes?|advice|with|after|before)$/i.test(name)) continue;

    // dose: number+unit
    const doseMatch = line.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%)\b)/i);
    const dose = doseMatch ? doseMatch[1].replace(/\s+/g, "") : null;

    // frequency
    let freq: string | null = null;
    const freqPatterns: Array<[RegExp, string]> = [
      [/\bonce\s+a\s+day\b|\bOD\b|\b1\s*times?\s*(?:a|per)\s*day\b/i, "Once a day"],
      [/\btwice\s+a\s+day\b|\bBD\b|\bBID\b|\b2\s*times?\s*(?:a|per)\s*day\b/i, "Twice a day"],
      [/\bthrice\s+a\s+day\b|\bTDS\b|\bTID\b|\b3\s*times?\s*(?:a|per)\s*day\b/i, "3 times a day"],
      [/\bQID\b|\b4\s*times?\s*(?:a|per)\s*day\b/i, "4 times a day"],
      [/\bSOS\b|\bas\s+needed\b|\bPRN\b/i, "SOS (as needed)"],
      [/\bevery\s+6\s*hours?\b|\bQ6H\b/i, "Every 6 hours"],
      [/\bevery\s+8\s*hours?\b|\bQ8H\b/i, "Every 8 hours"],
      [/\bevery\s+12\s*hours?\b|\bQ12H\b/i, "Every 12 hours"],
    ];
    for (const [re, label] of freqPatterns) {
      if (re.test(line)) { freq = label; break; }
    }
    // 1+0+1 style
    if (!freq) {
      const plus = line.match(/(\d)\s*\+\s*(\d)\s*\+\s*(\d)(?:\s*\+\s*(\d))?/);
      if (plus) {
        const count = [plus[1], plus[2], plus[3], plus[4]].filter(v => v && v !== "0").length;
        if (count) freq = `${count === 1 ? "Once" : count === 2 ? "Twice" : count + " times"} a day`;
      }
    }

    // duration
    let duration: string | null = null;
    let durationDays: number | null = null;
    const durMatch = line.match(/(?:for|x|×)\s*(\d+)\s*(day|days|week|weeks|month|months)\b/i)
      || line.match(/(\d+)\s*(day|days|week|weeks|month|months)\b/i);
    if (durMatch) {
      const n = parseInt(durMatch[1]);
      const unit = durMatch[2].toLowerCase();
      duration = `${n} ${unit}`;
      durationDays = unit.startsWith("day") ? n : unit.startsWith("week") ? n * 7 : n * 30;
    }

    out.push({ medicine_name: name, dosage: dose, frequency: freq, duration, duration_days: durationDays });
  }
  return out;
}

const fmtRange = (from: Date, to: Date) =>
  `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;

const topN = (rec: Record<string, number>, n = 3) =>
  Object.entries(rec)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k} (${v})`)
    .join(", ");

const DoctorMedicineReport = () => {
  const [from, setFrom] = useState<Date>(subDays(new Date(), 90));
  const [to, setTo] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PrescribedRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detail, setDetail] = useState<MedicineAgg | null>(null);
  const [freqFilter, setFreqFilter] = useState<string>("all");
  const [timingFilter, setTimingFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"name" | "prescriptions" | "uniquePatients" | "avgDays" | "lastPrescribed">("prescriptions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => { void load(); }, [from, to]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fromStr = format(from, "yyyy-MM-dd");
      const toStr = format(to, "yyyy-MM-dd");
      const fromIso = `${fromStr}T00:00:00`;
      const toIso = `${toStr}T23:59:59.999`;

      // Structured prescribed medicines
      const { data: structured } = await supabase
        .from("appointment_prescribed_medicines")
        .select("medicine_name, brand, dosage, frequency, timing, duration, duration_days, patient_id, prescribed_at, appointment_id")
        .eq("doctor_id", user.id)
        .gte("prescribed_at", fromIso)
        .lte("prescribed_at", toIso)
        .limit(5000);

      // Visit records prescription text (for parsing pre-existing data)
      const { data: visits } = await supabase
        .from("visit_records")
        .select("id, patient_id, appointment_id, visit_date, current_prescription")
        .eq("doctor_id", user.id)
        .gte("visit_date", fromIso)
        .lte("visit_date", toIso)
        .not("current_prescription", "is", null)
        .limit(5000);

      // Collect patient names
      const patientIds = new Set<string>();
      (structured || []).forEach(r => patientIds.add(r.patient_id));
      (visits || []).forEach(r => patientIds.add(r.patient_id));
      let patientNames: Record<string, string> = {};
      if (patientIds.size > 0) {
        const { data: pts } = await supabase
          .from("patients")
          .select("id, full_name")
          .in("id", Array.from(patientIds));
        (pts || []).forEach(p => { patientNames[p.id] = p.full_name; });
      }

      const all: PrescribedRow[] = [];

      (structured || []).forEach(r => {
        all.push({
          medicine_name: r.medicine_name,
          brand: r.brand,
          dosage: r.dosage,
          frequency: r.frequency,
          timing: r.timing,
          duration: r.duration,
          duration_days: r.duration_days,
          patient_id: r.patient_id,
          patient_name: patientNames[r.patient_id],
          prescribed_at: r.prescribed_at,
          appointment_id: r.appointment_id,
          source: "structured",
        });
      });

      // Track structured appointment_ids so we don't double-count when parsing the same visit's text
      const structuredApptIds = new Set((structured || []).map(r => r.appointment_id));

      (visits || []).forEach(v => {
        if (structuredApptIds.has(v.appointment_id)) return;
        const parsed = parsePrescriptionText(v.current_prescription || "");
        parsed.forEach(p => {
          all.push({
            medicine_name: p.medicine_name,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: p.duration,
            duration_days: p.duration_days,
            timing: null,
            brand: null,
            patient_id: v.patient_id,
            patient_name: patientNames[v.patient_id],
            prescribed_at: v.visit_date,
            appointment_id: v.appointment_id || v.id,
            source: "parsed",
          });
        });
      });

      setRows(all);
    } finally {
      setLoading(false);
    }
  };

  const aggregated = useMemo<MedicineAgg[]>(() => {
    const map = new Map<string, MedicineAgg>();
    for (const r of rows) {
      const key = r.medicine_name.trim().toLowerCase();
      if (!key) continue;
      const existing = map.get(key);
      const display = r.medicine_name.trim().replace(/\b\w/g, c => c.toUpperCase());
      const agg = existing || {
        name: display,
        prescriptions: 0,
        uniquePatients: 0,
        doses: {},
        frequencies: {},
        totalDays: 0,
        daysCount: 0,
        lastPrescribed: r.prescribed_at,
        rows: [],
      };
      agg.prescriptions += 1;
      if (r.dosage) agg.doses[r.dosage] = (agg.doses[r.dosage] || 0) + 1;
      if (r.frequency) agg.frequencies[r.frequency] = (agg.frequencies[r.frequency] || 0) + 1;
      if (r.duration_days) { agg.totalDays += r.duration_days; agg.daysCount += 1; }
      if (r.prescribed_at > agg.lastPrescribed) agg.lastPrescribed = r.prescribed_at;
      agg.rows.push(r);
      map.set(key, agg);
    }
    for (const agg of map.values()) {
      const pts = new Set(agg.rows.map(r => r.patient_id));
      agg.uniquePatients = pts.size;
    }
    return Array.from(map.values()).sort((a, b) => b.prescriptions - a.prescriptions);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return aggregated;
    return aggregated.filter(a => a.name.toLowerCase().includes(q));
  }, [aggregated, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [search, pageSize]);

  const totalPatients = useMemo(
    () => new Set(rows.map(r => r.patient_id)).size,
    [rows]
  );

  const exportCsv = () => {
    const headers = ["Medicine", "Prescriptions", "Unique Patients", "Common Doses", "Common Frequencies", "Avg Days", "Last Prescribed"];
    const lines = [headers.join(",")];
    for (const a of filtered) {
      const avg = a.daysCount ? Math.round(a.totalDays / a.daysCount) : "";
      const safe = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
      lines.push([
        safe(a.name),
        a.prescriptions,
        a.uniquePatients,
        safe(topN(a.doses)),
        safe(topN(a.frequencies)),
        avg,
        safe(format(new Date(a.lastPrescribed), "yyyy-MM-dd")),
      ].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medicine-report-${format(from, "yyyy-MM-dd")}_to_${format(to, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const days = differenceInCalendarDays(to, from) + 1;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Pill className="h-7 w-7 text-primary" />
            Medicine Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            See which medicines you prescribe the most, common doses, frequencies and patient counts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                From: {format(from, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={from} onSelect={d => d && setFrom(d)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                To: {format(to, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={to} onSelect={d => d && setTo(d)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => { setFrom(subDays(new Date(), 30)); setTo(new Date()); }}>
            Last 30 days
          </Button>
          <Button variant="outline" onClick={() => { setFrom(subDays(new Date(), 90)); setTo(new Date()); }}>
            Last 90 days
          </Button>
          <Button onClick={exportCsv} variant="default" disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={ClipboardList} label="Total Prescriptions" value={rows.length} tint="text-blue-600 from-blue-500/10 to-blue-500/5" />
        <SummaryCard icon={Pill} label="Unique Medicines" value={aggregated.length} tint="text-violet-600 from-violet-500/10 to-violet-500/5" />
        <SummaryCard icon={Users} label="Unique Patients" value={totalPatients} tint="text-emerald-600 from-emerald-500/10 to-emerald-500/5" />
        <SummaryCard icon={Clock} label="Days in Range" value={days} tint="text-amber-600 from-amber-500/10 to-amber-500/5" />
      </div>

      {/* Filters + table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-lg">Medicines used ({fmtRange(from, to)})</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicine…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No medicines prescribed in this range yet.</p>
              <p className="text-xs mt-1">
                Tip: load a disease template in an appointment, or write structured prescriptions like
                <code className="mx-1 px-1 bg-muted rounded">Augmentin 625mg twice daily for 5 days</code>
                so they get picked up automatically.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead className="text-right">Prescriptions</TableHead>
                    <TableHead className="text-right">Patients</TableHead>
                    <TableHead>Common Doses</TableHead>
                    <TableHead>Common Frequencies</TableHead>
                    <TableHead className="text-right">Avg Days</TableHead>
                    <TableHead>Last Prescribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map(a => (
                    <TableRow
                      key={a.name}
                      className="cursor-pointer"
                      onClick={() => setDetail(a)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          {a.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{a.prescriptions}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{a.uniquePatients}</TableCell>
                      <TableCell className="text-sm">{topN(a.doses) || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-sm">{topN(a.frequencies) || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-right">
                        {a.daysCount ? Math.round(a.totalDays / a.daysCount) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(a.lastPrescribed), "PP")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-3 border-t">
                <TablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {detail?.name}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Prescriptions" value={detail.prescriptions} />
                <Stat label="Patients" value={detail.uniquePatients} />
                <Stat label="Avg Days" value={detail.daysCount ? Math.round(detail.totalDays / detail.daysCount) : "—"} />
                <Stat label="Last" value={format(new Date(detail.lastPrescribed), "PP")} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <BreakdownCard title="Doses" data={detail.doses} />
                <BreakdownCard title="Frequencies" data={detail.frequencies} />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recent prescriptions</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.rows
                      .slice()
                      .sort((a, b) => (a.prescribed_at < b.prescribed_at ? 1 : -1))
                      .slice(0, 50)
                      .map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{format(new Date(r.prescribed_at), "PP")}</TableCell>
                          <TableCell className="text-sm">{r.patient_name || "—"}</TableCell>
                          <TableCell className="text-sm">{r.dosage || "—"}</TableCell>
                          <TableCell className="text-sm">{r.frequency || "—"}</TableCell>
                          <TableCell className="text-sm">{r.duration || "—"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tint }: { icon: any; label: string; value: number | string; tint: string }) => (
  <Card className={cn("border-0 shadow-md bg-gradient-to-br", tint.split(" ").slice(1).join(" "))}>
    <CardContent className="p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={cn("h-12 w-12 rounded-xl bg-background flex items-center justify-center", tint.split(" ")[0])}>
        <Icon className="h-6 w-6" />
      </div>
    </CardContent>
  </Card>
);

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="p-3 rounded-lg bg-muted/40">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold mt-1">{value}</p>
  </div>
);

const BreakdownCard = ({ title, data }: { title: string; data: Record<string, number> }) => {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <Card className="bg-muted/30">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        {entries.slice(0, 6).map(([k, v]) => (
          <div key={k}>
            <div className="flex justify-between text-sm mb-1">
              <span>{k}</span>
              <span className="text-muted-foreground">{v}</span>
            </div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(v / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DoctorMedicineReport;
