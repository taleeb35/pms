import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Stripe subscription state for the signed-in user (see migration 20261118110000_stripe_billing.sql).
export type BillingState = {
  owner_id: string;
  kind: "clinic" | "doctor";
  is_owner: boolean;
  exempt: boolean;
  status: string; // none | trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired | paused
  trial_end: string | null;
  can_write: boolean;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  quantity: number | null;
};

export function useBillingState(enabled = true) {
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(enabled);
  const load = useCallback(async () => {
    if (!enabled) return;
    const { data } = await (supabase as any).rpc("my_billing_state");
    setState((data as BillingState) || null);
    setLoading(false);
  }, [enabled]);
  useEffect(() => { void load(); }, [load]);
  return { state, loading, reload: load };
}

/** Call the stripe-billing function. Throws with the server's message on failure. */
export async function billingAction<T = any>(action: string, extra: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("stripe-billing", { body: { action, ...extra } });
  if (error) {
    let msg = error.message;
    try {
      const body = await (error as any).context?.json?.();
      if (body?.error) msg = body.error;
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  return data as T;
}

export { trialDaysLeft, STATUS_LABEL } from "./billingUtils";
