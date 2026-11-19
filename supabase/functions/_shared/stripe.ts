// Stripe helpers (plain fetch, no SDK). Keys live in public.app_secrets (service role only).
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

export const STRIPE_API_VERSION = "2024-06-20";
export const PRICE_LOOKUP_KEY = "zonoir_doctor_monthly_usd";
export const APP_URL = "https://app.zonoir.com";
export const WEBHOOK_URL = `${APP_URL}/functions/v1/stripe-webhook`;
export const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
];

export async function getSecrets(admin: SupabaseClient, keys: string[]): Promise<Record<string, string>> {
  const { data } = await admin.from("app_secrets").select("key, value").in("key", keys);
  const out: Record<string, string> = {};
  for (const r of data || []) out[r.key] = r.value;
  return out;
}

export async function setSecrets(admin: SupabaseClient, values: Record<string, string>): Promise<void> {
  const rows = Object.entries(values).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  const { error } = await admin.from("app_secrets").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

// Flatten {a: {b: 1}, c: [x, y]} into a[b]=1&c[0]=x&c[1]=y
function encode(params: Record<string, unknown>, prefix = "", out: string[] = []): string[] {
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object") encode(item as Record<string, unknown>, `${key}[${i}]`, out);
        else out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof v === "object") encode(v as Record<string, unknown>, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out;
}

export class StripeError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

export async function stripe<T = any>(
  secretKey: string, method: "GET" | "POST" | "DELETE", path: string, params: Record<string, unknown> = {},
): Promise<T> {
  const qs = encode(params).join("&");
  const url = `https://api.stripe.com/v1/${path}${method === "GET" && qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": STRIPE_API_VERSION,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? qs : undefined,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new StripeError(res.status, body?.error?.message || `Stripe error ${res.status}`, body?.error?.code);
  return body as T;
}

const enc = new TextEncoder();
function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Check the Stripe-Signature header (t=...,v1=...) against the raw body. 5 minute tolerance. */
export async function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300): Promise<boolean> {
  if (!header || !secret) return false;
  const parts = header.split(",").map((p) => p.trim().split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || sigs.length === 0) return false;
  const ts = Number(t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`)));
  return sigs.some((s) => safeEqual(s, expected));
}

/** Number of doctors billed for an owner: approved doctors of a clinic (at least 1), or 1 for a single doctor. */
export async function billableQuantity(admin: SupabaseClient, ownerId: string, kind: string): Promise<number> {
  if (kind !== "clinic") return 1;
  const { count } = await admin.from("doctors").select("id", { count: "exact", head: true }).eq("clinic_id", ownerId).eq("approved", true);
  return Math.max(1, count || 0);
}

/** Copy a Stripe subscription onto billing_accounts. */
export async function saveSubscription(admin: SupabaseClient, sub: any, ownerHint?: string): Promise<void> {
  const ownerId = sub?.metadata?.owner_id || ownerHint;
  const item = sub?.items?.data?.[0];
  const periodEnd = sub?.current_period_end ?? item?.current_period_end ?? null;
  const row = {
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    stripe_subscription_id: sub.id,
    status: String(sub.status || "none"),
    quantity: item?.quantity ?? null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    stripe_mode: sub.livemode ? "live" : "test",
    updated_at: new Date().toISOString(),
  };
  if (ownerId) {
    // An event about an old, ended subscription must not overwrite a newer one.
    const { data: cur } = await admin.from("billing_accounts").select("stripe_subscription_id, status").eq("owner_id", ownerId).maybeSingle();
    if (cur?.stripe_subscription_id && cur.stripe_subscription_id !== sub.id
        && ["active", "trialing", "past_due"].includes(cur.status) && !["active", "trialing"].includes(row.status)) return;
    const { error } = await admin.from("billing_accounts").update(row).eq("owner_id", ownerId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("billing_accounts").update(row).eq("stripe_customer_id", row.stripe_customer_id);
    if (error) throw new Error(error.message);
  }
}
