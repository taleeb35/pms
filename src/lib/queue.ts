// Helpers for the waiting-room queue screen.

// "Ayesha Khan" -> "Ayesha K." (enough for a patient to recognise themselves, little for others)
export const shortName = (full?: string | null) => {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

// Token numbers follow the day's order: appointment time, then when it was booked. Cancelled visits get none.
export function assignTokens<T extends { appointment_time: string | null; created_at: string; status: string }>(rows: T[]) {
  const sorted = [...rows].filter((r) => r.status !== "cancelled")
    .sort((a, b) => (a.appointment_time || "99").localeCompare(b.appointment_time || "99") || a.created_at.localeCompare(b.created_at));
  return sorted.map((r, i) => ({ ...r, token: i + 1 }));
}
