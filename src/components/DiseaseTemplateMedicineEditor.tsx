import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Trash2, ArrowUp, ArrowDown, Pill, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface TemplateMedicine {
  id?: string;
  medicine_name: string;
  brand?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  timing: string[];
  duration?: string | null;
  meal?: string | null;
  instructions?: string | null;
  sort_order: number;
}

interface Props {
  templateId: string | null; // null => new template (save handler responsible after parent insert)
  ownerType: "doctor" | "clinic";
  ownerId: string; // doctor_id or clinic_id (used to load medicines library)
  medicines: TemplateMedicine[];
  onChange: (meds: TemplateMedicine[]) => void;
}

const FREQUENCIES = [
  "Once a day",
  "Twice a day",
  "3 times a day",
  "4 times a day",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "SOS (as needed)",
  "Once a week",
  "Stat (immediately)",
];

const TIMINGS = ["Morning", "Afternoon", "Evening", "Night"];
const MEALS = ["Before meal", "After meal", "With meal", "Anytime", "Empty stomach"];

export const formatMedicinesAsText = (meds: TemplateMedicine[], generalNotes?: string) => {
  if (!meds.length && !generalNotes) return "";
  const lines: string[] = [];
  meds.forEach((m, i) => {
    const parts: string[] = [`${i + 1}. ${m.medicine_name}`];
    if (m.brand) parts.push(`(${m.brand})`);
    let line = parts.join(" ");
    const detail: string[] = [];
    if (m.dosage) detail.push(m.dosage);
    if (m.frequency) detail.push(m.frequency);
    if (m.timing?.length) detail.push(m.timing.join(", "));
    if (m.duration) detail.push(`for ${m.duration}`);
    if (m.meal) detail.push(m.meal);
    if (detail.length) line += ` — ${detail.join(" • ")}`;
    if (m.instructions) line += `\n   Note: ${m.instructions}`;
    lines.push(line);
  });
  if (generalNotes?.trim()) {
    lines.push("");
    lines.push("Advice / Notes:");
    lines.push(generalNotes.trim());
  }
  return lines.join("\n");
};

