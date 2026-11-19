// Hourly cron (service role): email tomorrow's appointment reminders to patients with an email address.
// Who and when is decided in the database (due_email_reminders): 9 AM onwards in the doctor's time zone,
// only once per appointment (reminder_sent_at), and only where automatic reminders are switched on.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, authErrorResponse, requireServiceRole } from "../_shared/auth.ts";
import { emailLayout, esc } from "../_shared/emailLayout.ts";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const longDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const time12 = (t: string) => {
  const [h, m] = String(t).split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const drName = (n?: string | null) => n ? `Dr. ${String(n).replace(/^dr\.?\s+/i, "")}` : "your doctor";

serve(async (req: Request) => {
  try { requireServiceRole(req); } catch (e) { return authErrorResponse(e, {})!; }
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const admin = adminClient();
  try {
    const { data: due, error } = await admin.rpc("due_email_reminders");
    if (error) throw error;
    let sent = 0;
    const errors: string[] = [];
    for (const r of (due || []) as any[]) {
      const doctor = drName(r.doctor_name);
      const where = [r.location_name, r.location_address].filter(Boolean).join(", ");
      const html = emailLayout({
        label: "Appointment reminder",
        title: "Your appointment is tomorrow",
        intro: `Dear <strong>${esc(r.patient_name)}</strong>, this is a reminder of your appointment with <strong>${esc(doctor)}</strong>.`,
        rows: [
          ["Doctor", esc(doctor)],
          ["Date", esc(longDate(r.appointment_date))],
          ["Time", esc(time12(r.appointment_time))],
          ["Place", esc(where || r.practice_name)],
          ["Phone", esc(r.practice_phone)],
        ],
        note: "If you can't come, please call to cancel or change the time.",
        footer: `Sent by Zonoir for ${esc(r.practice_name)}. You received this because an appointment was booked with your email address.`,
      });
      const fromName = String(r.practice_name || "Zonoir").replace(/["<>\r\n]/g, "").slice(0, 60);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${fromName} via Zonoir <noreply@zonoir.com>`, to: [r.patient_email],
          subject: `Reminder: appointment with ${doctor} tomorrow at ${time12(r.appointment_time)}`, html,
        }),
      });
      if (res.ok) {
        await admin.from("appointments").update({ reminder_sent_at: new Date().toISOString() }).eq("id", r.appointment_id);
        sent++;
      } else {
        errors.push(`${r.appointment_id}: ${res.status}`);
      }
      await new Promise((ok) => setTimeout(ok, 600)); // stay under the email service's rate limit
    }
    console.log("appointment reminders", "due", (due || []).length, "sent", sent, "errors", errors.length);
    return json(200, { success: true, due: (due || []).length, sent, errors });
  } catch (e) {
    console.error("send-appointment-reminders", e);
    return json(500, { error: (e as Error).message });
  }
});
