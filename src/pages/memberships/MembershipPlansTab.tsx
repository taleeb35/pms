import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  clinic_id: string;
  name: string;
  price: number;
  duration_months: number;
  consultation_discount_pct: number;
  procedure_discount_pct: number;
  pharmacy_discount_pct: number;
  color: string;
  is_active: boolean;
  notes: string | null;
}

const PRESET_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444", "#0d9488"];

export default function MembershipPlansTab({ clinicId }: { clinicId: string }) {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Plan>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinic_membership_plans")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("price");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setPlans((data ?? []) as Plan[]);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [clinicId]);

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "", price: 0, duration_months: 12,
      consultation_discount_pct: 0, procedure_discount_pct: 0, pharmacy_discount_pct: 0,
      color: PRESET_COLORS[0], is_active: true, notes: "",
    });
    setOpen(true);
  };

  const openEdit = (p: Plan) => { setEditing(p); setForm(p); setOpen(true); };

  const save = async () => {
    if (!form.name?.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = {
      clinic_id: clinicId,
      name: form.name.trim(),
      price: Number(form.price ?? 0),
      duration_months: Number(form.duration_months ?? 12),
      consultation_discount_pct: Number(form.consultation_discount_pct ?? 0),
      procedure_discount_pct: Number(form.procedure_discount_pct ?? 0),
      pharmacy_discount_pct: Number(form.pharmacy_discount_pct ?? 0),
      color: form.color ?? "#6366f1",
      is_active: form.is_active ?? true,
      notes: form.notes ?? null,
    };
    const { error } = editing
      ? await supabase.from("clinic_membership_plans").update(payload).eq("id", editing.id)
      : await supabase.from("clinic_membership_plans").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Plan updated" : "Plan created" });
    setOpen(false);
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Define the membership plans your clinic offers.</p>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Plan</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Consultation %</TableHead>
              <TableHead>Procedure %</TableHead>
              <TableHead>Pharmacy %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
            ) : plans.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No plans yet. Create your first membership plan to get started.
              </TableCell></TableRow>
            ) : plans.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell>Rs {Number(p.price).toLocaleString()}</TableCell>
                <TableCell>{p.duration_months} months</TableCell>
                <TableCell>{Number(p.consultation_discount_pct)}%</TableCell>
                <TableCell>{Number(p.procedure_discount_pct)}%</TableCell>
                <TableCell>{Number(p.pharmacy_discount_pct)}%</TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Plan" : "New Membership Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Name *</Label>
              <Input placeholder="e.g. Gold Member" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (Rs)</Label>
                <Input type="number" min={0} step="0.01" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input type="number" min={1} step="1" value={form.duration_months ?? 12} onChange={(e) => setForm({ ...form, duration_months: Number(e.target.value) })} />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Discount Percentages</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Consultation %</Label>
                  <Input type="number" min={0} max={100} step="0.1" value={form.consultation_discount_pct ?? 0} onChange={(e) => setForm({ ...form, consultation_discount_pct: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Procedure %</Label>
                  <Input type="number" min={0} max={100} step="0.1" value={form.procedure_discount_pct ?? 0} onChange={(e) => setForm({ ...form, procedure_discount_pct: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Pharmacy %</Label>
                  <Input type="number" min={0} max={100} step="0.1" value={form.pharmacy_discount_pct ?? 0} onChange={(e) => setForm({ ...form, pharmacy_discount_pct: Number(e.target.value) })} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Pharmacy discount applies automatically on inventory invoices.</p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label>Card Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`h-9 w-9 rounded-lg border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes..." />
            </div>

            <label className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-medium">Active (available for new enrollments)</span>
              <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
