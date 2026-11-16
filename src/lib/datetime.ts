// Readable appointment dates and times, e.g. "Today", "Tomorrow", "Fri, 14 Nov" and "9:45 PM".
// Appointment dates/times are the clinic's local wall-clock values, so they're parsed without timezone shifts.
import { zonedNow } from "@/lib/region";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const parseYmd = (ymd?: string | null) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || "");
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

/** "Today", "Tomorrow", "Yesterday", "Fri, 14 Nov" (this year) or "14 Nov 2025". */
export function friendlyDate(ymd?: string | null): string {
  const d = parseYmd(ymd);
  if (!d) return ymd || "";
  const today = parseYmd(zonedNow().ymd)!;
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.getFullYear() === today.getFullYear()
    ? `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
    : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "21:45:00" -> "9:45 PM". */
export function friendlyTime(hms?: string | null): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(hms || "");
  if (!m) return hms || "";
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}
