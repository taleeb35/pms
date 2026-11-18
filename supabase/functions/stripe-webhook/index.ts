// Receives Stripe events (no login; the Stripe-Signature header is the only permission).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient } from "../_shared/auth.ts";
import { getSecrets, saveSubscription, stripe, verifyStripeSignature } from "../_shared/stripe.ts";

serve(async (req: Request) => {
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });

  const payload = await req.text();
  if (payload.length > 512 * 1024) return reply(413, { error: "Too large" });
  const admin = adminClient();
  const s = await getSecrets(admin, ["stripe_webhook_secret", "stripe_secret_key"]);
  if (!s.stripe_webhook_secret) return reply(503, { error: "Not configured" });

  const ok = await verifyStripeSignature(payload, req.headers.get("Stripe-Signature"), s.stripe_webhook_secret);
  if (!ok) return reply(400, { error: "Bad signature" });

  let event: any;
  try { event = JSON.parse(payload); } catch { return reply(400, { error: "Bad JSON" }); }
  const obj = event?.data?.object;

  try {
    switch (event?.type) {
      case "checkout.session.completed": {
        const ownerId = obj?.client_reference_id || obj?.metadata?.owner_id;
        if (obj?.mode === "subscription" && obj?.subscription && ownerId) {
          // Make sure the session's customer belongs to this owner before linking.
          const { data: acct } = await admin.from("billing_accounts").select("stripe_customer_id").eq("owner_id", ownerId).maybeSingle();
          if (acct && (!acct.stripe_customer_id || acct.stripe_customer_id === obj.customer)) {
            const sub = await stripe(s.stripe_secret_key, "GET", `subscriptions/${obj.subscription}`);
            await saveSubscription(admin, sub, ownerId);
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await saveSubscription(admin, obj);
        break;
      case "invoice.paid":
      case "invoice.payment_failed": {
        // Re-read the subscription so the status is current.
        if (obj?.subscription && s.stripe_secret_key) {
          const sub = await stripe(s.stripe_secret_key, "GET", `subscriptions/${obj.subscription}`);
          await saveSubscription(admin, sub);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("stripe-webhook", event?.type, (e as Error).message);
    return reply(500, { error: "Processing failed" }); // Stripe will retry
  }
  return reply(200, { received: true });
});
