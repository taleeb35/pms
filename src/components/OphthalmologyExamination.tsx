import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Activity, ClipboardList, Layers, Microscope, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

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
  iop?: string;
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

const SectionCard = ({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: any;
  title: string;
  hint: string;
  children: React.ReactNode;
}) => (
  <Card className="border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/20">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <CardTitle className="text-blue-700 dark:text-blue-300 text-base flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export default function OphthalmologyExamination({ value, onChange }: Props) {
  const set = (patch: Partial<OphthalmologyData>) => onChange({ ...value, ...patch });
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

  return (
    <div className="space-y-4">
      {/* History & Presenting Complaints */}
      <SectionCard icon={ClipboardList} title="History & Presenting Complaints" hint="Quickly record symptoms and history">
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
      </SectionCard>

      {/* Vision & Refraction */}
      <SectionCard icon={Eye} title="Vision & Refraction" hint="VA, old glasses, refraction and IOP">
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
      </SectionCard>

      {/* External Examination */}
      <SectionCard icon={Stethoscope} title="External Examination" hint="Pupil, lids, lacrimal passage and external findings">
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
      </SectionCard>

      {/* Anterior Segment */}
      <SectionCard icon={Layers} title="Anterior Segment" hint="Conjunctiva, sclera, cornea, AC, iris and lens">
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
      </SectionCard>

      {/* Posterior Segment */}
      <SectionCard icon={Microscope} title="Posterior Segment" hint="Fundus, optic disc, vitreous, macula and retina">
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
      </SectionCard>

      {/* Diagnosis & Plan */}
      <SectionCard icon={Activity} title="Diagnosis & Plan" hint="Final diagnosis, treatment and management plan">
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
      </SectionCard>
    </div>
  );
}
