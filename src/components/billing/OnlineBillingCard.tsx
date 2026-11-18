import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usd } from "@/lib/pricingConfig";
import { STATUS_LABEL, billingAction, trialDaysLeft, useBillingState } from "@/lib/billing";
import CancelSubscriptionDialog from "@/components/billing/CancelSubscriptionDialog";

type Status = { connected: boolean; price_usd: number; billable_doctors?: number };

// Card payment by Stripe on the Subscription page. Hidden for accounts the admin bills manually.
export default function OnlineBillingCard() {
  const { toast } = useToast();
  const { state, loading, reload } = useBillingState(true);
  const [info, setInfo] = useState<Status | null>(null);
  const [busy, setBusy] = useState<"checkout" | "portal" | "resume" | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const resume = async () => {
    setBusy("resume");
    try {
      await billingAction("resume");
      toast({ title: "Subscription will continue", description: "The cancellation was undone." });
      void reload();
    } catch (e) {
      toast({ title: "Could not undo the cancellation", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    billingAction<Status>("status").then(setInfo).catch(() => setInfo(null));
  }, []);

  useEffect(() => {
    const r = params.get("billing");
    if (!r) return;
    if (r === "success") {
      toast({ title: "Payment details saved", description: "Your subscription will show here in a few seconds." });
      // The webhook usually lands within seconds; check again shortly.
      setTimeout(() => void reload(), 3000);
      setTimeout(() => void reload(), 8000);
    } else if (r === "cancelled") {
      toast({ title: "Checkout cancelled" });
    }
    params.delete("billing");
    setParams(params, { replace: true });
  }, [params, setParams, toast, reload]);

  if (loading || !state || state.exempt) return null;

  const go = async (action: "checkout" | "portal") => {
    setBusy(action);
    try {
      const { url } = await billingAction<{ url: string }>(action);
      window.location.href = url;
    } catch (e) {
      toast({ title: "Could not open Stripe", description: (e as Error).message, variant: "destructive" });
      setBusy(null);
    }
  };

  const subscribed = ["active", "trialing", "past_due", "unpaid", "paused"].includes(state.status);
  const days = trialDaysLeft(state.trial_end);
  const doctors = info?.billable_doctors ?? state.quantity ?? 1;
  const price = info?.price_usd ?? 35;

  return (
    <Card className={state.can_write ? "" : "border-destructive"}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <CreditCard className="h-5 w-5" /> Card payment
          <Badge variant={state.status === "active" ? "default" : state.can_write ? "secondary" : "destructive"}>
            {STATUS_LABEL[state.status] || state.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          {usd(price)} per doctor per month{state.kind === "clinic" ? ` × ${doctors} doctor${doctors === 1 ? "" : "s"} = ${usd(price * doctors)} per month` : ""}. Paid by card through Stripe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!subscribed && days !== null && days >= 0 && (
          <p>Free trial: {days === 0 ? "last day today" : `${days} day${days === 1 ? "" : "s"} left`}. If you subscribe now, the first charge is on {format(parseISO(state.trial_end!), "d MMM yyyy")}.</p>
        )}
        {!state.can_write && (
          <p className="text-destructive">The account is read-only until a subscription is active.</p>
        )}
        {subscribed && state.current_period_end && (
          <p className="text-muted-foreground">
            {state.cancel_at_period_end ? "Ends on " : state.status === "trialing" ? "First charge on " : "Next charge on "}
            {format(parseISO(state.current_period_end), "d MMM yyyy")}.
          </p>
        )}
        {!state.is_owner ? (
          <p className="text-muted-foreground">Only the account owner can change billing.</p>
        ) : info && !info.connected ? (
          <p className="text-muted-foreground">Card payment is not available yet. Please contact support.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!subscribed && (
              <Button onClick={() => go("checkout")} disabled={!!busy}>
                {busy === "checkout" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />} Subscribe
              </Button>
            )}
            {(subscribed || state.status === "canceled") && (
              <Button variant="outline" onClick={() => go("portal")} disabled={!!busy}>
                {busy === "portal" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />} Change card or billing details
              </Button>
            )}
            {subscribed && !state.cancel_at_period_end && (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setCancelOpen(true)} disabled={!!busy}>
                Cancel subscription
              </Button>
            )}
            {subscribed && state.cancel_at_period_end && (
              <Button onClick={resume} disabled={!!busy}>
                {busy === "resume" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Keep my subscription
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CancelSubscriptionDialog open={cancelOpen} onOpenChange={setCancelOpen} periodEnd={state.current_period_end} onDone={() => void reload()} />
    </Card>
  );
}
