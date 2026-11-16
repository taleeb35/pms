// Reports overview: the numbers for a chosen period, compared with the period before it.
// Uses the same revenue rules as Finance (lib/revenue): completed visits, consultation + procedure + other, minus discounts.
import { balanceDue, grossFee, isRevenueAppointment, netFee, pctChange } from "@/lib/revenue";

export type PeriodKey = "today" | "7d" | "30d" | "month" | "last_month" | "90d" | "year";
export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "90d", label: "Last 90 days" },
  { key: "year", label: "This year" },
];

export type Range = { from: string; to: string }; // inclusive yyyy-mm-dd

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const daysIn = (r: Range) => Math.round((parse(r.to).getTime() - parse(r.from).getTime()) / 86400000) + 1;

// The period, and the same-length period just before it (for "vs previous").
export function periodRange(key: PeriodKey, today: Date = new Date()): { current: Range; previous: Range } {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let from: Date, to: Date = t;
  switch (key) {
    case "today": from = t; break;
    case "7d": from = addDays(t, -6); break;
    case "30d": from = addDays(t, -29); break;
    case "90d": from = addDays(t, -89); break;
    case "month": from = new Date(t.getFullYear(), t.getMonth(), 1); break;
    case "last_month": from = new Date(t.getFullYear(), t.getMonth() - 1, 1); to = new Date(t.getFullYear(), t.getMonth(), 0); break;
    case "year": from = new Date(t.getFullYear(), 0, 1); break;
  }
  if (key === "month" || key === "last_month") {
    // Compare with the whole previous calendar month (to the same day for "this month").
    const pFrom = new Date(from.getFullYear(), from.getMonth() - 1, 1);
    const pEndFull = new Date(from.getFullYear(), from.getMonth(), 0);
    const pTo = key === "month" ? new Date(pFrom.getFullYear(), pFrom.getMonth(), Math.min(t.getDate(), pEndFull.getDate())) : pEndFull;
    return { current: { from: ymd(from), to: ymd(to) }, previous: { from: ymd(pFrom), to: ymd(pTo) } };
  }
  if (key === "year") {
    const pFrom = new Date(t.getFullYear() - 1, 0, 1);
    const pTo = new Date(t.getFullYear() - 1, t.getMonth(), t.getDate());
    return { current: { from: ymd(from), to: ymd(to) }, previous: { from: ymd(pFrom), to: ymd(pTo) } };
  }
  const len = daysIn({ from: ymd(from), to: ymd(to) });
  return { current: { from: ymd(from), to: ymd(to) }, previous: { from: ymd(addDays(from, -len)), to: ymd(addDays(from, -1)) } };
}

export type OvAppt = {
  appointment_date: string; status: string; patient_id: string; doctor_id?: string | null;
  consultation_fee?: number | null; other_fee?: number | null; procedure_fee?: number | null; refund?: number | null;
  amount_paid?: number | null; procedure_id?: string | null; icd_code_id?: string | null;
  source?: string | null; lead_status?: string | null;
};

export type Kpis = {
  revenue: number; collected: number; due: number; visits: number; booked: number; noShows: number; cancelled: number;
  noShowRate: number | null; avgFee: number | null; patientsSeen: number; newPatients: number; expenses: number; profit: number;
};

const inRange = (d: string, r: Range) => d >= r.from && d <= r.to;
const isLead = (a: OvAppt) => a.source === "public_profile" && (a.lead_status ?? "active") !== "converted";

export function kpis(appts: OvAppt[], r: Range, newPatients: number, expenses = 0): Kpis {
  const list = appts.filter((a) => inRange(a.appointment_date, r) && !isLead(a));
  const done = list.filter(isRevenueAppointment);
  const revenue = done.reduce((s, a) => s + netFee(a), 0);
  const due = done.reduce((s, a) => s + balanceDue(a), 0);
  const noShows = list.filter((a) => a.status === "no_show").length;
  const cancelled = list.filter((a) => a.status === "cancelled").length;
  const decided = done.length + noShows;
  return {
    revenue, collected: revenue - due, due, visits: done.length, booked: list.length - cancelled, noShows, cancelled,
    noShowRate: decided ? (noShows / decided) * 100 : null,
    avgFee: done.length ? revenue / done.length : null,
    patientsSeen: new Set(done.map((a) => a.patient_id)).size,
    newPatients, expenses, profit: revenue - expenses,
  };
}

export const change = (cur: number | null, prev: number | null) => (cur == null || prev == null ? null : pctChange(cur, prev));

// Revenue per day (short periods), per week (up to ~4 months) or per month (longer).
export type TrendPoint = { key: string; label: string; revenue: number; visits: number };
export function revenueTrend(appts: OvAppt[], r: Range): TrendPoint[] {
  const len = daysIn(r);
  const unit: "day" | "week" | "month" = len <= 45 ? "day" : len <= 130 ? "week" : "month";
  const keyOf = (s: string) => {
    if (unit === "day") return s;
    if (unit === "month") return s.slice(0, 7);
    const d = parse(s); const monday = addDays(d, -((d.getDay() + 6) % 7)); return ymd(monday < parse(r.from) ? parse(r.from) : monday);
  };
  const buckets = new Map<string, TrendPoint>();
  // Pre-fill so gaps show as zero.
  for (let d = parse(r.from); d <= parse(r.to); d = addDays(d, 1)) {
    const k = keyOf(ymd(d));
    if (!buckets.has(k)) buckets.set(k, { key: k, label: labelFor(k, unit), revenue: 0, visits: 0 });
  }
  for (const a of appts) {
    if (!inRange(a.appointment_date, r) || !isRevenueAppointment(a) || isLead(a)) continue;
    const b = buckets.get(keyOf(a.appointment_date));
    if (b) { b.revenue += netFee(a); b.visits += 1; }
  }
  return [...buckets.values()];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function labelFor(k: string, unit: "day" | "week" | "month") {
  if (unit === "month") { const [y, m] = k.split("-").map(Number); return `${MONTHS[m - 1]} ${String(y).slice(2)}`; }
  const d = parse(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// Top items by revenue or count (procedures, diagnoses, doctors).
export function topBy(appts: OvAppt[], r: Range, keyFn: (a: OvAppt) => string | null | undefined, n = 5) {
  const m = new Map<string, { key: string; count: number; revenue: number }>();
  for (const a of appts) {
    if (!inRange(a.appointment_date, r) || !isRevenueAppointment(a) || isLead(a)) continue;
    const k = keyFn(a); if (!k) continue;
    const v = m.get(k) || { key: k, count: 0, revenue: 0 };
    v.count += 1; v.revenue += netFee(a); m.set(k, v);
  }
  return [...m.values()].sort((x, y) => y.revenue - x.revenue || y.count - x.count).slice(0, n);
}

// Visits by weekday (Mon..Sun) for the period.
export function byWeekday(appts: OvAppt[], r: Range) {
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const out = names.map((label) => ({ label, visits: 0 }));
  for (const a of appts) {
    if (!inRange(a.appointment_date, r) || !isRevenueAppointment(a) || isLead(a)) continue;
    out[(parse(a.appointment_date).getDay() + 6) % 7].visits += 1;
  }
  return out;
}

export { grossFee };
