import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { moneySymbol } from "@/lib/region";
import { CLAIM_STATUSES, type Claim, type ClaimStatus } from "@/lib/insurance";

// Create or edit an insurance claim. New claims are filled in from the patient's insurance and the visit fee.
type Props = {
  open: boolean; onClose: () => void; onSaved: () => void;
  claim?: Claim | null;
  draft?: { doctor_id: string; patient_id: string; appointment_id?: string | null; insurer?: string | null; policy_number?: string | null; amount?: number };
};
const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export default function ClaimDialog({ open, onClose, onSaved, claim, draft }: Props) {
  const { toast } = useToast();
  const [f, setF] = useState({ insurer: "", policy_number: "", claim_reference: "", amount_claimed: "", amount_approved: "", status: "draft" as ClaimStatus, submitted_at: "", decided_at: "", notes: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setF({
      insurer: claim?.insurer || draft?.insurer || "",
      policy_number: claim?.policy_number || draft?.policy_number || "",
      claim_reference: claim?.claim_reference || "",
      amount_claimed: claim ? String(claim.amount_claimed ?? "") : draft?.amount ? String(draft.amount) : "",
      amount_approved: claim?.amount_approved == null ? "" : String(claim.amount_approved),
      status: claim?.status || "draft",
      submitted_at: claim?.submitted_at || "",
      decided_at: claim?.decided_at || "",
      notes: claim?.notes || "",
    });
  }, [open, claim, draft]);

  const num = (v: string) => v.trim() === "" || /^\d+(\.\d{1,2})?$/.test(v.trim());
  const ok = f.insurer.trim().length > 0 && num(f.amount_claimed) && num(f.amount_approved);

  // Fill in dates when the status moves on, so the list shows when things happened.
  const setStatus = (s: ClaimStatus) => {
    const today = format(new Date(), "yyyy-MM-dd");
    setF((x) => ({
      ...x, status: s,
      submitted_at: s !== "draft" && !x.submitted_at ? today : x.submitted_at,
      decided_at: ["approved", "partly_approved", "rejected", "paid"].includes(s) && !x.decided_at ? today : x.decided_at,
    }));
  };

  const save = async () => {
    if (!ok) return;
    setBusy(true);
    const payload: Record<string, unknown> = {
      insurer: f.insurer.trim(), policy_number: f.policy_number.trim() || null, claim_reference: f.claim_reference.trim() || null,
      amount_claimed: f.amount_claimed.trim() === "" ? 0 : Number(f.amount_claimed),
      amount_approved: f.amount_approved.trim() === "" ? null : Number(f.amount_approved),
      status: f.status, submitted_at: f.submitted_at || null, decided_at: f.decided_at || null, notes: f.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const res = claim
      ? await (supabase as any).from("insurance_claims").update(payload).eq("id", claim.id)
      : await (supabase as any).from("insurance_claims").insert({ ...payload, doctor_id: draft!.doctor_id, patient_id: draft!.patient_id, appointment_id: draft?.appointment_id || null });
    setBusy(false);
    if (res.error) { toast({ title: "Could not save the claim", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: claim ? "Claim updated" : "Claim created" });
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{claim ? "Insurance claim" : "New insurance claim"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2"><Label htmlFor="cl-ins">Insurer</Label><Input id="cl-ins" value={f.insurer} onChange={(e) => setF({ ...f, insurer: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="cl-pol">Policy number</Label><Input id="cl-pol" value={f.policy_number} onChange={(e) => setF({ ...f, policy_number: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="cl-ref">Claim reference</Label><Input id="cl-ref" value={f.claim_reference} onChange={(e) => setF({ ...f, claim_reference: e.target.value })} placeholder="From the insurer" /></div>
          <div className="space-y-1"><Label htmlFor="cl-amt">Amount claimed ({moneySymbol()})</Label><Input id="cl-amt" inputMode="decimal" value={f.amount_claimed} onChange={(e) => setF({ ...f, amount_claimed: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="cl-app">Amount approved ({moneySymbol()})</Label><Input id="cl-app" inputMode="decimal" value={f.amount_approved} onChange={(e) => setF({ ...f, amount_approved: e.target.value })} placeholder="When known" /></div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="cl-st">Status</Label>
            <select id="cl-st" className={selectCls} value={f.status} onChange={(e) => setStatus(e.target.value as ClaimStatus)}>
              {CLAIM_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label htmlFor="cl-sub">Submitted on</Label><Input id="cl-sub" type="date" value={f.submitted_at} onChange={(e) => setF({ ...f, submitted_at: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="cl-dec">Decided on</Label><Input id="cl-dec" type="date" value={f.decided_at} onChange={(e) => setF({ ...f, decided_at: e.target.value })} /></div>
          <div className="space-y-1 sm:col-span-2"><Label htmlFor="cl-notes">Notes</Label><Textarea id="cl-notes" rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
        </div>
        {!ok && <p className="text-xs text-destructive">Enter the insurer, and amounts as numbers (for example 1500 or 1500.50).</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy || !ok}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
