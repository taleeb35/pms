// One calendar: appointments, leave days and private tasks merged per day.

export type CalAppt = {
  id: string; appointment_date: string; appointment_time: string | null; status: string;
  source?: string | null; lead_status?: string | null; patients?: { full_name?: string | null } | null;
};
export type CalLeave = { id: string; leave_date: string; leave_type: string | null; reason: string | null };
export type CalTask = { id: string; due_date: string; due_time: string | null; title: string; color: string; completed: boolean };

export type CalItem =
  | { kind: "appt"; id: string; time: string | null; title: string; status: string }
  | { kind: "task"; id: string; time: string | null; title: string; color: string; completed: boolean };

export type CalDay = { leave: CalLeave | null; items: CalItem[] };

// Public-profile requests that were never converted are leads, not appointments.
export const isUnconvertedLead = (a: Pick<CalAppt, "source" | "lead_status">) =>
  a.source === "public_profile" && (a.lead_status ?? "active") !== "converted";

export function buildCalendarDays(
  appts: CalAppt[], leaves: CalLeave[], tasks: CalTask[],
  show: { appts: boolean; leaves: boolean; tasks: boolean } = { appts: true, leaves: true, tasks: true },
): Map<string, CalDay> {
  const map = new Map<string, CalDay>();
  const day = (d: string) => { let v = map.get(d); if (!v) { v = { leave: null, items: [] }; map.set(d, v); } return v; };

  if (show.leaves) for (const l of leaves) day(l.leave_date).leave = l;
  if (show.appts) {
    for (const a of appts) {
      if (a.status === "cancelled" || isUnconvertedLead(a)) continue;
      day(a.appointment_date).items.push({ kind: "appt", id: a.id, time: a.appointment_time, title: a.patients?.full_name || "Patient", status: a.status });
    }
  }
  if (show.tasks) {
    for (const t of tasks) day(t.due_date).items.push({ kind: "task", id: t.id, time: t.due_time, title: t.title, color: t.color, completed: t.completed });
  }
  // Timed items in time order, untimed tasks after them.
  for (const v of map.values()) {
    v.items.sort((x, y) => (x.time || "99").localeCompare(y.time || "99") || (x.kind === y.kind ? 0 : x.kind === "appt" ? -1 : 1));
  }
  return map;
}

export const leaveLabel = (l: CalLeave) => (l.leave_type === "full_day" || !l.leave_type ? "On leave" : "Part-day leave");
