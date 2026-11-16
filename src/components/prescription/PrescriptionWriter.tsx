import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Star, History, FileText, ListChecks, AlertTriangle, ChevronUp, ChevronDown, Pill, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatMedicinesAsText, loadTemplateMedicines } from "@/components/DiseaseTemplateMedicineEditor";

// Interactive prescription writer: medicine rows with one-tap dose/frequency/duration chips,
// favourites, "repeat last prescription", templates, allergy warning and an auto-saved draft.
// The printable prescription text is generated from the rows, so printing works as before.
export type RxRow = {
  medicine_name: string; brand?: string | null; dosage?: string | null; frequency?: string | null;
  timing: string[]; duration?: string | null; meal?: string | null; instructions?: string | null;
};
type Template = { id: string; disease_name: string; prescription_template: string };

const FREQ: { label: string; frequency: string; timing: string[] }[] = [
  { label: "1+0+0", frequency: "Once a day", timing: ["Morning"] },
  { label: "0+0+1", frequency: "Once a day", timing: ["Night"] },
  { label: "1+0+1", frequency: "Twice a day", timing: ["Morning", "Night"] },
  { label: "1+1+1", frequency: "3 times a day", timing: ["Morning", "Afternoon", "Night"] },
  { label: "As needed", frequency: "SOS (as needed)", timing: [] },
];
const DURATIONS = ["3 days", "5 days", "7 days", "2 weeks", "1 month"];
const MEALS = ["Before meal", "After meal"];
const DOSES = ["1 tab", "2 tabs", "1/2 tab", "1 cap", "5 ml", "10 ml", "1 sachet", "1 drop", "Apply thinly"];

const draftKey = (id?: string) => (id ? `zonoir.rxdraft.${id}` : "");
const readDraft = (id?: string) => { try { const v = localStorage.getItem(draftKey(id)); return v ? JSON.parse(v) : null; } catch { return null; } };

type Props = {
  appointmentId?: string; doctorId?: string; patientId?: string; allergies?: string | null;
  rows: RxRow[]; onRowsChange: (rows: RxRow[]) => void;
  text: string; onTextChange: (text: string) => void;
  /** false until the saved visit has loaded, so an existing prescription is never overwritten */
  ready?: boolean;
};

