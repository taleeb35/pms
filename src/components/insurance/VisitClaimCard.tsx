import { useCallback, useEffect, useState } from "react";
import { FileCheck2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/region";
import { netFee } from "@/lib/revenue";
import { claimStatus, type Claim } from "@/lib/insurance";
import ClaimDialog from "./ClaimDialog";

// F7: insurance claim for this visit. Shows the claim, or offers to create one from the visit fee.
type Props = { appointmentId: string; doctorId: string; patientId: string };

export default function VisitClaimCard({ appointmentId, doctorId, patientId }: Props) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [insured, setInsured] = useState<{ insurer: string | null; policy: string | null }>({ insurer: null, policy: null });
  const [amount, setAmount] = useState(0);
  const [editing, setEditing] = useState<Claim | null | "new">(null);

  const load = useCallback(async () => {
    const [c, p, a] = await Promise.all([
      (supabase as any).from("insurance_claims").select("*").eq("appointment_id", appointmentId).order("created_at"),
      (supabase as any).from("patients").select("insurance_provider, insurance_policy_number").eq("id", patientId).maybeSingle(),
      supabase.from("appointments").select("consultation_fee, procedure_fee, other_fee, refund").eq("id", appointmentId).maybeSingle(),
    ]);
    setClaims((c.data || []) as Claim[]);
    setInsured({ insurer: p.data?.insurance_provider || null, policy: p.data?.insurance_policy_number || null });
    setAmount(a.data ? netFee(a.data as any) : 0);
  }, [appointmentId, patientId]);

  useEffect(() => { void load(); }, [load]);

  // Only show the card when the patient has insurance or a claim already exists.
  if (!claims.length && !insured.insurer) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
          <span className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-primary" /> Insurance claim</span>
          {claims.length === 0 && <Button variant="outline" size="sm" className="h-7" onClick={() => setEditing("new")}><Plus className="mr-1 h-3.5 w-3.5" /> Create claim</Button>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {claims.length === 0 ? (
          <p className="text-xs text-muted-foreground">Patient is insured with {insured.insurer}. Create a claim for this visit ({money(amount)}).</p>
        ) : claims.map((c) => {
          const st = claimStatus(c.status);
          return (
            <button key={c.id} type="button" onClick={() => setEditing(c)} className="w-full rounded-md border p-2.5 text-left hover:bg-muted/50">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{c.insurer}</span>
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${st.tone}`}>{st.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Claimed {money(c.amount_claimed)}{c.amount_approved != null ? ` · Approved ${money(c.amount_approved)}` : ""}{c.claim_reference ? ` · Ref ${c.claim_reference}` : ""}
              </p>
            </button>
          );
        })}
      </CardContent>
      <ClaimDialog
        open={editing !== null}
        claim={editing && editing !== "new" ? editing : null}
        draft={{ doctor_id: doctorId, patient_id: patientId, appointment_id: appointmentId, insurer: insured.insurer, policy_number: insured.policy, amount }}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); void load(); }}
      />
    </Card>
  );
}
