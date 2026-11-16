import { useState } from "react";
import { DatabaseBackup, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { downloadSheets, type Sheet, type SheetRow } from "@/lib/exportSheet";
import { logActivity } from "@/lib/activityLogger";

// "Download all my data": every record the account owns, one Excel sheet per kind of record.
// Doctor: their own patients, visits and lists. Clinic owner: the same for every doctor in the clinic,
// plus the clinic's expenses and lists (confidential notes are left out, as the clinic can't see them in the app).
type Scope = "doctor" | "clinic";
const PAGE = 1000;
const MAX_CELL = 32000; // Excel's limit per cell is 32,767 characters

const cell = (v: unknown): string | number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > MAX_CELL ? s.slice(0, MAX_CELL) + "…" : s;
};

async function fetchAll(table: string, filter: (q: any) => any, select = "*"): Promise<any[]> {
  const out: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const q = filter((supabase as any).from(table).select(select)).order("id").range(from, from + PAGE - 1);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

export default function DataExportCard({ scope }: { scope: Scope }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");

  const run = async () => {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");

      // Which doctors' records belong to this account
      setStep("Finding doctors");
      let doctorIds = [user.id];
      if (scope === "clinic") {
        const docs = await fetchAll("doctors", (q) => q.eq("clinic_id", user.id), "id");
        doctorIds = docs.map((d) => d.id);
      }
      const names: Record<string, string> = {};
      for (const part of chunk(doctorIds, 200)) {
        const { data } = await supabase.from("profiles").select("id, full_name").in("id", part);
        (data || []).forEach((p: any) => { names[p.id] = p.full_name || ""; });
      }
      const byDoctor = (q: any) => q.in("doctor_id", doctorIds.length ? doctorIds : ["00000000-0000-0000-0000-000000000000"]);
      const hideConfidential = scope === "clinic";
      const strip = (r: any) => { if (hideConfidential) { delete r.confidential_notes; } return r; };

      setStep("Patients");
      const patients = doctorIds.length ? await fetchAll("patients", (q) => q.in("created_by", doctorIds)) : [];
      const patientName: Record<string, string> = {};
      patients.forEach((p) => { patientName[p.id] = p.full_name; });

      const withNames = (rows: any[]) => rows.map((r) => {
        const o: SheetRow = {};
        if ("patient_id" in r && typeof r.patient_id === "string" && patientName[r.patient_id] !== undefined) o["Patient"] = patientName[r.patient_id];
        if (scope === "clinic" && r.doctor_id) o["Doctor"] = names[r.doctor_id] || "";
        for (const [k, v] of Object.entries(strip({ ...r }))) o[k] = cell(v);
        return o;
      });

      const sheets: Sheet[] = [];
      sheets.push({ name: "Patients", rows: patients.map((p) => {
        const o: SheetRow = {};
        if (scope === "clinic") o["Doctor"] = names[p.created_by] || "";
        for (const [k, v] of Object.entries(strip({ ...p }))) o[k] = cell(v);
        return o;
      }) });

      const doctorTables: [string, string][] = [
        ["appointments", "Appointments"],
        ["visit_records", "Visit records"],
        ["appointment_prescribed_medicines", "Prescribed medicines"],
        ["medical_records", "Medical records"],
        ["prescriptions", "Prescriptions"],
        ["wait_list", "Waitlist"],
        ["procedures", "Procedures"],
        ["doctor_schedules", "Schedules"],
        ["doctor_leaves", "Leaves"],
        ["doctor_medicines", "Medicine list"],
        ["doctor_diseases", "Disease list"],
        ["doctor_allergies", "Allergy list"],
        ["doctor_icd_codes", "ICD codes"],
      ];
      for (const [table, label] of doctorTables) {
        setStep(label);
        const rows = doctorIds.length ? await fetchAll(table, byDoctor) : [];
        sheets.push({ name: label, rows: withNames(rows) });
      }

      if (scope === "clinic") {
        const clinicTables: [string, string][] = [
          ["clinic_expenses", "Expenses"],
          ["clinic_medicines", "Clinic medicines"],
          ["clinic_diseases", "Clinic diseases"],
          ["clinic_allergies", "Clinic allergies"],
          ["clinic_icd_codes", "Clinic ICD codes"],
        ];
        for (const [table, label] of clinicTables) {
          setStep(label);
          const rows = await fetchAll(table, (q) => q.eq("clinic_id", user.id));
          sheets.push({ name: label, rows: withNames(rows) });
        }
        sheets.unshift({ name: "Doctors", rows: doctorIds.map((id) => ({ id, Name: names[id] || "" })) });
      }

      setStep("Building file");
      const total = sheets.reduce((n, s) => n + s.rows.length, 0);
      const about: Sheet = { name: "About", rows: [
        { Item: "Exported", Value: format(new Date(), "PPpp") },
        { Item: "Account", Value: user.email || user.id },
        { Item: "Records", Value: total },
        { Item: "Note", Value: "One sheet per kind of record. Uploaded files (reports, scans) are not included; download them from each patient." },
      ] };
      await downloadSheets(`Zonoir_data_${format(new Date(), "yyyy-MM-dd")}`, [about, ...sheets]);
      toast({ title: "Your data is downloaded", description: `${total.toLocaleString()} records in ${sheets.length} sheets.` });
      try { await logActivity({ action: "data_exported", entityType: "account", entityId: user.id, details: { records: total } }); } catch { /* best effort */ }
    } catch (e: any) {
      toast({ title: "Could not download your data", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><DatabaseBackup className="h-5 w-5" /> Download all my data</CardTitle>
        <CardDescription>
          {scope === "clinic"
            ? "One Excel file with every patient, appointment, visit and prescription for all your doctors, plus expenses and your clinic lists."
            : "One Excel file with every patient, appointment, visit and prescription in your account, plus your lists and schedule."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseBackup className="h-4 w-4" />}
          {busy ? "Preparing…" : "Download Excel"}
        </Button>
        {busy && step && <span className="text-sm text-muted-foreground">{step}…</span>}
      </CardContent>
    </Card>
  );
}
