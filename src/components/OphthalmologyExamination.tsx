import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Activity, ClipboardList, Layers, Microscope, Stethoscope } from "lucide-react";

export interface OphthalmologyData {
  // History & Presenting Complaints
  presenting_complaints?: string;
  ocular_history?: string;
  systemic_history?: string;
  drug_allergy?: string;
  surgical_history?: string;
  // Vision & Refraction
  va_right_unaided?: string;
  va_right_glasses?: string;
  va_right_pinhole?: string;
  va_right_near?: string;
  va_left_unaided?: string;
  va_left_glasses?: string;
  va_left_pinhole?: string;
  va_left_near?: string;
  refraction_right_sphere?: string;
  refraction_right_cylinder?: string;
  refraction_right_axis?: string;
  refraction_right_add?: string;
  refraction_right_final_va?: string;
  refraction_left_sphere?: string;
  refraction_left_cylinder?: string;
  refraction_left_axis?: string;
  refraction_left_add?: string;
  refraction_left_final_va?: string;
  auto_refraction?: string;
  cyclo_auto_refraction?: string;
  retinoscopy?: string;
  iop?: string; // legacy free-text
  // Structured IOP / Pachymetry / Correction Factor
  iop_right?: string;
  iop_left?: string;
  pachymetry_right?: string;
  pachymetry_left?: string;
  cf_right?: string;
  cf_left?: string;
  iop_final_right?: string;
  iop_final_left?: string;
  iop_method?: string;
  // External Examination
  pupil?: string;
  lids?: string;
  lacrimal_passage?: string;
  other_external_findings?: string;
  // Anterior Segment
  ant_conjunctiva_right?: string;
  ant_conjunctiva_left?: string;
  ant_conjunctiva_status?: string;
  ant_sclera_right?: string;
  ant_sclera_left?: string;
  ant_sclera_status?: string;
  ant_cornea_right?: string;
  ant_cornea_left?: string;
  ant_cornea_status?: string;
  ant_ac_right?: string;
  ant_ac_left?: string;
  ant_ac_status?: string;
  ant_iris_right?: string;
  ant_iris_left?: string;
  ant_iris_status?: string;
  ant_lens_right?: string;
  ant_lens_left?: string;
  ant_lens_status?: string;
  // Posterior Segment
  fundus?: string;
  optic_disc?: string;
  vitreous?: string;
  cd_ratio?: string;
  macula?: string;
  peripheral_retina?: string;
  // Diagnosis & Plan
  eye_diagnosis?: string;
  treatment_plan?: string;
  management_plan?: string;
  oct_findings?: string;
}

interface Props {
  value: OphthalmologyData;
  onChange: (next: OphthalmologyData) => void;
}

const COMPLAINT_CHIPS = ["DOV", "Pain", "Redness", "Watering", "Itching", "Headache", "Floaters", "Flashes"];
const OCULAR_CHIPS = ["Already using glasses", "Amblyopia", "Previous surgery", "Eye trauma", "Glaucoma"];
const DIAGNOSIS_CHIPS = ["Refractive Error", "Amblyopia", "Conjunctivitis", "Dry Eye", "Cataract", "Glaucoma Suspect"];

const ANTERIOR_ROWS: { key: string; label: string; rightPlaceholder: string; statuses: string[] }[] = [
  { key: "conjunctiva", label: "Conjunctiva", rightPlaceholder: "Normal / congested", statuses: ["Normal", "Congested", "Pale", "Discharge"] },
  { key: "sclera", label: "Sclera", rightPlaceholder: "Finding", statuses: ["Normal", "Icteric", "Blue", "Inflamed"] },
  { key: "cornea", label: "Cornea", rightPlaceholder: "Clear / opacity", statuses: ["Clear", "Opacity", "Edema", "Ulcer", "Scar"] },
  { key: "ac", label: "AC", rightPlaceholder: "Deep / quiet", statuses: ["Normal", "Deep", "Shallow", "Cells/Flare", "Hyphema"] },
  { key: "iris", label: "Iris", rightPlaceholder: "Normal", statuses: ["Normal", "Atrophy", "Synechiae", "Coloboma"] },
  { key: "lens", label: "Lens", rightPlaceholder: "Clear / cataract", statuses: ["Clear", "Cataract", "PSC", "Pseudophakic", "Aphakic"] },
];

