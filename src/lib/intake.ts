// Pre-visit intake form: the questions, the default consent text and the link sent to the patient.

export const INTAKE_QUESTIONS: { key: string; label: string; rows: number }[] = [
  { key: "reason", label: "Main reason for your visit", rows: 2 },
  { key: "conditions", label: "Ongoing health conditions", rows: 2 },
  { key: "medicines", label: "Medicines you take now", rows: 2 },
  { key: "allergies", label: "Allergies (medicines, food, other)", rows: 2 },
  { key: "surgeries", label: "Past operations or hospital stays", rows: 2 },
  { key: "family", label: "Health conditions in your family", rows: 2 },
  { key: "notes", label: "Anything else the doctor should know", rows: 3 },
];

export const DEFAULT_CONSENT =
  "I confirm that the information I have given is correct to the best of my knowledge, and I agree to be examined and treated.";

export const intakeUrl = (token: string) => `${window.location.origin}/intake/${token}`;

export type IntakeAnswers = Record<string, string>;

// "Monday 16 November" — a real date, never "Today", because the patient may read it on another day.
export function visitDay(ymd?: string | null): string {
  if (!ymd) return "";
  const [y, m, d] = ymd.slice(0, 10).split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

// Doctor and clinic for the patient's page; the clinic alone when its name already contains the doctor's.
export function whoLabel(doctor?: string | null, clinic?: string | null): string {
  const d = (doctor || "").trim(), c = (clinic || "").trim();
  if (d && c && c.toLowerCase().includes(d.toLowerCase())) return c;
  return [d, c].filter(Boolean).join(", ");
}

// Trim answers, drop empty ones and anything that is not a known question; cap each at 2,000 characters.
export function cleanAnswers(raw: Record<string, unknown>): IntakeAnswers {
  const out: IntakeAnswers = {};
  for (const q of INTAKE_QUESTIONS) {
    const v = raw[q.key];
    if (typeof v !== "string") continue;
    const t = v.trim().slice(0, 2000);
    if (t) out[q.key] = t;
  }
  return out;
}

const NONE = /^(none|no|nil|n\/a|na|nothing|-)\.?$/i;

// Allergies from the form that the patient record does not already mention.
export function newAllergies(answer: string | undefined, existing: string | null | undefined): string {
  if (!answer || NONE.test(answer.trim())) return "";
  const have = (existing || "").toLowerCase();
  return answer
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s && !NONE.test(s) && !have.includes(s.toLowerCase()))
    .join(", ");
}
