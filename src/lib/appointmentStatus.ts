import { zonedNow } from "@/lib/region";
// B8: appointments whose time has passed but are still "scheduled"/"start"
// are flagged as needing a status update (completed, cancelled or no-show).
const GRACE_MINUTES = 60;

type ApptLike = { status?: string | null; appointment_date?: string | null; appointment_time?: string | null };

export function needsStatusUpdate(a: ApptLike, now: Date = zonedNow().asLocalDate): boolean {
  if (!a || (a.status !== "scheduled" && a.status !== "start") || !a.appointment_date) return false;
  const time = (a.appointment_time || "23:59:00").slice(0, 8);
  const when = new Date(`${a.appointment_date}T${time.length === 5 ? time + ":00" : time}`);
  if (isNaN(when.getTime())) return false;
  return now.getTime() - when.getTime() > GRACE_MINUTES * 60 * 1000;
}

export const NO_SHOW_BADGE = { label: "No-show", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" };
export const NEEDS_UPDATE_BADGE = { label: "Needs update", className: "bg-amber-500/10 text-amber-600 border-amber-500/30" };

/** Initial status filter from the URL, e.g. /doctor/appointments?status=needs_update */
export const initialStatusFilter = (): string => {
  if (typeof window === "undefined") return "all";
  return new URLSearchParams(window.location.search).get("status") || "all";
};
