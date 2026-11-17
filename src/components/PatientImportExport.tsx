import { useMemo, useRef, useState } from "react";
import { Download, Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { idLabel } from "@/lib/region";
import { downloadSheets } from "@/lib/exportSheet";
import {
  FIELDS, detectDateOrder, dryRun, guessMapping, keyOf, personKey,
  type DateOrder, type DryRun, type FieldKey, type ImportOptions, type Mapping, type RowResult,
} from "@/lib/patientImport";

// Import patients from a CSV or Excel file (including exports from other clinic systems):
// 1 choose file, 2 match columns, 3 dry run that shows what will happen, 4 import.
interface Props {
  createdBy: string;
  onImportComplete: () => void;
  doctors?: { id: string; name: string }[]; // clinics choose which doctor the patients belong to
}

type Step = "map" | "check" | "done";
const selectCls = "flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm";
const CHUNK = 200;

const SAMPLE = [
  { full_name: "John Doe", phone: "03001234567", gender: "male", date_of_birth: "15/05/1990", email: "john.doe@example.com", cnic: "35201-1234567-1", father_name: "Richard Doe", blood_group: "O+", address: "123 Main Street", city: "Lahore", allergies: "Penicillin", major_diseases: "Diabetes", marital_status: "Married" },
  { full_name: "Jane Smith", phone: "03009876543", gender: "female", date_of_birth: "22/08/1985", email: "", cnic: "", father_name: "William Smith", blood_group: "A+", address: "456 Oak Avenue", city: "Karachi", allergies: "", major_diseases: "", marital_status: "Single" },
];

const newPatientId = () => `P-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`.toUpperCase();

export default function PatientImportExport({ createdBy, onImportComplete, doctors }: Props) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("map");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [dateOrder, setDateOrder] = useState<DateOrder>("dmy");
  const [missingGender, setMissingGender] = useState<ImportOptions["missingGender"]>("skip");
  const [target, setTarget] = useState(createdBy);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<DryRun | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{ added: number; failed: RowResult[] } | null>(null);

  // Export every patient (for a clinic: all its doctors' patients) to one Excel file.
  const [exporting, setExporting] = useState(false);
  const exportAll = async () => {
    setExporting(true);
    try {
      const ids = doctors && doctors.length ? doctors.map((d) => d.id) : [createdBy];
      const names = Object.fromEntries((doctors || []).map((d) => [d.id, d.name]));
      const rows: any[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from("patients")
          .select("patient_id, full_name, phone, email, gender, date_of_birth, cnic, father_name, blood_group, city, address, allergies, major_diseases, marital_status, emergency_contact_name, emergency_contact_phone, created_by, created_at")
          .in("created_by", ids).order("created_at", { ascending: true }).order("id").range(from, from + 999);
        if (error) throw error;
        rows.push(...(data || []));
        if (!data || data.length < 1000) break;
      }
      const age = (dob?: string | null) => { if (!dob) return ""; const b = new Date(dob); const t = new Date(); let a = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--; return a >= 0 && a < 130 ? a : ""; };
      await downloadSheets(`patients_${new Date().toISOString().slice(0, 10)}.xlsx`, [{ name: "Patients", rows: rows.map((r) => ({
        "Patient ID": r.patient_id, Name: r.full_name, Phone: r.phone, Email: r.email || "", Gender: r.gender || "",
        "Date of birth": r.date_of_birth || "", Age: age(r.date_of_birth), [idLabel()]: r.cnic || "", "Father / husband": r.father_name || "",
        "Blood group": r.blood_group || "", City: r.city || "", Address: r.address || "", Allergies: r.allergies || "",
        Conditions: r.major_diseases || "", "Marital status": r.marital_status || "",
        "Emergency contact": r.emergency_contact_name || "", "Emergency phone": r.emergency_contact_phone || "",
        ...(doctors && doctors.length > 1 ? { Doctor: names[r.created_by] || "" } : {}),
        "Added on": (r.created_at || "").slice(0, 10),
      })) }]);
      toast({ title: `Exported ${rows.length} patient${rows.length === 1 ? "" : "s"}` });
    } catch (err: any) {
      toast({ title: "Could not export patients", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const downloadSample = async () => {
    await downloadSheets("patient_import_sample.xlsx", [{ name: "Patients", rows: SAMPLE }]);
    toast({ title: "Sample downloaded", description: "Fill it in, or use an export from your old system." });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const buf = new Uint8Array(await file.arrayBuffer());
      const isText = /\.(csv|txt|tsv)$/i.test(file.name);
      // Text files are read as plain text so dates like 05/06/1990 are not guessed as US dates.
      const wb = XLSX.read(buf, { type: "array", raw: isText, cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: true });
      const data = json.filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""));
      if (!data.length) { toast({ title: "The file has no rows", variant: "destructive" }); return; }
      const hdrs = Array.from(new Set(data.flatMap((r) => Object.keys(r)))).filter((h) => !h.startsWith("__EMPTY"));
      const map = guessMapping(hdrs);
      setFileName(file.name); setHeaders(hdrs); setRows(data); setMapping(map);
      setDateOrder(map.date_of_birth ? detectDateOrder(data.map((r) => r[map.date_of_birth!])) : "dmy");
      setMissingGender("skip"); setTarget(createdBy); setResult(null); setSummary(null); setProgress(0);
      setStep("map"); setOpen(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Could not read the file", description: "Use a .csv, .xlsx or .xls file.", variant: "destructive" });
    }
  };

  const hasName = !!mapping.full_name || !!mapping.first_name || !!mapping.last_name;
  const canCheck = hasName && !!mapping.phone && !!target;
  const sampleOf = (h?: string) => {
    if (!h) return "";
    const v = rows.find((r) => String(r[h] ?? "").trim() !== "")?.[h];
    return v === undefined ? "" : String(v).slice(0, 40);
  };

  const runCheck = async () => {
    setChecking(true);
    const people = new Set<string>(), ids = new Set<string>();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from("patients").select("id, full_name, phone, cnic").eq("created_by", target).order("id").range(from, from + 999);
      if (error) { setChecking(false); toast({ title: "Could not check existing patients", description: error.message, variant: "destructive" }); return; }
      (data || []).forEach((p) => { people.add(personKey(p.phone, p.full_name)); if (p.cnic) ids.add(keyOf(p.cnic)); });
      if (!data || data.length < 1000) break;
    }
    setResult(dryRun(rows, mapping, { dateOrder, missingGender }, { people, ids }));
    setChecking(false);
    setStep("check");
  };

  const downloadRows = async (list: RowResult[], name: string) => {
    await downloadSheets(name, [{ name: "Rows", rows: list.map((r) => ({ Row: r.row, Problem: r.problem || "", ...Object.fromEntries(Object.entries(r.source).map(([k, v]) => [k, v as string])) })) }]);
  };

  const runImport = async () => {
    if (!result?.ready.length) return;
    setImporting(true); setProgress(0);
    const failed: RowResult[] = [];
    let added = 0;
    const list = result.ready;
    const payload = (rs: RowResult[]) => rs.map((r) => ({ ...r.data!, patient_id: newPatientId(), created_by: target }));
    for (let i = 0; i < list.length; i += CHUNK) {
      const part = list.slice(i, i + CHUNK);
      const { error } = await supabase.from("patients").insert(payload(part) as any);
      if (!error) added += part.length;
      else {
        // Find the bad rows one by one so the good ones still go in.
        for (const r of part) {
          const one = await supabase.from("patients").insert(payload([r]) as any);
          if (one.error) failed.push({ ...r, problem: one.error.message }); else added++;
        }
      }
      setProgress(Math.round(((i + part.length) / list.length) * 100));
    }
    setImporting(false);
    setSummary({ added, failed });
    setStep("done");
    onImportComplete();
    toast({ title: `Imported ${added} patient${added === 1 ? "" : "s"}` });
  };

  const fieldLabel = (k: FieldKey) => (k === "cnic" ? idLabel() : FIELDS.find((f) => f.key === k)!.label);
  const mappedCount = useMemo(() => new Set(Object.values(mapping).filter(Boolean)).size, [mapping]);
  const preview = result?.ready.slice(0, 5) || [];

  return (
    <>
      <input type="file" ref={fileRef} onChange={onFile} accept=".csv,.xlsx,.xls,.txt" className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2" /> Import/Export</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Import patients (CSV or Excel)</DropdownMenuItem>
          <DropdownMenuItem onClick={exportAll} disabled={exporting}>{exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />} Export all patients (Excel)</DropdownMenuItem>
          <DropdownMenuItem onClick={downloadSample}><FileSpreadsheet className="h-4 w-4 mr-2" /> Download sample file</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={(o) => { if (!importing) setOpen(o); }}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import patients</DialogTitle>
            <DialogDescription>
              {fileName} · {rows.length} row{rows.length === 1 ? "" : "s"} · Step {step === "map" ? "1 of 3: match the columns" : step === "check" ? "2 of 3: check before importing" : "3 of 3: done"}
            </DialogDescription>
          </DialogHeader>

          {step === "map" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Files exported from other clinic systems work too. Check which column holds each detail. Name and phone are needed; everything else is optional.
              </p>
              {doctors && doctors.length > 1 && (
                <div className="max-w-sm space-y-1">
                  <Label className="text-xs">Add the patients to</Label>
                  <select className={selectCls} value={target} onChange={(e) => setTarget(e.target.value)}>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.key} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-2">
                    <Label className="text-xs">{fieldLabel(f.key)}{(f.key === "phone" || f.key === "full_name") && <span className="text-destructive"> *</span>}</Label>
                    <div className="min-w-0">
                      <select className={selectCls} value={mapping[f.key] || ""} onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value || undefined })} aria-label={fieldLabel(f.key)}>
                        <option value="">Not in file</option>
                        {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      {mapping[f.key] && <p className="truncate text-[11px] text-muted-foreground">e.g. {sampleOf(mapping[f.key]) || "(empty)"}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">* Use Full name, or First name and Last name. {mappedCount} of {headers.length} columns matched.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Dates in the file are written</Label>
                  <select className={selectCls} value={dateOrder} onChange={(e) => setDateOrder(e.target.value as DateOrder)}>
                    <option value="dmy">Day first (31/12/1990)</option>
                    <option value="mdy">Month first (12/31/1990)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">When gender is missing</Label>
                  <select className={selectCls} value={missingGender} onChange={(e) => setMissingGender(e.target.value as ImportOptions["missingGender"])}>
                    <option value="skip">Leave the row out</option>
                    <option value="other">Import as Other</option>
                    <option value="female">Import as Female</option>
                    <option value="male">Import as Male</option>
                  </select>
                </div>
              </div>
              {!canCheck && <p className="text-xs text-destructive">Choose the name and phone columns to continue.</p>}
            </div>
          )}

          {step === "check" && result && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Nothing has been saved yet. This is what will happen:</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Will be added</p>
                  <p className="text-2xl font-bold tabular-nums">{result.ready.length}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="flex items-center gap-1.5 text-sm font-medium"><Copy className="h-4 w-4" /> Already there, skipped</p>
                  <p className="text-2xl font-bold tabular-nums">{result.duplicates.length}</p>
                  {result.duplicates.length > 0 && <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => downloadRows(result.duplicates, "import_skipped_duplicates.xlsx")}>Download list</Button>}
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300"><AlertTriangle className="h-4 w-4" /> Need fixing, skipped</p>
                  <p className="text-2xl font-bold tabular-nums">{result.problems.length}</p>
                  {result.problems.length > 0 && <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => downloadRows(result.problems, "import_rows_to_fix.xlsx")}>Download rows to fix</Button>}
                </div>
              </div>

              {result.problems.length > 0 && (
                <div className="rounded-md border p-3">
                  <p className="mb-1 text-sm font-medium">Rows to fix</p>
                  <ul className="max-h-32 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
                    {result.problems.slice(0, 100).map((r) => <li key={r.row}>Row {r.row}: {r.problem}</li>)}
                    {result.problems.length > 100 && <li>and {result.problems.length - 100} more (download the list)</li>}
                  </ul>
                </div>
              )}

              {preview.length > 0 && (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50"><tr>{["Name", "Phone", "Gender", "Date of birth", "City"].map((h) => <th key={h} className="p-2 text-left font-medium">{h}</th>)}</tr></thead>
                    <tbody>
                      {preview.map((r) => (
                        <tr key={r.row} className="border-t">
                          <td className="p-2">{r.data!.full_name}</td><td className="p-2">{r.data!.phone}</td>
                          <td className="p-2 capitalize">{r.data!.gender}</td><td className="p-2">{r.data!.date_of_birth || "-"}</td><td className="p-2">{r.data!.city || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.ready.length > preview.length && <p className="border-t p-2 text-xs text-muted-foreground">First {preview.length} of {result.ready.length} shown.</p>}
                </div>
              )}

              {importing && <div className="space-y-1"><Progress value={progress} /><p className="text-xs text-muted-foreground">Importing... {progress}%</p></div>}
            </div>
          )}

          {step === "done" && summary && (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> {summary.added} patient{summary.added === 1 ? "" : "s"} added</p>
              {summary.failed.length > 0 && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-medium text-destructive">{summary.failed.length} could not be saved</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => downloadRows(summary.failed, "import_failed_rows.xlsx")}>Download these rows</Button>
                </div>
              )}
              {result && (result.duplicates.length > 0 || result.problems.length > 0) && (
                <p className="text-sm text-muted-foreground">Skipped: {result.duplicates.length} already there, {result.problems.length} needing fixes. Fix them in the downloaded file and import it again.</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {step === "map" && (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={runCheck} disabled={!canCheck || checking}>{checking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Check the file</Button>
              </>
            )}
            {step === "check" && result && (
              <>
                <Button variant="outline" onClick={() => setStep("map")} disabled={importing}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button onClick={runImport} disabled={importing || result.ready.length === 0}>
                  {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Import {result.ready.length} patient{result.ready.length === 1 ? "" : "s"}
                </Button>
              </>
            )}
            {step === "done" && <Button onClick={() => setOpen(false)}>Close</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
