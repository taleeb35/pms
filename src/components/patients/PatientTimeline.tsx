import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, CalendarClock, CalendarX, Pill, FileText, Wallet, Stethoscope, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { friendlyDate, friendlyTime } from "@/lib/datetime";
import { money } from "@/lib/region";
import { useToast } from "@/hooks/use-toast";

// One scrolling story of a patient: visits, prescriptions, documents and payments, newest first.
type Kind = "visit" | "rx" | "doc" | "pay";
type Item = {
  key: string; kind: Kind; date: string; time?: string | null;
  title: string; sub?: string; lines?: string[]; badge?: string; tone?: string;
  apptId?: string; docPath?: string;
};

const FILTERS: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "Everything" }, { id: "visit", label: "Visits" }, { id: "rx", label: "Prescriptions" },
  { id: "doc", label: "Documents" }, { id: "pay", label: "Payments" },
];

const ICON: Record<Kind, typeof Pill> = { visit: Stethoscope, rx: Pill, doc: FileText, pay: Wallet };
const DOT: Record<Kind, string> = {
  visit: "bg-primary text-primary-foreground", rx: "bg-violet-600 text-white",
  doc: "bg-sky-600 text-white", pay: "bg-emerald-600 text-white",
};

type Props = { patientId: string; base: string; showDocuments?: boolean };

