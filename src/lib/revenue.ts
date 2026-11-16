// B2: one revenue definition used by Finance, Reports and Dashboard.
//   Revenue counts COMPLETED appointments only.
//   Gross = consultation + procedure + other fees.
//   Net   = gross - discount/refund.
// (The stored total_fee column is calculated by the database as consultation + other fee only,
// so it misses procedure fees and discounts. Always use grossFee()/netFee() below.)

type FeeRow = {
  status?: string | null;
  consultation_fee?: number | string | null;
  procedure_fee?: number | string | null;
  other_fee?: number | string | null;
  refund?: number | string | null;
};

const n = (v: unknown) => Number(v) || 0;

export const REVENUE_DEFINITION = "Completed appointments: consultation + procedure + other fees, minus discounts.";

export const isRevenueAppointment = (a: FeeRow) => a?.status === "completed";
export const grossFee = (a: FeeRow) => n(a.consultation_fee) + n(a.procedure_fee) + n(a.other_fee);
export const refundOf = (a: FeeRow) => n(a.refund);
export const netFee = (a: FeeRow) => grossFee(a) - refundOf(a);

/** Percentage change, or null when there is no previous value to compare with. */
export const pctChange = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

/** "+12.5%", "-3.0%" or "—" when there is nothing to compare with. */
export const fmtPct = (x: number | null | undefined): string =>
  x == null || !Number.isFinite(x) ? "—" : `${x >= 0 ? "+" : ""}${x.toFixed(1)}%`;

// F3: what the patient still owes for a visit. amount_paid empty = paid in full (every visit before part
// payments were recorded), so only visits where someone typed a smaller amount show a balance.
// Cancelled and no-show visits never owe anything.
export const balanceDue = (a: FeeRow & { amount_paid?: number | string | null }) => {
  if (a.amount_paid === null || a.amount_paid === undefined || a.amount_paid === "") return 0;
  if (a.status === "cancelled" || a.status === "no_show") return 0;
  return Math.max(0, Math.round((netFee(a) - n(a.amount_paid)) * 100) / 100);
};
