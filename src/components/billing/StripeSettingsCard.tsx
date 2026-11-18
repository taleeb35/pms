import { useEffect, useState } from "react";
import { CreditCard, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { billingAction } from "@/lib/billing";

type AdminStatus = {
  connected: boolean; mode?: "live" | "test"; key_hint?: string; account_id?: string | null; account_name?: string | null;
  country?: string | null; charges_enabled?: boolean | null; payouts_enabled?: boolean | null; account_error?: string | null;
  webhook?: boolean; connected_at?: string | null;
};

// Admin: connect Zonoir's Stripe account. The key is sent straight to the server and never shown again.
export default function StripeSettingsCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => billingAction<AdminStatus>("admin-status").then(setStatus).catch((e) => setStatus({ connected: false, account_error: e.message }));
  useEffect(() => { void load(); }, []);

  const connect = async () => {
    setBusy(true);
    try {
      const s = await billingAction<AdminStatus>("admin-connect", { secret_key: key.trim() });
      setStatus(s);
      setKey("");
      toast({ title: "Stripe connected", description: `${s.mode === "live" ? "Live" : "Test"} mode, account ${s.account_id}` });
    } catch (e) {
      toast({ title: "Could not connect Stripe", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Stripe (card payments)</CardTitle>
        <CardDescription>
          Subscriptions for clinics and single doctors. Connecting creates the monthly price, the webhook and the customer billing portal in your Stripe account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.connected ? (
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Connected
              <Badge variant={status.mode === "live" ? "default" : "secondary"}>{status.mode === "live" ? "Live" : "Test mode"}</Badge>
            </p>
            <p className="text-muted-foreground">Account {status.account_id}{status.account_name ? ` (${status.account_name})` : ""}{status.country ? `, ${status.country}` : ""} · key {status.key_hint}</p>
            <p className="text-muted-foreground">
              Card payments {status.charges_enabled ? "enabled" : "not enabled yet"} · payouts {status.payouts_enabled ? "enabled" : "not enabled yet"} · webhook {status.webhook ? "set up" : "missing"}
            </p>
            {status.charges_enabled === false && (
              <p className="flex items-center gap-1 text-amber-700"><AlertTriangle className="h-4 w-4" /> Finish activating the account in the Stripe dashboard before clinics can pay.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{status?.account_error ? `Not connected: ${status.account_error}` : "Not connected."}</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="stripe-key">{status?.connected ? "Replace secret key" : "Secret key"}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="stripe-key" type="password" autoComplete="off" placeholder="sk_live_… or sk_test_…" value={key} onChange={(e) => setKey(e.target.value)} />
            <Button onClick={connect} disabled={busy || key.trim().length < 20}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {status?.connected ? "Reconnect" : "Connect"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Stripe dashboard → Developers → API keys → Secret key. Use a test key (sk_test_…) first to try a payment with a test card.</p>
        </div>
      </CardContent>
    </Card>
  );
}
