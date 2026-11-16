// Lab and imaging orders: common tests, and turning results into trend lines.

export type LabKind = "lab" | "imaging";
export type CommonTest = { name: string; kind: LabKind; unit?: string };

// Common tests offered as suggestions. Doctors can type any other test name.
export const COMMON_TESTS: CommonTest[] = [
  { name: "Fasting blood sugar", kind: "lab", unit: "mg/dL" },
  { name: "Random blood sugar", kind: "lab", unit: "mg/dL" },
  { name: "HbA1c", kind: "lab", unit: "%" },
  { name: "CBC", kind: "lab" },
  { name: "Hemoglobin", kind: "lab", unit: "g/dL" },
  { name: "Lipid profile", kind: "lab" },
  { name: "Total cholesterol", kind: "lab", unit: "mg/dL" },
  { name: "LFT", kind: "lab" },
  { name: "RFT", kind: "lab" },
  { name: "Serum creatinine", kind: "lab", unit: "mg/dL" },
  { name: "TSH", kind: "lab", unit: "mIU/L" },
  { name: "Vitamin D", kind: "lab", unit: "ng/mL" },
  { name: "Urine R/E", kind: "lab" },
  { name: "ESR", kind: "lab", unit: "mm/hr" },
  { name: "CRP", kind: "lab", unit: "mg/L" },
  { name: "Uric acid", kind: "lab", unit: "mg/dL" },
  { name: "X-ray chest", kind: "imaging" },
  { name: "Ultrasound abdomen", kind: "imaging" },
  { name: "ECG", kind: "imaging" },
  { name: "Echocardiography", kind: "imaging" },
  { name: "CT scan", kind: "imaging" },
  { name: "MRI", kind: "imaging" },
];

export const findCommonTest = (name: string) =>
  COMMON_TESTS.find((t) => t.name.toLowerCase() === name.trim().toLowerCase());

export type LabOrder = {
  id: string; doctor_id: string; patient_id: string; appointment_id: string | null;
  kind: LabKind; test_name: string; notes: string | null; status: "ordered" | "done" | "cancelled";
  result_value: number | null; result_unit: string | null; result_text: string | null;
  result_file: string | null; result_date: string | null; ordered_at: string;
};

export type TrendPoint = { date: string; value: number; value2?: number };
export type Trend = { key: string; label: string; unit: string; points: TrendPoint[]; series2?: string };

// "120/80", "120\80", "120 / 80 mmHg" -> [120, 80]. Anything else -> null.
export function parseBP(raw: string | null | undefined): [number, number] | null {
  if (!raw) return null;
  const m = String(raw).match(/(\d{2,3})\s*[/\\-]\s*(\d{2,3})/);
  if (!m) return null;
  const sys = Number(m[1]), dia = Number(m[2]);
  if (sys < 50 || sys > 260 || dia < 30 || dia > 180) return null;
  return [sys, dia];
}

// "72 kg", "72.5" -> 72.5
export function parseNumber(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const m = String(raw).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

const dayOf = (iso: string) => iso.slice(0, 10);

// Repeat tests with numbers become trend lines (two or more results), plus blood pressure and
// weight from visit vitals. Newest results last so the chart reads left to right.
export function buildTrends(
  orders: Pick<LabOrder, "test_name" | "status" | "result_value" | "result_unit" | "result_date" | "ordered_at">[],
  visits: { visit_date: string; blood_pressure?: string | null; weight?: string | null }[] = [],
): Trend[] {
  const out: Trend[] = [];

  const bp = visits
    .map((v) => ({ date: dayOf(v.visit_date), bp: parseBP(v.blood_pressure) }))
    .filter((v): v is { date: string; bp: [number, number] } => !!v.bp)
    .map((v) => ({ date: v.date, value: v.bp[0], value2: v.bp[1] }))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (bp.length >= 2) out.push({ key: "bp", label: "Blood pressure", unit: "mmHg", points: bp, series2: "Diastolic" });

  const byTest = new Map<string, { label: string; unit: string; points: TrendPoint[] }>();
  for (const o of orders) {
    if (o.status !== "done" || o.result_value === null || o.result_value === undefined || Number.isNaN(Number(o.result_value))) continue;
    const key = o.test_name.trim().toLowerCase();
    const g = byTest.get(key) || { label: o.test_name.trim(), unit: o.result_unit || "", points: [] };
    if (!g.unit && o.result_unit) g.unit = o.result_unit;
    g.points.push({ date: o.result_date || dayOf(o.ordered_at), value: Number(o.result_value) });
    byTest.set(key, g);
  }
  for (const [key, g] of byTest) {
    if (g.points.length < 2) continue;
    g.points.sort((a, b) => a.date.localeCompare(b.date));
    out.push({ key: `t:${key}`, label: g.label, unit: g.unit, points: g.points });
  }

  const wt = visits
    .map((v) => ({ date: dayOf(v.visit_date), value: parseNumber(v.weight) }))
    .filter((v): v is TrendPoint => v.value !== null && v.value > 0 && v.value < 400)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (wt.length >= 2) out.push({ key: "weight", label: "Weight", unit: "kg", points: wt });

  return out;
}
