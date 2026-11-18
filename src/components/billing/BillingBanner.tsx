import { Link } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trialDaysLeft, useBillingState } from "@/lib/billing";

// Shown at the top of every clinic, doctor and receptionist page for accounts billed through Stripe.
// Accounts the admin bills manually (exempt) never see it.
export default function BillingBanner({ portal }: { portal: "clinic" | "doctor" | "receptionist" | "doctor_receptionist" }) {
  const { state } = useBillingState(true);
  if (!state || state.exempt) return null;
  const subscriptionPath = state.kind === "clinic" ? "/clinic/subscription" : "/doctor/subscription";
  const ownerLink = state.is_owner && (portal === "clinic" || portal === "doctor");

  if (!state.can_write) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2 flex flex-wrap items-center gap-3">
          <span>
            <span className="font-semibold">Read-only:</span>{" "}
            {state.status === "past_due" ? "the last subscription payment failed." : "there is no active subscription."}{" "}
            You can view and export records, but not add or change them.
            {!ownerLink && " Please ask the account owner to subscribe."}
          </span>
          {ownerLink && (
            <Button asChild size="sm" variant="secondary"><Link to={subscriptionPath}>Subscribe</Link></Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (state.status === "none" || state.status === "canceled") {
    const days = trialDaysLeft(state.trial_end);
    if (days === null || days < 0) return null;
    return (
      <Alert className="mb-4 border-warning bg-warning/10">
        <Clock className="h-4 w-4 text-foreground" />
        <AlertDescription className="ml-2 flex flex-wrap items-center gap-3 text-foreground">
          <span>
            <span className="font-semibold">Free trial:</span>{" "}
            {days === 0 ? "last day today." : `${days} day${days === 1 ? "" : "s"} left.`}{" "}
            After the trial the account becomes read-only until a subscription is active.
          </span>
          {ownerLink && (
            <Button asChild size="sm" variant="outline"><Link to={subscriptionPath}>Subscribe</Link></Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}
