// Zonoir subscription billing through Stripe.
// Actions (POST JSON {action}):
//   status            signed-in user: billing state + whether online payment is available
//   checkout          billing owner (clinic owner or single doctor): Stripe Checkout link
//   portal            billing owner: Stripe customer portal link (change card, billing details)
//   history           billing owner: past invoices and card payments
//   cancel / resume   billing owner: cancel at period end with a reason (saved for admin), or undo
//   admin-status      admin: connection details
//   admin-connect     admin: {secret_key} saves the key, creates price, webhook and portal settings
//   sync-all          service role (daily cron): update doctor counts on running subscriptions
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { adminClient, authErrorResponse, requireRole, requireServiceRole, requireUser } from "../_shared/auth.ts";
import { buildCorsHeaders } from "../_shared/security.ts";
import {
  APP_URL, PRICE_LOOKUP_KEY, STRIPE_API_VERSION, StripeError, WEBHOOK_EVENTS, WEBHOOK_URL,
  billableQuantity, getSecrets, saveSubscription, setSecrets, stripe,
} from "../_shared/stripe.ts";

const KEY_RE = /^(sk|rk)_(live|test)_[A-Za-z0-9]{20,}$/;

serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const admin = adminClient();
  let body: any = {};
  try { body = await req.json(); } catch { /* empty body */ }
  const action = String(body?.action || "");

  try {
    if (action === "sync-all") {
      requireServiceRole(req);
      return json(200, await syncAll(admin));
    }

    if (action === "admin-status" || action === "admin-connect") {
      await requireRole(req, ["admin"], admin);
      if (action === "admin-status") return json(200, await adminStatus(admin));
      return json(200, await adminConnect(admin, String(body?.secret_key || "").trim()));
    }

    // Everything else: a signed-in user acting for their own billing owner.
    const user = await requireUser(req, admin);
    const token = (req.headers.get("Authorization") || "").slice(7);
    const asUser = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: state, error: stErr } = await asUser.rpc("my_billing_state");
    if (stErr) throw new Error(stErr.message);
    const secrets = await getSecrets(admin, ["stripe_secret_key", "stripe_price_id", "stripe_portal_config"]);
    const connected = !!(secrets.stripe_secret_key && secrets.stripe_price_id);
    const { data: priceRow } = await admin.from("system_settings").select("value").eq("key", "stripe_price_usd").maybeSingle();
    const priceUsd = Number(priceRow?.value) || 35;

    if (action === "status") {
      if (!state) return json(200, { state: null, connected, price_usd: priceUsd });
      const quantity = state.kind === "clinic" ? await billableQuantity(admin, state.owner_id, "clinic") : 1;
      return json(200, { state, connected, price_usd: priceUsd, billable_doctors: quantity });
    }

    if (!state) return json(400, { error: "No billing account for this login." });
    if (!state.is_owner) return json(403, { error: "Only the clinic owner can manage billing." });
    if (!connected) return json(400, { error: "Online payment is not set up yet. Please contact support." });
    const key = secrets.stripe_secret_key;
    const ownerId: string = state.owner_id;
    const back = `${APP_URL}/${state.kind === "clinic" ? "clinic" : "doctor"}/subscription`;

    const { data: acct } = await admin.from("billing_accounts").select("*").eq("owner_id", ownerId).maybeSingle();
    if (!acct) return json(400, { error: "No billing account for this login." });
    if (acct.exempt) return json(400, { error: "This account is billed manually. Please contact support." });

    // Past invoices and card payments, read from Stripe for this customer only.
    if (action === "history") {
      if (!acct.stripe_customer_id) return json(200, { invoices: [], payments: [] });
      const [inv, ch] = await Promise.all([
        stripe(key, "GET", "invoices", { customer: acct.stripe_customer_id, limit: 24 }),
        stripe(key, "GET", "charges", { customer: acct.stripe_customer_id, limit: 24 }),
      ]);
      const invoices = (inv?.data || []).filter((i: any) => i.status !== "draft").map((i: any) => ({
        id: i.id, number: i.number, created: i.created, status: i.status,
        total: i.total, amount_paid: i.amount_paid, amount_due: i.amount_due, currency: i.currency,
        period_start: i.lines?.data?.[0]?.period?.start ?? i.period_start, period_end: i.lines?.data?.[0]?.period?.end ?? i.period_end,
        hosted_invoice_url: i.hosted_invoice_url, invoice_pdf: i.invoice_pdf,
      }));
      const payments = (ch?.data || []).map((c: any) => ({
        id: c.id, created: c.created, amount: c.amount, amount_refunded: c.amount_refunded, currency: c.currency,
        status: c.status, paid: c.paid, refunded: c.refunded,
        card: c.payment_method_details?.card ? `${c.payment_method_details.card.brand} •••• ${c.payment_method_details.card.last4}` : null,
        failure: c.failure_message || null, receipt_url: c.receipt_url,
      }));
      return json(200, { invoices, payments });
    }

    // Cancel at the end of the paid period, with the reason the owner gave.
    if (action === "cancel" || action === "resume") {
      if (!acct.stripe_subscription_id || !["active", "trialing", "past_due", "unpaid"].includes(acct.status)) {
        return json(400, { error: "There is no running subscription." });
      }
      if (action === "cancel") {
        const reason = String(body?.reason || "").trim().slice(0, 100);
        const comment = String(body?.comment || "").trim().slice(0, 2000);
        if (!reason) return json(400, { error: "Please choose a reason." });
        const sub = await stripe(key, "POST", `subscriptions/${acct.stripe_subscription_id}`, {
          cancel_at_period_end: "true",
          cancellation_details: { comment: `${reason}${comment ? `: ${comment}` : ""}`.slice(0, 500) },
        });
        await saveSubscription(admin, sub, ownerId);
        const ends = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
        await admin.from("billing_cancel_feedback").insert({
          owner_id: ownerId, kind: state.kind, user_id: user.id, reason, comment: comment || null,
          ends_at: ends ? new Date(ends * 1000).toISOString() : null,
        });
        return json(200, { ok: true, ends_at: ends ? new Date(ends * 1000).toISOString() : null });
      }
      const sub = await stripe(key, "POST", `subscriptions/${acct.stripe_subscription_id}`, { cancel_at_period_end: "false" });
      await saveSubscription(admin, sub, ownerId);
      const { data: last } = await admin.from("billing_cancel_feedback").select("id").eq("owner_id", ownerId).is("undone_at", null)
        .order("created_at", { ascending: false }).limit(1);
      if (last?.[0]) await admin.from("billing_cancel_feedback").update({ undone_at: new Date().toISOString() }).eq("id", last[0].id);
      return json(200, { ok: true });
    }

    let customerId: string | null = acct.stripe_customer_id;
    if (!customerId) {
      const { data: ou } = await admin.auth.admin.getUserById(ownerId);
      let name = ou?.user?.email || undefined;
      if (state.kind === "clinic") {
        const { data: c } = await admin.from("clinics").select("clinic_name").eq("id", ownerId).maybeSingle();
        name = c?.clinic_name || name;
      } else {
        const { data: p } = await admin.from("profiles").select("full_name").eq("id", ownerId).maybeSingle();
        name = p?.full_name || name;
      }
      const cus = await stripe(key, "POST", "customers", {
        email: ou?.user?.email || user.email, name, metadata: { owner_id: ownerId, kind: state.kind },
      });
      customerId = cus.id;
      await admin.from("billing_accounts").update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() }).eq("owner_id", ownerId);
    }

    if (action === "portal") {
      const s = await stripe(key, "POST", "billing_portal/sessions", {
        customer: customerId, return_url: back,
        ...(secrets.stripe_portal_config ? { configuration: secrets.stripe_portal_config } : {}),
      });
      return json(200, { url: s.url });
    }

    if (action === "checkout") {
      if (["active", "trialing", "past_due"].includes(acct.status) && acct.stripe_subscription_id) {
        return json(400, { error: "There is already a subscription. Use Manage billing instead." });
      }
      const quantity = await billableQuantity(admin, ownerId, state.kind);
      // Still inside the free trial: first charge when the trial ends (Stripe needs at least 2 days).
      let trialEnd: number | undefined;
      if (state.trial_end) {
        const end = Math.floor(new Date(`${state.trial_end}T23:59:00Z`).getTime() / 1000);
        if (end - Date.now() / 1000 > 2 * 86400 + 600) trialEnd = end;
      }
      const s = await stripe(key, "POST", "checkout/sessions", {
        mode: "subscription",
        customer: customerId,
        client_reference_id: ownerId,
        line_items: [{ price: secrets.stripe_price_id, quantity }],
        metadata: { owner_id: ownerId },
        subscription_data: { metadata: { owner_id: ownerId, kind: state.kind }, ...(trialEnd ? { trial_end: trialEnd } : {}) },
        success_url: `${back}?billing=success`,
        cancel_url: `${back}?billing=cancelled`,
      });
      return json(200, { url: s.url });
    }

    return json(400, { error: "Unknown action" });
  } catch (e) {
    const r = authErrorResponse(e, cors);
    if (r) return r;
    if (e instanceof StripeError) {
      console.error("stripe-billing stripe error", e.status, e.code, e.message);
      return json(502, { error: `Stripe: ${e.message}` });
    }
    console.error("stripe-billing error", e);
    return json(500, { error: e instanceof Error ? e.message : "Server error" });
  }
});