export const PrescriptionWriter = ({ appointmentId, doctorId, patientId, allergies, rows, onRowsChange, text, onTextChange, ready = true }: Props) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"list" | "text">("list");
  const [notes, setNotes] = useState("");
  const [library, setLibrary] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<{ rows: RxRow[]; notes: string } | null>(null);
  const initialised = useRef(false);

  // Load library, favourites, templates and any saved rows for this visit.
  useEffect(() => {
    if (!doctorId || !ready) return;
    let alive = true;
    (async () => {
      const { data: doc } = await supabase.from("doctors").select("clinic_id").eq("id", doctorId).maybeSingle();
      const lib = doc?.clinic_id
        ? await supabase.from("clinic_medicines").select("name").eq("clinic_id", doc.clinic_id).order("name").limit(3000)
        : await supabase.from("doctor_medicines").select("name").eq("doctor_id", doctorId).order("name").limit(3000);
      const { data: recent } = await supabase.from("appointment_prescribed_medicines").select("medicine_name").eq("doctor_id", doctorId).order("prescribed_at", { ascending: false }).limit(400);
      const { data: tpl } = await supabase.from("doctor_disease_templates").select("id, disease_name, prescription_template").order("disease_name");
      let saved: RxRow[] = [];
      if (appointmentId) {
        const { data: r } = await supabase.from("appointment_prescribed_medicines").select("medicine_name, brand, dosage, frequency, timing, duration, meal, instructions").eq("appointment_id", appointmentId);
        saved = (r as any) || [];
      }
      if (!alive) return;
      const names = ((lib.data as any) || []).map((m: any) => m.name as string);
      setLibrary(names);
      const counts = new Map<string, number>();
      ((recent as any) || []).forEach((m: any) => counts.set(m.medicine_name, (counts.get(m.medicine_name) || 0) + 1));
      setFavourites(counts.size ? [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n]) => n) : names.slice(0, 8));
      setTemplates((tpl as any) || []);
      if (!initialised.current) {
        initialised.current = true;
        const existingText = (text || "").trim();
        if (saved.length) {
          onRowsChange(saved.map((s) => ({ ...s, timing: s.timing || [] })));
          const idx = existingText.indexOf("Advice / Notes:");
          setNotes(idx >= 0 ? existingText.slice(idx + "Advice / Notes:".length).trim() : "");
        } else if (existingText) {
          setMode("text"); // older free-text prescription: keep it editable as text
        }
        const d = readDraft(appointmentId);
        if (d && Array.isArray(d.rows) && d.rows.length && JSON.stringify(d.rows) !== JSON.stringify(saved)) setDraft(d);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, appointmentId, ready]);

  // In list mode the printable text is always generated from the rows + notes; drafts are saved automatically.
  useEffect(() => {
    if (mode !== "list" || !initialised.current) return;
    onTextChange(formatMedicinesAsText(rows.map((r, i) => ({ ...r, sort_order: i })), notes));
    try { if (appointmentId) localStorage.setItem(draftKey(appointmentId), JSON.stringify({ rows, notes, ts: Date.now() })); } catch { /* storage blocked */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, notes, mode]);

  const allergyWords = useMemo(() => (allergies || "").toLowerCase().split(/[,;/]+/).map((s) => s.trim()).filter((s) => s.length > 2), [allergies]);
  const allergyHit = (name: string) => allergyWords.find((w) => name.toLowerCase().includes(w));

  const add = (name: string) => {
    const n = name.trim(); if (!n) return;
    onRowsChange([...rows, { medicine_name: n, dosage: "1 tab", frequency: "Twice a day", timing: ["Morning", "Night"], duration: "5 days", meal: "After meal" }]);
    setPickerOpen(false); setSearch("");
    const hit = allergyHit(n);
    if (hit) toast({ title: "Allergy warning", description: `This patient is allergic to "${hit}". Check ${n} before prescribing.`, variant: "destructive" });
  };
  const update = (i: number, patch: Partial<RxRow>) => onRowsChange(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onRowsChange(rows.filter((_, k) => k !== i));
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= rows.length) return; const c = [...rows]; [c[i], c[j]] = [c[j], c[i]]; onRowsChange(c); };

  const repeatLast = async () => {
    if (!patientId) return;
    const { data } = await supabase.from("appointment_prescribed_medicines")
      .select("appointment_id, medicine_name, brand, dosage, frequency, timing, duration, meal, instructions, prescribed_at")
      .eq("patient_id", patientId).neq("appointment_id", appointmentId || "").order("prescribed_at", { ascending: false }).limit(50);
    const list = (data as any[]) || [];
    if (!list.length) { toast({ title: "No earlier prescription", description: "This patient has no saved medicine list from a previous visit." }); return; }
    const last = list.filter((r) => r.appointment_id === list[0].appointment_id).map(({ appointment_id, prescribed_at, ...r }) => ({ ...r, timing: r.timing || [] }));
    onRowsChange([...rows, ...last]);
    toast({ title: `Added ${last.length} medicine${last.length === 1 ? "" : "s"} from the last visit` });
  };

  const applyTemplate = async (id: string) => {
    const t = templates.find((x) => x.id === id); if (!t) return;
    const meds = await loadTemplateMedicines(id);
    onRowsChange([...rows, ...meds.map(({ id: _id, sort_order: _s, ...m }: any) => ({ ...m, timing: m.timing || [] }))]);
    if (t.prescription_template?.trim()) setNotes((n) => (n ? `${n}\n${t.prescription_template.trim()}` : t.prescription_template.trim()));
  };

  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (q ? library.filter((n) => n.toLowerCase().includes(q)) : library).slice(0, 60);
  }, [library, search]);

  if (mode === "text") {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Written as free text.</p>
          <Button type="button" size="sm" variant="outline" onClick={() => { setNotes(text); setMode("list"); }}><ListChecks className="mr-1 h-4 w-4" /> Use medicine list</Button>
        </div>
        <Textarea value={text} onChange={(e) => onTextChange(e.target.value)} rows={8} className="font-mono text-sm" placeholder="Medications, dosage, and instructions..." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {draft && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-sm">
          <span className="flex-1">An unsaved draft of this prescription was found.</span>
          <Button type="button" size="sm" variant="outline" onClick={() => { onRowsChange(draft.rows); setNotes(draft.notes || ""); setDraft(null); }}>Restore draft</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(null)}>Dismiss</Button>
        </div>
      )}
      {allergyWords.length > 0 && (
        <p className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400"><AlertTriangle className="h-3.5 w-3.5" /> Allergies: {allergies}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button type="button" size="sm"><Plus className="mr-1 h-4 w-4" /> Add medicine <ChevronsUpDown className="ml-1 h-3 w-3 opacity-60" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Search or type a medicine..." value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>{search.trim() ? <button type="button" className="w-full px-3 py-2 text-left text-sm" onClick={() => add(search)}>Add "{search.trim()}"</button> : "Type a medicine name."}</CommandEmpty>
                {search.trim() && !library.some((n) => n.toLowerCase() === search.trim().toLowerCase()) && options.length > 0 && (
                  <CommandGroup><CommandItem value={`__new ${search}`} onSelect={() => add(search)}><Plus className="mr-2 h-4 w-4" /> Add "{search.trim()}"</CommandItem></CommandGroup>
                )}
                <CommandGroup heading="Your medicines">
                  {options.map((n) => (
                    <CommandItem key={n} value={n} onSelect={() => add(n)}>
                      <Pill className="mr-2 h-4 w-4 opacity-60" />{n}
                      {allergyHit(n) && <AlertTriangle className="ml-auto h-4 w-4 text-destructive" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button type="button" size="sm" variant="outline" onClick={repeatLast}><History className="mr-1 h-4 w-4" /> Repeat last prescription</Button>
        {templates.length > 0 && (
          <Select value="" onValueChange={applyTemplate}>
            <SelectTrigger className="h-9 w-auto gap-1 text-sm"><FileText className="h-4 w-4" /><SelectValue placeholder="Add template" /></SelectTrigger>
            <SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.disease_name}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <Button type="button" size="sm" variant="ghost" onClick={() => setMode("text")}>Edit as text</Button>
      </div>

      {favourites.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          {favourites.map((n) => (
            <button key={n} type="button" onClick={() => add(n)} className="rounded-full border bg-background px-2.5 py-0.5 text-xs hover:border-primary/50 hover:bg-primary/5">{n}</button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
          No medicines yet. Use <strong>Add medicine</strong>, tap a favourite, or <strong>Repeat last prescription</strong>.
        </div>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const freq = FREQ.find((f) => f.frequency === r.frequency && JSON.stringify(f.timing) === JSON.stringify(r.timing || []));
            const hit = allergyHit(r.medicine_name);
            return (
              <li key={i} className={`rounded-lg border bg-background p-3 ${hit ? "border-destructive/60" : ""}`}>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{i + 1}</span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Input value={r.medicine_name} onChange={(e) => update(i, { medicine_name: e.target.value })} className="h-8 min-w-[10rem] flex-1 font-medium" aria-label="Medicine" />
                      <Input value={r.dosage || ""} onChange={(e) => update(i, { dosage: e.target.value })} list="rx-doses" className="h-8 w-28" placeholder="Dose" aria-label="Dose" />
                    </div>
                    {hit && <p className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3.5 w-3.5" /> Patient is allergic to "{hit}".</p>}
                    <div className="flex flex-wrap gap-1">
                      {FREQ.map((f) => (
                        <button key={f.label} type="button" onClick={() => update(i, { frequency: f.frequency, timing: f.timing })}
                          className={`rounded-md border px-2 py-0.5 text-xs ${freq?.label === f.label ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"}`}>
                          {freq?.label === f.label && <Check className="mr-0.5 inline h-3 w-3" />}{f.label}
                        </button>
                      ))}
                      <span className="mx-1 w-px bg-border" />
                      {DURATIONS.map((d) => (
                        <button key={d} type="button" onClick={() => update(i, { duration: d })}
                          className={`rounded-md border px-2 py-0.5 text-xs ${r.duration === d ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"}`}>{d}</button>
                      ))}
                      <span className="mx-1 w-px bg-border" />
                      {MEALS.map((m) => (
                        <button key={m} type="button" onClick={() => update(i, { meal: r.meal === m ? null : m })}
                          className={`rounded-md border px-2 py-0.5 text-xs ${r.meal === m ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"}`}>{m}</button>
                      ))}
                    </div>
                    <Input value={r.instructions || ""} onChange={(e) => update(i, { instructions: e.target.value })} className="h-8 text-sm" placeholder="Instructions (optional), e.g. stop if rash appears" aria-label="Instructions" />
                  </div>
                  <div className="flex shrink-0 flex-col">
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label="Move up" onClick={() => move(i, -1)}><ChevronUp className="h-4 w-4" /></Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label="Move down" onClick={() => move(i, 1)}><ChevronDown className="h-4 w-4" /></Button>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" aria-label="Remove" onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <datalist id="rx-doses">{DOSES.map((d) => <option key={d} value={d} />)}</datalist>

      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Advice / notes for the patient (diet, rest, follow-up)..." className="text-sm" />
      {rows.length > 0 && <p className="text-xs text-muted-foreground"><Badge variant="secondary" className="mr-1">{rows.length}</Badge>medicine{rows.length === 1 ? "" : "s"} · the printed prescription is updated automatically</p>}
    </div>
  );
};

export default PrescriptionWriter;
