// B2: one revenue definition used by Finance, Reports and Dashboard.
//   Revenue counts COMPLETED appointments only.
//   Gross = consultation + procedure + other fees.
//   Net   = gross - discount/refund.
// (total_fee is stored already net of the refund, so it must not be reduced by the refund again.)

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
