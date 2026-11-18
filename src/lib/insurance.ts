// F7: insurance claim statuses and totals.
export type ClaimStatus = "draft" | "submitted" | "approved" | "partly_approved" | "rejected" | "paid";

export const CLAIM_STATUSES: { value: ClaimStatus; label: string; tone: string }[] = [
  { value: "draft", label: "Draft", tone: "bg-muted text-muted-foreground" },
  { value: "submitted", label: "Submitted", tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { value: "approved", label: "Approved", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { value: "partly_approved", label: "Part approved", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: "rejected", label: "Rejected", tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  { value: "paid", label: "Paid", tone: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-200" },
];
export const claimStatus = (s: string) => CLAIM_STATUSES.find((x) => x.value === s) || CLAIM_STATUSES[0];

export type Claim = {
  id: string; doctor_id: string; patient_id: string; appointment_id: string | null; insurer: string; policy_number: string | null;
  claim_reference: string | null; amount_claimed: number; amount_approved: number | null; status: ClaimStatus;
  submitted_at: string | null; decided_at: string | null; notes: string | null; created_at: string;
};

const n = (v: unknown) => Number(v) || 0;

// Waiting = submitted and not decided. Expected = approved (or part approved) but not paid yet.
export function claimTotals(claims: Pick<Claim, "status" | "amount_claimed" | "amount_approved">[]) {
  const t = { count: claims.length, claimed: 0, waiting: 0, expected: 0, paid: 0, rejected: 0 };
  for (const c of claims) {
    t.claimed += n(c.amount_claimed);
    if (c.status === "submitted") t.waiting += n(c.amount_claimed);
    if (c.status === "approved" || c.status === "partly_approved") t.expected += c.amount_approved == null ? n(c.amount_claimed) : n(c.amount_approved);
    if (c.status === "paid") t.paid += c.amount_approved == null ? n(c.amount_claimed) : n(c.amount_approved);
    if (c.status === "rejected") t.rejected += n(c.amount_claimed);
  }
  return t;
}
