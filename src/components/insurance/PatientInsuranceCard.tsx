import { useEffect, useState } from "react";
import { ShieldCheck, Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { friendlyDate } from "@/lib/datetime";
import { zonedNow } from "@/lib/region";

// F7: the patient's insurance (insurer, policy number, valid until), used to fill in new claims.
export default function PatientInsuranceCard({ patientId }: { patientId: string }) {
  const { toast } = useToast();
  const [ins, setIns] = useState({ insurance_provider: "", insurance_policy_number: "", insurance_valid_until: "" });
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(ins);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (supabase as any).from("patients").select("insurance_provider, insurance_policy_number, insurance_valid_until").eq("id", patientId).maybeSingle()
      .then(({ data }: any) => {
        const v = { insurance_provider: data?.insurance_provider || "", insurance_policy_number: data?.insurance_policy_number || "", insurance_valid_until: data?.insurance_valid_until || "" };
        setIns(v); setDraft(v);
      });
  }, [patientId]);

  const save = async () => {
    setBusy(true);
    const patch = { insurance_provider: draft.insurance_provider.trim() || null, insurance_policy_number: draft.insurance_policy_number.trim() || null, insurance_valid_until: draft.insurance_valid_until || null };
    const { error } = await (supabase as any).from("patients").update(patch).eq("id", patientId);
    setBusy(false);
    if (error) { toast({ title: "Could not save insurance", description: error.message, variant: "destructive" }); return; }
    setIns({ insurance_provider: patch.insurance_provider || "", insurance_policy_number: patch.insurance_policy_number || "", insurance_valid_until: patch.insurance_valid_until || "" });
    setEdit(false);
    toast({ title: "Insurance saved" });
  };

  const expired = !!ins.insurance_valid_until && ins.insurance_valid_until < zonedNow().ymd;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Insurance</span>
          {!edit && <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setDraft(ins); setEdit(true); }}><Pencil className="mr-1 h-3.5 w-3.5" /> {ins.insurance_provider ? "Edit" : "Add"}</Button>}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {edit ? (
          <div className="space-y-2">
            <div className="space-y-1"><Label htmlFor={`ins-p-${patientId}`} className="text-xs">Insurer</Label><Input id={`ins-p-${patientId}`} value={draft.insurance_provider} onChange={(e) => setDraft({ ...draft, insurance_provider: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor={`ins-n-${patientId}`} className="text-xs">Policy number</Label><Input id={`ins-n-${patientId}`} value={draft.insurance_policy_number} onChange={(e) => setDraft({ ...draft, insurance_policy_number: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor={`ins-v-${patientId}`} className="text-xs">Valid until</Label><Input id={`ins-v-${patientId}`} type="date" value={draft.insurance_valid_until} onChange={(e) => setDraft({ ...draft, insurance_valid_until: e.target.value })} /></div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setEdit(false)}>Cancel</Button>
              <Button size="sm" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </div>
          </div>
        ) : ins.insurance_provider ? (
          <div className="space-y-0.5">
            <p className="font-medium">{ins.insurance_provider}</p>
            {ins.insurance_policy_number && <p className="text-muted-foreground">Policy {ins.insurance_policy_number}</p>}
            {ins.insurance_valid_until && <p className="text-muted-foreground">Valid until {friendlyDate(ins.insurance_valid_until)} {expired && <Badge variant="outline" className="ml-1 border-rose-300 text-rose-700">Expired</Badge>}</p>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No insurance recorded.</p>
        )}
      </CardContent>
    </Card>
  );
}