const DiseaseTemplateMedicineEditor = ({ templateId, ownerType, ownerId, medicines, onChange }: Props) => {
  const [library, setLibrary] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    void loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, ownerType]);

  const loadLibrary = async () => {
    const table = ownerType === "doctor" ? "doctor_medicines" : "clinic_medicines";
    const col = ownerType === "doctor" ? "doctor_id" : "clinic_id";
    const { data } = await supabase.from(table as any).select("id, name").eq(col, ownerId).order("name").limit(2000);
    setLibrary((data as any) || []);
  };

  const updateMed = (idx: number, patch: Partial<TemplateMedicine>) => {
    const next = medicines.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    onChange(next);
  };

  const addMed = () => {
    onChange([
      ...medicines,
      {
        medicine_name: "",
        brand: "",
        dosage: "",
        frequency: "",
        timing: [],
        duration: "",
        meal: "",
        instructions: "",
        sort_order: medicines.length,
      },
    ]);
  };

  const removeMed = (idx: number) => {
    onChange(medicines.filter((_, i) => i !== idx).map((m, i) => ({ ...m, sort_order: i })));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= medicines.length) return;
    const next = [...medicines];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((m, i) => ({ ...m, sort_order: i })));
  };

  const toggleTiming = (idx: number, t: string) => {
    const cur = medicines[idx].timing || [];
    const has = cur.includes(t);
    updateMed(idx, { timing: has ? cur.filter((x) => x !== t) : [...cur, t] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Pill className="h-4 w-4 text-primary" />
          Medicines ({medicines.length})
        </Label>
        <Button type="button" size="sm" variant="outline" onClick={addMed}>
          <Plus className="h-4 w-4 mr-1" /> Add Medicine
        </Button>
      </div>

      {medicines.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
          No medicines yet. Click "Add Medicine" to start building this prescription.
        </div>
      ) : (
        <div className="space-y-3">
          {medicines.map((m, idx) => (
            <div key={idx} className="border rounded-lg p-3 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
                <div className="flex gap-1">
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => move(idx, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === medicines.length - 1} onClick={() => move(idx, 1)}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeMed(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Medicine name with searchable picker */}
                <div className="space-y-1">
                  <Label className="text-xs">Medicine *</Label>
                  <MedicineCombobox
                    value={m.medicine_name}
                    options={library.map((l) => l.name)}
                    onChange={(val) => updateMed(idx, { medicine_name: val })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Brand / Strength</Label>
                  <Input value={m.brand || ""} onChange={(e) => updateMed(idx, { brand: e.target.value })} placeholder="e.g. 625mg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dosage</Label>
                  <Input value={m.dosage || ""} onChange={(e) => updateMed(idx, { dosage: e.target.value })} placeholder="e.g. 1 tablet" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Select value={m.frequency || ""} onValueChange={(v) => updateMed(idx, { frequency: v })}>
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Timing</Label>
                  <div className="flex flex-wrap gap-2">
                    {TIMINGS.map((t) => {
                      const active = m.timing?.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTiming(idx, t)}
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-full border transition-colors",
                            active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration</Label>
                  <Input value={m.duration || ""} onChange={(e) => updateMed(idx, { duration: e.target.value })} placeholder="e.g. 7 days" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Meal</Label>
                  <Select value={m.meal || ""} onValueChange={(v) => updateMed(idx, { meal: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {MEALS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Instructions (optional)</Label>
                  <Textarea
                    value={m.instructions || ""}
                    onChange={(e) => updateMed(idx, { instructions: e.target.value })}
                    rows={2}
                    placeholder="e.g. Take with water"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MedicineCombobox = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options.slice(0, 50);
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 50);
  }, [options, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Select or type medicine..."}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search or type custom..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>
              <button
                type="button"
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded"
                onClick={() => {
                  if (search.trim()) {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }
                }}
              >
                {search.trim() ? `Use "${search.trim()}"` : "Type to search"}
              </button>
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                  {opt}
                </CommandItem>
              ))}
              {search.trim() && !filtered.some((o) => o.toLowerCase() === search.trim().toLowerCase()) && (
                <CommandItem
                  value={`__custom__${search}`}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Use "{search.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const loadTemplateMedicines = async (templateId: string): Promise<TemplateMedicine[]> => {
  const { data, error } = await supabase
    .from("doctor_disease_template_medicines" as any)
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order");
  if (error) {
    console.error("Failed to load template medicines:", error);
    return [];
  }
  return (data as any[]).map((d) => ({
    id: d.id,
    medicine_name: d.medicine_name,
    brand: d.brand,
    dosage: d.dosage,
    frequency: d.frequency,
    timing: d.timing || [],
    duration: d.duration,
    meal: d.meal,
    instructions: d.instructions,
    sort_order: d.sort_order,
  }));
};

export const saveTemplateMedicines = async (templateId: string, medicines: TemplateMedicine[]) => {
  // Simplest reliable approach: replace all rows for this template
  const { error: delErr } = await supabase
    .from("doctor_disease_template_medicines" as any)
    .delete()
    .eq("template_id", templateId);
  if (delErr) throw delErr;
  if (!medicines.length) return;
  const rows = medicines
    .filter((m) => m.medicine_name.trim())
    .map((m, i) => ({
      template_id: templateId,
      medicine_name: m.medicine_name.trim(),
      brand: m.brand || null,
      dosage: m.dosage || null,
      frequency: m.frequency || null,
      timing: m.timing || [],
      duration: m.duration || null,
      meal: m.meal || null,
      instructions: m.instructions || null,
      sort_order: i,
    }));
  if (!rows.length) return;
  const { error } = await supabase.from("doctor_disease_template_medicines" as any).insert(rows);
  if (error) throw error;
};

export default DiseaseTemplateMedicineEditor;