const TAB_ITEMS = [
  { value: "history", label: "History", icon: ClipboardList },
  { value: "vision", label: "Vision & Refraction", icon: Eye },
  { value: "external", label: "External Exam", icon: Stethoscope },
  { value: "anterior", label: "Anterior Segment", icon: Layers },
  { value: "posterior", label: "Posterior Segment", icon: Microscope },
  { value: "plan", label: "Diagnosis & Plan", icon: Activity },
];

export default function OphthalmologyExamination({ value, onChange }: Props) {
  const [activeTab, setActiveTab] = useState("history");
  const set = (patch: Partial<OphthalmologyData>) => onChange({ ...value, ...patch });

  const filledCount = (fields: (keyof OphthalmologyData)[]) =>
    fields.filter((k) => !!value[k]).length;

  const historyFields: (keyof OphthalmologyData)[] = ["presenting_complaints", "ocular_history", "systemic_history", "drug_allergy", "surgical_history"];
  const visionFields: (keyof OphthalmologyData)[] = ["va_right_unaided", "va_right_glasses", "va_right_pinhole", "va_right_near", "va_left_unaided", "va_left_glasses", "va_left_pinhole", "va_left_near", "refraction_right_sphere", "refraction_right_cylinder", "refraction_right_axis", "refraction_right_add", "refraction_right_final_va", "refraction_left_sphere", "refraction_left_cylinder", "refraction_left_axis", "refraction_left_add", "refraction_left_final_va", "auto_refraction", "cyclo_auto_refraction", "retinoscopy", "iop"];
  const externalFields: (keyof OphthalmologyData)[] = ["pupil", "lids", "lacrimal_passage", "other_external_findings"];
  const anteriorFields: (keyof OphthalmologyData)[] = ["ant_conjunctiva_right", "ant_conjunctiva_left", "ant_conjunctiva_status", "ant_sclera_right", "ant_sclera_left", "ant_sclera_status", "ant_cornea_right", "ant_cornea_left", "ant_cornea_status", "ant_ac_right", "ant_ac_left", "ant_ac_status", "ant_iris_right", "ant_iris_left", "ant_iris_status", "ant_lens_right", "ant_lens_left", "ant_lens_status"];
  const posteriorFields: (keyof OphthalmologyData)[] = ["fundus", "optic_disc", "vitreous", "cd_ratio", "macula", "peripheral_retina"];
  const planFields: (keyof OphthalmologyData)[] = ["eye_diagnosis", "treatment_plan", "management_plan", "oct_findings"];

  const tabCounts: Record<string, number> = {
    history: filledCount(historyFields),
    vision: filledCount(visionFields),
    external: filledCount(externalFields),
    anterior: filledCount(anteriorFields),
    posterior: filledCount(posteriorFields),
    plan: filledCount(planFields),
  };

  const appendChip = (key: keyof OphthalmologyData, chip: string) => {
    const cur = (value[key] as string) || "";
    const exists = cur.toLowerCase().includes(chip.toLowerCase());
    if (exists) return;
    set({ [key]: cur ? `${cur}${cur.endsWith(",") || cur.endsWith(" ") ? " " : ", "}${chip}` : chip } as any);
  };

  const Chip = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 text-xs rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-200 transition"
    >
      {label}
    </button>
  );

  const TabBadge = ({ count }: { count: number }) =>
    count > 0 ? (
      <Badge variant="secondary" className="ml-1.5 h-4 min-w-[18px] px-1 text-[10px] leading-none">
        {count}
      </Badge>
    ) : null;

  return (
    <Card className="border-blue-200/60">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            {TAB_ITEMS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="flex-1 min-w-[100px] text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {t.label}
                  <TabBadge count={tabCounts[t.value]} />
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* History & Presenting Complaints */}
          <TabsContent value="history" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">Quickly record symptoms and history</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Presenting Complaints</Label>
                <Textarea
                  rows={3}
                  placeholder="Example: DOV, pain, redness, watering, itching, headache, floaters..."
                  value={value.presenting_complaints || ""}
                  onChange={(e) => set({ presenting_complaints: e.target.value })}
                  className="mt-1"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMPLAINT_CHIPS.map((c) => (
                    <Chip key={c} label={c} onClick={() => appendChip("presenting_complaints", c)} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold">Ocular History</Label>
                <Textarea
                  rows={3}
                  placeholder="Previous glasses, amblyopia, surgery, trauma, infection, glaucoma, cataract..."
                  value={value.ocular_history || ""}
                  onChange={(e) => set({ ocular_history: e.target.value })}
                  className="mt-1"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {OCULAR_CHIPS.map((c) => (
                    <Chip key={c} label={c} onClick={() => appendChip("ocular_history", c)} />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Systemic History</Label>
                <Textarea
                  rows={3}
                  placeholder="Diabetes, hypertension, allergy, asthma, thyroid..."
                  value={value.systemic_history || ""}
                  onChange={(e) => set({ systemic_history: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Drug Allergy</Label>
                <Textarea
                  rows={3}
                  placeholder="Mention allergy if any"
                  value={value.drug_allergy || ""}
                  onChange={(e) => set({ drug_allergy: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Surgical History</Label>
                <Textarea
                  rows={3}
                  placeholder="Previous eye or systemic surgery"
                  value={value.surgical_history || ""}
                  onChange={(e) => set({ surgical_history: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* Vision & Refraction */}
          <TabsContent value="vision" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">VA, old glasses, refraction and IOP</p>
            <div>
              <Label className="text-sm font-semibold">Visual Acuity</Label>
              <div className="overflow-x-auto mt-2 rounded-md border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                    <tr>
                      <th className="text-left p-2 font-medium">Eye</th>
                      <th className="text-left p-2 font-medium">Unaided VA</th>
                      <th className="text-left p-2 font-medium">With Glasses</th>
                      <th className="text-left p-2 font-medium">Pinhole</th>
                      <th className="text-left p-2 font-medium">Near Vision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["right", "left"] as const).map((eye) => (
                      <tr key={eye} className="border-t">
                        <td className="p-2 font-semibold capitalize">{eye} Eye</td>
                        {(["unaided", "glasses", "pinhole", "near"] as const).map((col) => {
                          const k = `va_${eye}_${col}` as keyof OphthalmologyData;
                          return (
                            <td key={col} className="p-2">
                              <Input
                                placeholder={col === "near" ? "N6" : "6/6"}
                                value={(value[k] as string) || ""}
                                onChange={(e) => set({ [k]: e.target.value } as any)}
                                className="h-8"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Refraction</Label>
              <div className="overflow-x-auto mt-2 rounded-md border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                    <tr>
                      <th className="text-left p-2 font-medium">Eye</th>
                      <th className="text-left p-2 font-medium">Sphere</th>
                      <th className="text-left p-2 font-medium">Cylinder</th>
                      <th className="text-left p-2 font-medium">Axis</th>
                      <th className="text-left p-2 font-medium">Add</th>
                      <th className="text-left p-2 font-medium">Final VA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["right", "left"] as const).map((eye) => (
                      <tr key={eye} className="border-t">
                        <td className="p-2 font-semibold capitalize">{eye} Eye</td>
                        {(["sphere", "cylinder", "axis", "add", "final_va"] as const).map((col) => {
                          const k = `refraction_${eye}_${col}` as keyof OphthalmologyData;
                          const ph =
                            col === "sphere" ? "-0.50" : col === "cylinder" ? "-0.75" : col === "axis" ? "180" : col === "add" ? "+1.50" : "6/6";
                          return (
                            <td key={col} className="p-2">
                              <Input
                                placeholder={ph}
                                value={(value[k] as string) || ""}
                                onChange={(e) => set({ [k]: e.target.value } as any)}
                                className="h-8"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Auto Refraction</Label>
                <Input placeholder="Optional" value={value.auto_refraction || ""} onChange={(e) => set({ auto_refraction: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Cyclo Auto Refraction</Label>
                <Input
                  placeholder="Optional"
                  value={value.cyclo_auto_refraction || ""}
                  onChange={(e) => set({ cyclo_auto_refraction: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Retinoscopy</Label>
                <Input placeholder="Optional" value={value.retinoscopy || ""} onChange={(e) => set({ retinoscopy: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">IOP</Label>
                <Input placeholder="R/L mmHg" value={value.iop || ""} onChange={(e) => set({ iop: e.target.value })} />
              </div>
            </div>
          </TabsContent>

          {/* External Examination */}
          <TabsContent value="external" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">Pupil, lids, lacrimal passage and external findings</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Pupil</Label>
                <Textarea
                  rows={3}
                  placeholder="Pupil findings for both eyes"
                  value={value.pupil || ""}
                  onChange={(e) => set({ pupil: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Lids</Label>
                <Textarea
                  rows={3}
                  placeholder="Example: Meibomian capping, swelling, ptosis..."
                  value={value.lids || ""}
                  onChange={(e) => set({ lids: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Lacrimal Passage</Label>
                <Textarea
                  rows={3}
                  placeholder="Patent / blocked / discharge"
                  value={value.lacrimal_passage || ""}
                  onChange={(e) => set({ lacrimal_passage: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Other External Findings</Label>
                <Textarea
                  rows={3}
                  placeholder="Any additional findings"
                  value={value.other_external_findings || ""}
                  onChange={(e) => set({ other_external_findings: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* Anterior Segment */}
          <TabsContent value="anterior" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">Conjunctiva, sclera, cornea, AC, iris and lens</p>
            <div className="overflow-x-auto rounded-md border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                  <tr>
                    <th className="text-left p-2 font-medium w-32">Area</th>
                    <th className="text-left p-2 font-medium">Right Eye</th>
                    <th className="text-left p-2 font-medium">Left Eye</th>
                    <th className="text-left p-2 font-medium w-44">Quick Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ANTERIOR_ROWS.map((row) => {
                    const rk = `ant_${row.key}_right` as keyof OphthalmologyData;
                    const lk = `ant_${row.key}_left` as keyof OphthalmologyData;
                    const sk = `ant_${row.key}_status` as keyof OphthalmologyData;
                    return (
                      <tr key={row.key} className="border-t">
                        <td className="p-2 font-semibold">{row.label}</td>
                        <td className="p-2">
                          <Input
                            placeholder={row.rightPlaceholder}
                            value={(value[rk] as string) || ""}
                            onChange={(e) => set({ [rk]: e.target.value } as any)}
                            className="h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            placeholder={row.rightPlaceholder}
                            value={(value[lk] as string) || ""}
                            onChange={(e) => set({ [lk]: e.target.value } as any)}
                            className="h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Select value={(value[sk] as string) || ""} onValueChange={(v) => set({ [sk]: v } as any)}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {row.statuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Posterior Segment */}
          <TabsContent value="posterior" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">Fundus, optic disc, vitreous, macula and retina</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Fundus</Label>
                <Textarea rows={3} placeholder="Fundus findings" value={value.fundus || ""} onChange={(e) => set({ fundus: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Optic Disc</Label>
                <Textarea
                  rows={3}
                  placeholder="Disc color, margins, cup disc ratio"
                  value={value.optic_disc || ""}
                  onChange={(e) => set({ optic_disc: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Vitreous</Label>
                <Textarea
                  rows={3}
                  placeholder="Clear / floaters / hemorrhage"
                  value={value.vitreous || ""}
                  onChange={(e) => set({ vitreous: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">CD Ratio</Label>
                <Input placeholder="Example: 0.3 / 0.4" value={value.cd_ratio || ""} onChange={(e) => set({ cd_ratio: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Macula</Label>
                <Textarea rows={3} placeholder="Macula findings" value={value.macula || ""} onChange={(e) => set({ macula: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Peripheral Retina</Label>
                <Textarea
                  rows={3}
                  placeholder="Retina findings"
                  value={value.peripheral_retina || ""}
                  onChange={(e) => set({ peripheral_retina: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* Diagnosis & Plan */}
          <TabsContent value="plan" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">Final diagnosis, treatment and management plan</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Diagnosis</Label>
                <Textarea
                  rows={3}
                  placeholder="Example: Anisometropic amblyopia, refractive error, conjunctivitis..."
                  value={value.eye_diagnosis || ""}
                  onChange={(e) => set({ eye_diagnosis: e.target.value })}
                  className="mt-1"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {DIAGNOSIS_CHIPS.map((c) => (
                    <Chip key={c} label={c} onClick={() => appendChip("eye_diagnosis", c)} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold">Treatment Plan</Label>
                <Textarea
                  rows={3}
                  placeholder="Treatment plan for this visit"
                  value={value.treatment_plan || ""}
                  onChange={(e) => set({ treatment_plan: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Management Plan</Label>
                <Textarea
                  rows={3}
                  placeholder="Further management, referral, investigation, surgery plan..."
                  value={value.management_plan || ""}
                  onChange={(e) => set({ management_plan: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">OCT / Investigation Findings</Label>
                <Textarea
                  rows={3}
                  placeholder="OCT, scan, lab or other investigation findings"
                  value={value.oct_findings || ""}
                  onChange={(e) => set({ oct_findings: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
