import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logActivity } from "@/lib/activityLogger";
import { money, moneySymbol } from "@/lib/region";
import { useToast } from "@/hooks/use-toast";

// Change an appointment's status or fee right in the list, without opening the visit.
type Apt = {
  id: string; status: string; doctor_id?: string | null;
  consultation_fee?: number | null; other_fee?: number | null; procedure_fee?: number | null; refund?: number | null;
  patients?: { full_name?: string | null } | null;
};
type Patch = Record<string, unknown>;

const STATUSES: { value: string; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "start", label: "Started" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No-show" },
  { value: "cancelled", label: "Cancelled" },
];

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

export function InlineStatus({ apt, badge, onSaved }: { apt: Apt; badge: ReactNode; onSaved: (id: string, patch: Patch) => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const change = async (status: string) => {
    if (status === apt.status) return;
    setBusy(true);
    const patch: Patch = { status };
    if (status === "start") patch.started_at = new Date().toISOString();
    const { error } = await supabase.from("appointments").update(patch as any).eq("id", apt.id);
    setBusy(false);
    if (error) { toast({ title: "Could not change status", description: error.message, variant: "destructive" }); return; }
    onSaved(apt.id, patch);
    const label = STATUSES.find((s) => s.value === status)?.label || status;
    toast({ title: `Marked as ${label.toLowerCase()}`, description: apt.patients?.full_name || undefined });
    try {
      await logActivity({
        action: status === "cancelled" ? "appointment_cancelled" : status === "completed" ? "appointment_completed" : "appointment_status_changed",
        entityType: "appointment", entityId: apt.id,
        details: { doctorId: apt.doctor_id, patient_name: apt.patients?.full_name || "Unknown", old_status: apt.status, new_status: status },
      });
    } catch { /* logging is best effort */ }
  };

  return (
    <div onClick={stop} onKeyDown={stop} className="inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={busy} aria-label="Change status" title="Change status"
            className="inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">
            {badge}
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="z-50 w-44 bg-background">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Change status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUSES.map((s) => (
            <DropdownMenuItem key={s.value} onSelect={() => change(s.value)}>
              <Check className={`mr-2 h-4 w-4 ${s.value === apt.status ? "opacity-100" : "opacity-0"}`} />
              {s.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const num = (v: unknown) => Number(v || 0);
export const grossFee = (a: Apt) => num(a.consultation_fee) + num(a.other_fee) + num(a.procedure_fee);

export function InlineFee({ apt, onSaved }: { apt: Apt; onSaved: (id: string, patch: Patch) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [consult, setConsult] = useState("");
  const [other, setOther] = useState("");
  const [busy, setBusy] = useState(false);
  const gross = grossFee(apt);
  const refund = num(apt.refund);

  const openChange = (o: boolean) => {
    setOpen(o);
    if (o) { setConsult(apt.consultation_fee ? String(apt.consultation_fee) : ""); setOther(apt.other_fee ? String(apt.other_fee) : ""); }
  };

  const valid = (v: string) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v.trim()) && Number(v) >= 0);
  const ok = valid(consult) && valid(other);

  const save = async () => {
    if (!ok) return;
    const patch: Patch = { consultation_fee: consult === "" ? 0 : Number(consult), other_fee: other === "" ? 0 : Number(other) };
    if (patch.consultation_fee === num(apt.consultation_fee) && patch.other_fee === num(apt.other_fee)) { setOpen(false); return; }
    setBusy(true);
    const { error } = await supabase.from("appointments").update(patch as any).eq("id", apt.id);
    setBusy(false);
    if (error) { toast({ title: "Could not save the fee", description: error.message, variant: "destructive" }); return; }
    onSaved(apt.id, patch);
    setOpen(false);
    const total = Number(patch.consultation_fee) + Number(patch.other_fee) + num(apt.procedure_fee);
    toast({ title: "Fee saved", description: `${apt.patients?.full_name ? `${apt.patients.full_name}: ` : ""}${money(total)}` });
    try {
      await logActivity({
        action: "appointment_updated", entityType: "appointment", entityId: apt.id,
        details: { doctorId: apt.doctor_id, patient_name: apt.patients?.full_name || "Unknown", consultation_fee: patch.consultation_fee, other_fee: patch.other_fee },
      });
    } catch { /* logging is best effort */ }
  };

  return (
    <div onClick={stop} onKeyDown={stop} className="inline-flex">
      <Popover open={open} onOpenChange={openChange}>
        <PopoverTrigger asChild>
          <button type="button" aria-label="Edit fee" title="Edit fee"
            className="group inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            {gross > 0 ? <span className="font-medium tabular-nums">{money(gross - refund)}</span> : <span className="text-muted-foreground">Add fee</span>}
            <Pencil className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64" onClick={stop}>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <p className="text-sm font-medium">Fee for {apt.patients?.full_name || "this visit"}</p>
            <div className="space-y-1">
              <Label htmlFor={`cf-${apt.id}`} className="text-xs">Consultation fee ({moneySymbol()})</Label>
              <Input id={`cf-${apt.id}`} inputMode="decimal" autoFocus value={consult} onChange={(e) => setConsult(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`of-${apt.id}`} className="text-xs">Other fee ({moneySymbol()})</Label>
              <Input id={`of-${apt.id}`} inputMode="decimal" value={other} onChange={(e) => setOther(e.target.value)} placeholder="0" />
            </div>
            {(num(apt.procedure_fee) > 0 || refund > 0) && (
              <p className="text-xs text-muted-foreground">
                {num(apt.procedure_fee) > 0 && <>Procedure fee {money(apt.procedure_fee)}. </>}
                {refund > 0 && <>Refunded {money(refund)}. </>}
                Change these on the visit.
              </p>
            )}
            {!ok && <p className="text-xs text-destructive">Enter amounts as numbers, for example 35 or 35.50.</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!ok || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
