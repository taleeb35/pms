// Pure billing helpers (no Supabase import, so tests can use them).
/** Whole days left in the trial (0 on the last day, negative once over). */
export function trialDaysLeft(trialEnd: string | null): number | null {
  if (!trialEnd) return null;
  const end = new Date(`${trialEnd}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86400000);
}

export const STATUS_LABEL: Record<string, string> = {
  none: "Not subscribed",
  trialing: "Subscribed (trial)",
  active: "Active",
  past_due: "Payment failed",
  unpaid: "Unpaid",
  canceled: "Cancelled",
  incomplete: "Payment not completed",
  incomplete_expired: "Payment not completed",
  paused: "Paused",
};