async function adminStatus(admin: ReturnType<typeof adminClient>) {
  const s = await getSecrets(admin, ["stripe_secret_key", "stripe_price_id", "stripe_webhook_id", "stripe_account", "stripe_connected_at"]);
  if (!s.stripe_secret_key) return { connected: false };
  let account: any = null;
  try { account = await stripe(s.stripe_secret_key, "GET", "account"); } catch (e) { account = { error: (e as Error).message }; }
  return {
    connected: !!s.stripe_price_id,
    mode: s.stripe_secret_key.includes("_live_") ? "live" : "test",
    key_hint: `${s.stripe_secret_key.slice(0, 8)}…${s.stripe_secret_key.slice(-4)}`,
    account_id: account?.id ?? s.stripe_account ?? null,
    account_name: account?.settings?.dashboard?.display_name ?? account?.business_profile?.name ?? null,
    country: account?.country ?? null,
    charges_enabled: account?.charges_enabled ?? null,
    payouts_enabled: account?.payouts_enabled ?? null,
    account_error: account?.error ?? null,
    webhook: !!s.stripe_webhook_id,
    connected_at: s.stripe_connected_at ?? null,
  };
}

async function adminConnect(admin: ReturnType<typeof adminClient>, key: string) {
  if (!KEY_RE.test(key)) throw new StripeError(400, "That does not look like a Stripe secret key (sk_live_… or sk_test_…).");
  const account = await stripe(key, "GET", "account");
  const { data: priceRow } = await admin.from("system_settings").select("value").eq("key", "stripe_price_usd").maybeSingle();
  const cents = Math.round((Number(priceRow?.value) || 35) * 100);

  // Price: reuse the one with our lookup key when the amount still matches.
  const found = await stripe(key, "GET", "prices", { lookup_keys: [PRICE_LOOKUP_KEY], active: "true", limit: 1 });
  let price = found?.data?.[0];
  if (!price || price.unit_amount !== cents || price.currency !== "usd") {
    let productId: string | undefined = price?.product;
    if (!productId) {
      const product = await stripe(key, "POST", "products", { name: "Zonoir", metadata: { zonoir: "subscription" } });
      productId = product.id;
    }
    price = await stripe(key, "POST", "prices", {
      product: productId, currency: "usd", unit_amount: cents, recurring: { interval: "month" },
      lookup_key: PRICE_LOOKUP_KEY, transfer_lookup_key: "true", nickname: "Per doctor per month",
    });
  }

  // Webhook: remove our old endpoint (its secret can't be read again) and create a fresh one.
  const hooks = await stripe(key, "GET", "webhook_endpoints", { limit: 100 });
  for (const h of hooks?.data || []) {
    if (h.url === WEBHOOK_URL) await stripe(key, "DELETE", `webhook_endpoints/${h.id}`);
  }
  const hook = await stripe(key, "POST", "webhook_endpoints", {
    url: WEBHOOK_URL, enabled_events: WEBHOOK_EVENTS, api_version: STRIPE_API_VERSION, description: "Zonoir app billing",
  });

  // Customer portal: update card, see invoices, cancel at period end.
  const portal = await stripe(key, "POST", "billing_portal/configurations", {
    business_profile: { privacy_policy_url: "https://zonoir.com/privacy-policy/", terms_of_service_url: "https://zonoir.com/terms-of-service/" },
    features: {
      payment_method_update: { enabled: "true" },
      invoice_history: { enabled: "true" },
      customer_update: { enabled: "true", allowed_updates: ["email", "address", "name"] },
      // Cancelling happens in the app so the reason is collected first.
      subscription_cancel: { enabled: "false" },
    },
  });

  await setSecrets(admin, {
    stripe_secret_key: key,
    stripe_price_id: price.id,
    stripe_webhook_id: hook.id,
    stripe_webhook_secret: hook.secret,
    stripe_portal_config: portal.id,
    stripe_account: account.id,
    stripe_connected_at: new Date().toISOString(),
  });
  return { ok: true, ...(await adminStatus(admin)) };
}

async function syncAll(admin: ReturnType<typeof adminClient>) {
  const s = await getSecrets(admin, ["stripe_secret_key"]);
  if (!s.stripe_secret_key) return { ok: true, skipped: "not connected" };
  const { data: rows } = await admin.from("billing_accounts").select("owner_id, kind, stripe_subscription_id, quantity")
    .eq("exempt", false).not("stripe_subscription_id", "is", null).in("status", ["active", "trialing", "past_due"]);
  let updated = 0;
  for (const r of rows || []) {
    try {
      const want = await billableQuantity(admin, r.owner_id, r.kind);
      const sub = await stripe(s.stripe_secret_key, "GET", `subscriptions/${r.stripe_subscription_id}`);
      const item = sub?.items?.data?.[0];
      if (item && item.quantity !== want) {
        const next = await stripe(s.stripe_secret_key, "POST", `subscriptions/${sub.id}`, {
          items: [{ id: item.id, quantity: want }], proration_behavior: "create_prorations",
        });
        await saveSubscription(admin, next, r.owner_id);
        updated++;
      }
    } catch (e) {
      console.error("sync-all", r.owner_id, (e as Error).message);
    }
  }
  return { ok: true, checked: rows?.length || 0, updated };
}