export const PatientTimeline = ({ patientId, base, showDocuments = true }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [appts, meds, visits, docs] = await Promise.all([
        supabase.from("appointments")
          .select("id, appointment_date, appointment_time, status, reason, appointment_type, consultation_fee, other_fee, procedure_fee, refund, doctors(profiles(full_name))")
          .eq("patient_id", patientId).order("appointment_date", { ascending: false }).limit(200),
        supabase.from("appointment_prescribed_medicines")
          .select("appointment_id, medicine_name, dosage, frequency, duration")
          .eq("patient_id", patientId).limit(1000),
        supabase.from("visit_records")
          .select("appointment_id, chief_complaint, current_prescription, blood_pressure, temperature, pulse, weight, visit_date")
          .eq("patient_id", patientId).limit(300),
        showDocuments
          ? supabase.from("medical_documents").select("id, document_name, document_type, document_url, created_at").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(200)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      if (!alive) return;

      const medsBy = new Map<string, any[]>();
      ((meds.data as any[]) || []).forEach((m) => { if (m.appointment_id) medsBy.set(m.appointment_id, [...(medsBy.get(m.appointment_id) || []), m]); });
      const visitBy = new Map<string, any>();
      ((visits.data as any[]) || []).forEach((v) => { if (v.appointment_id) visitBy.set(v.appointment_id, v); });

      const out: Item[] = [];
      ((appts.data as any[]) || []).forEach((a) => {
        const doc = a.doctors?.profiles?.full_name;
        const v = visitBy.get(a.id);
        const vitals = v ? [v.blood_pressure && `BP ${v.blood_pressure}`, v.temperature && `Temp ${v.temperature}`, v.pulse && `Pulse ${v.pulse}`, v.weight && `Wt ${v.weight}`].filter(Boolean).join(" · ") : "";
        const statusLabel: Record<string, string> = { completed: "Completed", scheduled: "Booked", start: "In progress", cancelled: "Cancelled", no_show: "No-show" };
        out.push({
          key: `v${a.id}`, kind: "visit", date: a.appointment_date, time: a.appointment_time, apptId: a.id,
          title: v?.chief_complaint || a.reason || (a.appointment_type === "walk_in" ? "Walk-in visit" : "Visit"),
          sub: [doc, vitals].filter(Boolean).join(" — "),
          badge: statusLabel[a.status] || a.status,
          tone: a.status === "completed" ? "done" : a.status === "cancelled" || a.status === "no_show" ? "bad" : "open",
        });
        const rx = medsBy.get(a.id);
        if (rx?.length) {
          out.push({ key: `r${a.id}`, kind: "rx", date: a.appointment_date, time: a.appointment_time, apptId: a.id,
            title: `${rx.length} medicine${rx.length > 1 ? "s" : ""} prescribed`,
            lines: rx.map((m) => [m.medicine_name, m.dosage, m.frequency, m.duration].filter(Boolean).join(" · ")) });
        } else if (v?.current_prescription?.trim()) {
          out.push({ key: `r${a.id}`, kind: "rx", date: a.appointment_date, time: a.appointment_time, apptId: a.id,
            title: "Prescription", lines: v.current_prescription.trim().split("\n").filter(Boolean).slice(0, 8) });
        }
        if (a.status === "completed") {
          const gross = Number(a.consultation_fee || 0) + Number(a.other_fee || 0) + Number(a.procedure_fee || 0);
          const net = gross - Number(a.refund || 0);
          if (gross > 0) out.push({ key: `p${a.id}`, kind: "pay", date: a.appointment_date, time: a.appointment_time, apptId: a.id,
            title: `Paid ${money(net)}`, sub: Number(a.refund || 0) > 0 ? `${money(gross)} charged, ${money(Number(a.refund))} refunded` : undefined });
        }
      });
      ((docs.data as any[]) || []).forEach((d) => out.push({
        key: `d${d.id}`, kind: "doc", date: String(d.created_at).slice(0, 10), title: d.document_name || "Document",
        sub: d.document_type || undefined, docPath: d.document_url,
      }));

      out.sort((x, y) => (y.date + (y.time || "99")).localeCompare(x.date + (x.time || "99")));
      setItems(out);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [patientId, showDocuments]);

  const shown = useMemo(() => items.filter((i) => filter === "all" || i.kind === filter), [items, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((i) => { c[i.kind] = (c[i.kind] || 0) + 1; });
    return c;
  }, [items]);

  const openDoc = async (path: string) => {
    const p = path.includes("/medical-documents/") ? path.split("/medical-documents/")[1] : path;
    const { data, error } = await supabase.storage.from("medical-documents").createSignedUrl(p, 60);
    if (error || !data) { toast({ title: "Could not open document", variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Timeline</CardTitle>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {FILTERS.filter((f) => showDocuments || f.id !== "doc").map((f) => (
            <Button key={f.id} size="sm" variant={filter === f.id ? "default" : "outline"} className="h-8" onClick={() => { setFilter(f.id); setLimit(25); }}>
              {f.label}{counts[f.id] ? <span className="ml-1.5 opacity-70">{counts[f.id]}</span> : null}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading history…</div>
        ) : shown.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarClock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">Nothing here yet. Visits, prescriptions{showDocuments ? ", documents" : ""} and payments will show up as they happen.</p>
          </div>
        ) : (
          <ol className="relative ml-3 border-l pl-6">
            {shown.slice(0, limit).map((i) => {
              const Icon = i.kind === "visit" ? (i.tone === "bad" ? CalendarX : i.tone === "done" ? CalendarCheck : CalendarClock) : ICON[i.kind];
              const clickable = !!i.apptId || !!i.docPath;
              return (
                <li key={i.key} className="relative pb-5 last:pb-0">
                  <span className={`absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${DOT[i.kind]}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <button type="button" disabled={!clickable}
                    onClick={() => i.docPath ? openDoc(i.docPath) : i.apptId && navigate(`${base}/appointments/${i.apptId}`)}
                    className={`w-full rounded-lg px-3 py-2 text-left ${clickable ? "hover:bg-muted/60" : ""}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{friendlyDate(i.date)}{i.time ? ` · ${friendlyTime(i.time)}` : ""}</span>
                      {i.badge && <Badge variant={i.tone === "bad" ? "destructive" : i.tone === "done" ? "secondary" : "outline"} className="h-5 text-[10px]">{i.badge}</Badge>}
                    </div>
                    <p className="mt-0.5 font-medium">{i.title}</p>
                    {i.sub && <p className="text-sm text-muted-foreground">{i.sub}</p>}
                    {i.lines && (
                      <ul className="mt-1 space-y-0.5 text-sm">
                        {i.lines.map((l, n) => <li key={n} className="text-muted-foreground">• {l}</li>)}
                      </ul>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        {shown.length > limit && (
          <div className="pt-3 text-center"><Button variant="outline" size="sm" onClick={() => setLimit((l) => l + 25)}>Show older</Button></div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientTimeline;
