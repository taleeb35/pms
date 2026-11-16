import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Loader2, Minus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/region";
import { friendlyDate } from "@/lib/datetime";
import { REVENUE_DEFINITION, fmtPct } from "@/lib/revenue";
import {
  PERIODS, byWeekday, change, kpis, periodRange, revenueTrend, topBy,
  type Kpis, type OvAppt, type PeriodKey,
} from "@/lib/reportsOverview";
import { useStickyState } from "@/hooks/useStickyState";

// The first tab of Reports: the key numbers for a period, compared with the period before.
type Props = { scope: "doctor" | "clinic" };
type Doc = { id: string; name: string };

const selectCls = "h-9 rounded-md border border-input bg-background px-2 text-sm";

async function fetchAll<T>(build: (from: number, to: number) => any): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(from, from + 999);
    if (error || !data) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export default function ReportsOverview({ scope }: Props) {
  const [period, setPeriod] = useStickyState<PeriodKey>(`reports.${scope}.period`, "30d");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [doctors, setDoctors] = useState<Doc[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [appts, setAppts] = useState<OvAppt[]>([]);
  const [newPts, setNewPts] = useState({ cur: 0, prev: 0 });
  const [exp, setExp] = useState({ cur: 0, prev: 0 });
  const [names, setNames] = useState<{ proc: Record<string, string>; icd: Record<string, string> }>({ proc: {}, icd: {} });
  const [loading, setLoading] = useState(true);

  const { current, previous } = useMemo(() => periodRange(period), [period]);

  // Who we report on: the doctor, or the clinic's doctors.
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (scope === "doctor") { setOwnerId(user.id); setDoctors([{ id: user.id, name: "" }]); return; }
      // Clinic owner, or a clinic receptionist working for a clinic.
      let clinicId = user.id;
      const { data: rc } = await supabase.rpc("get_receptionist_clinic_id" as any, { _user_id: user.id });
      if (rc) clinicId = rc as string;
      setOwnerId(clinicId);
      const { data } = await supabase.from("doctors").select("id, profiles(full_name)").eq("clinic_id", clinicId);
      setDoctors(((data || []) as any[]).map((d) => ({ id: d.id, name: d.profiles?.full_name || "Doctor" })));
    })();
  }, [scope]);

  const ids = useMemo(() => (doctorFilter === "all" ? doctors.map((d) => d.id) : [doctorFilter]), [doctors, doctorFilter]);

  useEffect(() => {
    if (!ownerId || !ids.length) { if (ownerId && scope === "clinic" && !doctors.length) setLoading(false); return; }
    let alive = true;
    setLoading(true);
    (async () => {
      const rows = await fetchAll<OvAppt>((f, t) => supabase.from("appointments")
        .select("id, appointment_date, status, patient_id, doctor_id, consultation_fee, other_fee, procedure_fee, refund, amount_paid, procedure_id, icd_code_id, source, lead_status")
        .in("doctor_id", ids).gte("appointment_date", previous.from).lte("appointment_date", current.to)
        .order("id").range(f, t));
      const count = async (r: { from: string; to: string }) => {
        const { count: c } = await supabase.from("patients").select("id", { count: "exact", head: true })
          .in("created_by", ids).gte("created_at", `${r.from}T00:00:00`).lte("created_at", `${r.to}T23:59:59`);
        return c || 0;
      };
      const [cur, prev] = await Promise.all([count(current), count(previous)]);
      let ec = 0, ep = 0;
      if (scope === "clinic" && doctorFilter === "all") {
        const { data: ex } = await supabase.from("clinic_expenses").select("amount, expense_date")
          .eq("clinic_id", ownerId).gte("expense_date", previous.from).lte("expense_date", current.to);
        for (const e of (ex || []) as any[]) {
          if (e.expense_date >= current.from) ec += Number(e.amount) || 0; else ep += Number(e.amount) || 0;
        }
      }
      const procIds = [...new Set(rows.map((a) => a.procedure_id).filter(Boolean))] as string[];
      const icdIds = [...new Set(rows.map((a) => a.icd_code_id).filter(Boolean))] as string[];
      const [pr, ic] = await Promise.all([
        procIds.length ? supabase.from("procedures").select("id, name").in("id", procIds.slice(0, 300)) : Promise.resolve({ data: [] as any[] }),
        icdIds.length ? supabase.from("clinic_icd_codes").select("id, code, description").in("id", icdIds.slice(0, 300)) : Promise.resolve({ data: [] as any[] }),
      ]);
      if (!alive) return;
      setAppts(rows);
      setNewPts({ cur, prev });
      setExp({ cur: ec, prev: ep });
      setNames({
        proc: Object.fromEntries(((pr as any).data || []).map((p: any) => [p.id, p.name])),
        icd: Object.fromEntries(((ic as any).data || []).map((c: any) => [c.id, [c.code, c.description].filter(Boolean).join(" · ")])),
      });
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [ownerId, ids, current.from, current.to, previous.from, scope, doctorFilter]);

  const k = useMemo(() => kpis(appts, current, newPts.cur, exp.cur), [appts, current, newPts.cur, exp.cur]);
  const p = useMemo(() => kpis(appts, previous, newPts.prev, exp.prev), [appts, previous, newPts.prev, exp.prev]);
  const trend = useMemo(() => revenueTrend(appts, current), [appts, current]);
  const weekdays = useMemo(() => byWeekday(appts, current), [appts, current]);
  const topProc = useMemo(() => topBy(appts, current, (a) => a.procedure_id), [appts, current]);
  const topIcd = useMemo(() => topBy(appts, current, (a) => a.icd_code_id), [appts, current]);
  const byDoctor = useMemo(() => topBy(appts, current, (a) => a.doctor_id, 10), [appts, current]);
  const docName = (id: string) => doctors.find((d) => d.id === id)?.name || "Doctor";
  const showClinic = scope === "clinic" && doctorFilter === "all";

  const cards: { label: string; key: keyof Kpis; fmt: (v: number) => string; lowerIsBetter?: boolean; hint?: string }[] = [
    { label: "Revenue", key: "revenue", fmt: (v) => money(v), hint: "Completed visits" },
    { label: "Collected", key: "collected", fmt: (v) => money(v) },
    { label: "Still to collect", key: "due", fmt: (v) => money(v), lowerIsBetter: true, hint: "Part payments" },
    ...(showClinic ? [
      { label: "Expenses", key: "expenses" as const, fmt: (v: number) => money(v), lowerIsBetter: true },
      { label: "Profit", key: "profit" as const, fmt: (v: number) => money(v), hint: "Revenue minus expenses" },
    ] : []),
    { label: "Completed visits", key: "visits", fmt: (v) => v.toLocaleString() },
    { label: "Patients seen", key: "patientsSeen", fmt: (v) => v.toLocaleString() },
    { label: "New patients", key: "newPatients", fmt: (v) => v.toLocaleString(), hint: "Added in this period" },
    { label: "Average per visit", key: "avgFee", fmt: (v) => money(v) },
    { label: "No-show rate", key: "noShowRate", fmt: (v) => `${v.toFixed(1)}%`, lowerIsBetter: true, hint: `${k.noShows} no-shows` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((x) => (
            <Button key={x.key} size="sm" variant={period === x.key ? "default" : "outline"} className="h-8" onClick={() => setPeriod(x.key)}>{x.label}</Button>
          ))}
        </div>
        {scope === "clinic" && doctors.length > 1 && (
          <select className={selectCls} value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} aria-label="Doctor">
            <option value="all">All doctors</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {friendlyDate(current.from)}{current.to !== current.from ? ` – ${friendlyDate(current.to)}` : ""}, compared with {friendlyDate(previous.from)}{previous.to !== previous.from ? ` – ${friendlyDate(previous.to)}` : ""}
      </p>

      {loading ? (
        <div className="flex items-center gap-2 py-16 justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {cards.map((c) => {
              const cur = k[c.key] as number | null;
              const prev = p[c.key] as number | null;
              const ch = change(cur, prev);
              const good = ch == null || ch === 0 ? null : c.lowerIsBetter ? ch < 0 : ch > 0;
              return (
                <Card key={c.key}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{cur == null ? "—" : c.fmt(cur)}</p>
                    <p className={`mt-1 flex items-center gap-1 text-xs ${good == null ? "text-muted-foreground" : good ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {ch == null || ch === 0 ? <Minus className="h-3 w-3" /> : ch > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {fmtPct(ch)} <span className="text-muted-foreground">vs previous</span>
                    </p>
                    {c.hint && <p className="text-[11px] text-muted-foreground">{c.hint}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Revenue</CardTitle></CardHeader>
            <CardContent>
              {k.visits === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No completed visits in this period.</p> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={12} />
                      <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                      <Tooltip formatter={(v: number, n: string) => (n === "revenue" ? [money(v), "Revenue"] : [v, "Visits"])} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {showClinic && (
              <TopList title="Revenue by doctor" rows={byDoctor.map((r) => ({ label: docName(r.key), count: r.count, revenue: r.revenue }))} />
            )}
            <TopList title="Top procedures" empty="No procedures recorded in this period." rows={topProc.map((r) => ({ label: names.proc[r.key] || "Procedure", count: r.count, revenue: r.revenue }))} />
            <TopList title="Top diagnoses (ICD)" empty="No diagnosis codes recorded in this period." rows={topIcd.map((r) => ({ label: names.icd[r.key] || "Diagnosis", count: r.count, revenue: r.revenue }))} />
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Busiest days</CardTitle></CardHeader>
              <CardContent>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdays} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v: number) => [v, "Visits"]} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="visits" fill="hsl(var(--primary) / 0.6)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground">Revenue: {REVENUE_DEFINITION} Still to collect counts visits where a part payment was entered.</p>
        </>
      )}
    </div>
  );
}

function TopList({ title, rows, empty }: { title: string; rows: { label: string; count: number; revenue: number }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.revenue));
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">{empty || "Nothing in this period."}</p> : (
          <ul className="space-y-2.5">
            {rows.map((r, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{r.label}</span>
                  <span className="shrink-0 tabular-nums font-medium">{money(r.revenue)} <span className="text-xs font-normal text-muted-foreground">· {r.count}</span></span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${(r.revenue / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
