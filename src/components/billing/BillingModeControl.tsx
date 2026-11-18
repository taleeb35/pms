import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { STATUS_LABEL } from "@/lib/billing";

// Admin: choose whether a clinic (or single doctor) is billed manually or by card through Stripe.
export default function BillingModeControl({ ownerId, kind, onChange }: { ownerId: string; kind: "clinic" | "doctor"; onChange?: () => void }) {
  const [row, setRow] = useState<{ exempt: boolean; status: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any).from("billing_accounts").select("exempt, status").eq("owner_id", ownerId).maybeSingle();
    setRow(data || null);
  };
  useEffect(() => { void load(); }, [ownerId]);

  const setExempt = async (exempt: boolean) => {
    if (!exempt && !confirm("Switch to card billing through Stripe? If the trial is over and there is no active subscription, the account becomes read-only straight away.")) return;
    setBusy(true);
    let error;
    if (row) ({ error } = await (supabase as any).from("billing_accounts").update({ exempt }).eq("owner_id", ownerId));
    else ({ error } = await (supabase as any).rpc("admin_create_billing_account", { _owner: ownerId, _kind: kind, _exempt: exempt }));
    setBusy(false);
    if (error) { toast.error("Could not change billing: " + error.message); return; }
    toast.success(exempt ? "Billed manually" : "Billed by card through Stripe");
    void load();
    onChange?.();
  };

  const exempt = row ? row.exempt : false;
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <label className="text-sm font-medium text-muted-foreground block">Billing method</label>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {exempt ? (
          <Badge variant="secondary">Manual (payments recorded by admin)</Badge>
        ) : (
          <>
            <Badge>Card through Stripe</Badge>
            <span className="text-muted-foreground">{STATUS_LABEL[row?.status || "none"] || row?.status}</span>
          </>
        )}
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setExempt(!exempt)}>
          {exempt ? "Switch to Stripe" : "Switch to manual"}
        </Button>
      </div>
    </div>
  );
}
