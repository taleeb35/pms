// Tags shown on appointment lists, worked out from what has already happened for the visit.
export type TagKey = "online_booking" | "intake_sent" | "intake_signed" | "lab_ordered" | "invoice_shared" | "insurance_claim" | "review_asked";

export const TAGS: { key: TagKey; label: string; cls: string }[] = [
  { key: "online_booking", label: "Online booking", cls: "border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
  { key: "intake_sent", label: "Intake sent", cls: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  { key: "intake_signed", label: "Intake signed", cls: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  { key: "lab_ordered", label: "Lab ordered", cls: "border-violet-300 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  { key: "invoice_shared", label: "Invoice shared", cls: "border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300" },
  { key: "insurance_claim", label: "Insurance claim", cls: "border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  { key: "review_asked", label: "Review asked", cls: "border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300" },
];
const ORDER = new Map(TAGS.map((t, i) => [t.key, i]));

/** Tags kept outside the appointments table, by appointment id (intake forms, lab orders, claims). */
export type TagExtras = Map<string, Set<TagKey>>;

type ApptLike = {
  id: string;
  status?: string | null;
  source?: string | null;
  review_requested_at?: string | null;
  invoice_token?: string | null;
};

export function tagsFor(apt: ApptLike, extras?: TagExtras): TagKey[] {
  const out = new Set<TagKey>(extras?.get(apt.id) || []);
  if (apt.source === "public_profile") out.add("online_booking");
  if (apt.review_requested_at) out.add("review_asked");
  if (apt.invoice_token) out.add("invoice_shared");
  if (out.has("intake_signed")) out.delete("intake_sent");
  return [...out].sort((a, b) => (ORDER.get(a) ?? 0) - (ORDER.get(b) ?? 0));
}

export const TAG_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All tags" },
  ...TAGS.map((t) => ({ value: t.key, label: t.label })),
  { value: "no_review", label: "Completed, review not asked" },
  { value: "no_intake", label: "Upcoming, no intake form" },
];

export function matchesTagFilter(apt: ApptLike, tags: TagKey[], filter: string): boolean {
  if (!filter || filter === "all") return true;
  if (filter === "no_review") return apt.status === "completed" && !tags.includes("review_asked");
  if (filter === "no_intake") return apt.status === "scheduled" && !tags.includes("intake_sent") && !tags.includes("intake_signed");
  return tags.includes(filter as TagKey);
}
