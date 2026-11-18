// E2: private, read-only calendar feed (iCalendar) for a doctor. Google Calendar, Outlook and Apple Calendar
// subscribe to https://app.zonoir.com/functions/v1/calendar-feed?token=... and refresh it themselves.
// The token is the only permission. Patient names are left out unless the doctor turned them on.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient } from "../_shared/auth.ts";

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const fold = (line: string) => {
  const out: string[] = [];
  let s = line;
  while (s.length > 74) { out.push(s.slice(0, 74)); s = " " + s.slice(74); }
  out.push(s);
  return out.join("\r\n");
};

// Local wall-clock time in a timezone -> UTC Date.
function zonedToUtc(ymd: string, hms: string, tz: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm, ss] = (hms || "00:00:00").split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm || 0, ss || 0);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .formatToParts(new Date(guess)).reduce((a: Record<string, string>, p) => { a[p.type] = p.value; return a; }, {});
  const asLocal = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
  return new Date(guess - (asLocal - guess));
}

const addDays = (ymd: string, n: number) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

serve(async (req: Request) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  if (token.length < 40 || !/^[0-9a-f]+$/.test(token)) return new Response("Not found", { status: 404 });

  const admin = adminClient();
  const { data: link } = await admin.from("doctor_calendar_links").select("doctor_id").eq("token", token).maybeSingle();
  if (!link) return new Response("Not found", { status: 404 });
  const { data: doc } = await admin.from("doctors").select("id, timezone, calendar_show_names, profiles(full_name)").eq("id", link.doctor_id).maybeSingle();
  if (!doc) return new Response("Not found", { status: 404 });

  const tz = (doc as any).timezone || "Asia/Karachi";
  const today = new Date().toISOString().slice(0, 10);
  const from = addDays(today, -30), to = addDays(today, 180);
  const showNames = !!(doc as any).calendar_show_names;

  const [{ data: appts }, { data: leaves }] = await Promise.all([
    admin.from("appointments").select("id, appointment_date, appointment_time, duration_minutes, status, source, lead_status, appointment_type, updated_at, patients(full_name)")
      .eq("doctor_id", doc.id).gte("appointment_date", from).lte("appointment_date", to).neq("status", "cancelled").limit(5000),
    admin.from("doctor_leaves").select("id, leave_date, leave_type, reason").eq("doctor_id", doc.id).gte("leave_date", from).lte("leave_date", to),
  ]);

  const now = stamp(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Zonoir//Appointments//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(`Zonoir · ${(doc as any).profiles?.full_name || "Appointments"}`)}`, `X-WR-TIMEZONE:${tz}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H",
  ];

  for (const a of (appts || []) as any[]) {
    if (a.source === "public_profile" && (a.lead_status ?? "active") !== "converted") continue;
    if (!a.appointment_time) continue;
    const start = zonedToUtc(a.appointment_date, a.appointment_time, tz);
    const end = new Date(start.getTime() + (Number(a.duration_minutes) || 30) * 60000);
    const who = showNames ? (a.patients?.full_name || "Patient") : "Patient";
    const statusLabel = a.status === "completed" ? " (done)" : a.status === "no_show" ? " (no-show)" : "";
    lines.push("BEGIN:VEVENT", `UID:appt-${a.id}@zonoir`, `DTSTAMP:${now}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
      fold(`SUMMARY:${esc(`${who}${statusLabel}`)}`), fold(`URL:https://app.zonoir.com/doctor/appointments/${a.id}`),
      `LAST-MODIFIED:${stamp(new Date(a.updated_at || Date.now()))}`, "END:VEVENT");
  }
  for (const l of (leaves || []) as any[]) {
    const d0 = l.leave_date.replace(/-/g, ""), d1 = addDays(l.leave_date, 1).replace(/-/g, "");
    lines.push("BEGIN:VEVENT", `UID:leave-${l.id}@zonoir`, `DTSTAMP:${now}`, `DTSTART;VALUE=DATE:${d0}`, `DTEND;VALUE=DATE:${d1}`,
      fold(`SUMMARY:${esc(l.leave_type === "full_day" || !l.leave_type ? "On leave" : "Part-day leave")}`), "TRANSP:TRANSPARENT", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=900", "Content-Disposition": 'inline; filename="zonoir.ics"' },
  });
});
