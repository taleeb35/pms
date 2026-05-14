import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Plan {
  id: string; name: string; price: number; duration_months: number;
  consultation_discount_pct: number; procedure_discount_pct: number; pharmacy_discount_pct: number; color: string;
}
interface Patient { id: string; full_name: string; phone: string | null; patient_id: string | null; }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clinicId: string;
  fixedPatient?: Patient;
  onEnrolled?: () => void;
}

export default function EnrollMembershipDialog({ open, onOpenChange, clinicId, fixedPatient, onEnrolled }: Props) {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [planId, setPlanId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(fixedPatient ?? null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPatient(fixedPatient ?? null);
    setPlanId(""); setStartDate(new Date().toISOString().slice(0, 10));
    setAmountPaid(""); setNotes(""); setSearch("");
    void loadPlans();
  }, [open, fixedPatient]);

  const loadPlans = async () => {
    const { data } = await supabase
      .from("clinic_membership_plans")
      .select("*")
      .eq("clinic_id", clinicId)
      .eq("is_active", true)
      .order("price");
    setPlans((data ?? []) as Plan[]);
  };

  useEffect(() => {
    if (fixedPatient || !searchOpen) return;
    const q = search.trim();
    if (q.length < 2) { setPatients([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("patients")
        .select("id, full_name, phone, patient_id")
        .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,patient_id.ilike.%${q}%`)
        .limit(20);
      setPatients((data ?? []) as Patient[]);
    }, 250);
    return () => clearTimeout(t);
  }, [search, searchOpen, fixedPatient]);

  const selectedPlan = plans.find(p => p.id === planId);

  useEffect(() => {
    if (selectedPlan && amountPaid === "") setAmountPaid(Number(selectedPlan.price));
  }, [selectedPlan]); // eslint-disable-line

  const submit = async () => {
    if (!patient) { toast({ title: "Select a patient", variant: "destructive" }); return; }
    if (!planId) { toast({ title: "Select a plan", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.rpc("enroll_patient_membership", {
      _clinic_id: clinicId,
      _patient_id: patient.id,
      _plan_id: planId,
      _start_date: startDate,
      _amount_paid: amountPaid === "" ? null : Number(amountPaid),
      _notes: notes || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Membership enrolled" });
    onOpenChange(false);
    onEnrolled?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Enroll Membership</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {!fixedPatient && (
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    {patient ? `${patient.full_name} · ${patient.phone ?? ""}` : "Search by name, phone, or ID..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[420px]" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput placeholder="Type at least 2 characters..." value={search} onValueChange={setSearch} />
                    <CommandList>
                      <CommandEmpty>No patients found</CommandEmpty>
                      <CommandGroup>
                        {patients.map((p) => (
                          <CommandItem key={p.id} value={p.id} onSelect={() => { setPatient(p); setSearchOpen(false); }}>
                            <div>
                              <div className="font-medium">{p.full_name}</div>
                              <div className="text-xs text-muted-foreground">{p.phone} · {p.patient_id}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          {fixedPatient && (
            <div className="rounded-md bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Patient: </span>
              <span className="font-medium">{fixedPatient.full_name}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Plan *</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger><SelectValue placeholder={plans.length ? "Choose plan" : "No active plans yet"} /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — Rs {Number(p.price).toLocaleString()} / {p.duration_months}mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPlan && (
              <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                {selectedPlan.consultation_discount_pct > 0 && <div>• {selectedPlan.consultation_discount_pct}% off consultation</div>}
                {selectedPlan.procedure_discount_pct > 0 && <div>• {selectedPlan.procedure_discount_pct}% off procedures</div>}
                {selectedPlan.pharmacy_discount_pct > 0 && <div>• {selectedPlan.pharmacy_discount_pct}% off pharmacy</div>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid (Rs)</Label>
              <Input type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>

          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-900">
            Enrolling will automatically cancel any existing active membership for this patient.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
