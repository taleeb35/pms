// D1 appointment reminders and D8 follow-up (recall) messages: who to contact and what to send.

export type ReminderAppt = {
  id: string; appointment_date: string; appointment_time: string | null; status: string; doctor_id: string;
  reminder_sent_at: string | null; source?: string | null; lead_status?: string | null;
  patients?: { id?: string; full_name?: string | null; phone?: string | null } | null;
};

export type DueVisit = {
  id: string; patient_id: string; doctor_id: string; appointment_id: string | null; visit_date: string;
  next_visit_date: string; next_visit_notes: string | null; recall_sent_at: string | null;
};

export const firstName = (full?: string | null) => (full || "").trim().split(/\s+/)[0] || "";

export function reminderText(o: { patient?: string | null; doctor?: string | null; day: string; time?: string | null }) {
  return `Hello ${firstName(o.patient)}, this is a reminder of your appointment${o.doctor ? ` with ${o.doctor}` : ""} on ${o.day}${o.time ? ` at ${o.time}` : ""}. Please reply if you need to change it.`;
}

export function followUpText(o: { patient?: string | null; doctor?: string | null; day: string }) {
  return `Hello ${firstName(o.patient)}, ${o.doctor || "your doctor"} asked to see you again around ${o.day}. Please reply or call us to book your follow-up visit.`;
}

// Appointments that need a reminder: booked (scheduled) for the day, not leads that were never converted.
export const needsReminder = (a: ReminderAppt) =>
  a.status === "scheduled" && !(a.source === "public_profile" && (a.lead_status ?? "active") !== "converted");

// A follow-up is still due when the patient has no later appointment with that doctor
// (anything after the visit that is not cancelled counts as booked).
export function dueFollowUps(visits: DueVisit[], laterAppts: { patient_id: string; doctor_id: string; appointment_date: string; status: string; id: string }[]) {
  return visits.filter((v) => !laterAppts.some((a) =>
    a.patient_id === v.patient_id && a.doctor_id === v.doctor_id && a.status !== "cancelled" &&
    a.id !== v.appointment_id && a.appointment_date > v.visit_date.slice(0, 10)));
}
