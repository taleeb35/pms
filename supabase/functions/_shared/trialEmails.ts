// Trial emails (cron, service role): "ends in 3 days" and "trial has ended".
// Accounts billed by card through Stripe get a Subscribe button to their Billing & Subscription page;
// accounts the admin bills manually are asked to contact support. Accounts with a running
// subscription get nothing.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const APP = "https://app.zonoir.com";
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const longDate = (s: string) => new Date(`${s}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

type Recipient = { ownerId: string; kind: "clinic" | "doctor"; email: string; greeting: string; name: string; trialEnd: string };

async function recipients(db: SupabaseClient, trialEnd: string): Promise<Recipient[]> {
  const [cl, dr] = await Promise.all([
    db.from("clinics").select("id, clinic_name, trial_end_date, profiles!clinics_id_fkey(email, full_name)").eq("status", "active").eq("trial_end_date", trialEnd),
    db.from("doctors").select("id, trial_end_date, profiles!doctors_id_fkey(email, full_name)").is("clinic_id", null).eq("approved", true).eq("trial_end_date", trialEnd),
  ]);
  if (cl.error) throw cl.error;
  if (dr.error) throw dr.error;
  const out: Recipient[] = [];
  for (const c of cl.data || []) {
    const p = (c as any).profiles;
    if (p?.email) out.push({ ownerId: c.id, kind: "clinic", email: p.email, greeting: p.full_name || c.clinic_name, name: c.clinic_name, trialEnd: c.trial_end_date });
  }
  for (const d of dr.data || []) {
    const p = (d as any).profiles;
    if (p?.email) out.push({ ownerId: d.id, kind: "doctor", email: p.email, greeting: `Dr. ${p.full_name || ""}`.trim(), name: "your account", trialEnd: d.trial_end_date });
  }
  return out;
}

function html(r: Recipient, which: "reminder" | "expired", stripeBilled: boolean): { subject: string; body: string } {
  const page = `${APP}/${r.kind === "clinic" ? "clinic" : "doctor"}/subscription`;
  const forWhat = r.kind === "clinic" ? ` for <strong>${esc(r.name)}</strong>` : "";
  const subject = which === "reminder" ? "Zonoir - Your free trial ends in 3 days" : "Zonoir - Your free trial has ended";
  const lead = which === "reminder"
    ? `Your 14-day free trial${forWhat} on Zonoir ends on <strong>${esc(longDate(r.trialEnd))}</strong>.`
    : `Your 14-day free trial${forWhat} on Zonoir ended on <strong>${esc(longDate(r.trialEnd))}</strong>.`;
  const next = stripeBilled
    ? (which === "reminder"
      ? "Subscribe before then to keep adding and changing records. After the trial, the account becomes read-only until a subscription is active. Your records stay safe either way."
      : "Your account is now read-only: you can still view and export your records, but not add or change them. Subscribe to continue.")
    : "Please contact our support team to set up your subscription.";
  const button = stripeBilled
    ? `<p style="text-align:center;margin:28px 0"><a href="${page}" style="background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block">Subscribe</a></p>
       <p style="font-size:13px;color:#666;text-align:center">Or open Billing &amp; Subscription in Zonoir: ${page}</p>`
    : "";
  const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:24px;border-radius:10px 10px 0 0;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">${which === "reminder" ? "Your free trial ends soon" : "Your free trial has ended"}</h1>
  </div>
  <div style="background:#f8f9fa;padding:28px;border-radius:0 0 10px 10px">
    <p style="font-size:16px">Dear <strong>${esc(r.greeting)}</strong>,</p>
    <p style="font-size:16px">${lead}</p>
    <p style="font-size:16px">${next}</p>
    ${button}
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
    <p style="font-size:12px;color:#888;text-align:center">This is an automated message from Zonoir.</p>
  </div>
</body></html>`;
  return { subject, body };
}

/** Send the emails. `which` = "reminder" (trial ends in 3 days) or "expired" (trial ended yesterday). */
export async function sendTrialEmails(db: SupabaseClient, which: "reminder" | "expired", resendKey: string, today = new Date()) {
  const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  day.setUTCDate(day.getUTCDate() + (which === "reminder" ? 3 : -1));
  const trialEnd = ymd(day);
  const list = await recipients(db, trialEnd);
  const sent: string[] = [];
  const errors: string[] = [];
  for (const r of list) {
    const { data: b } = await db.from("billing_accounts").select("exempt, status").eq("owner_id", r.ownerId).maybeSingle();
    if (b && ["active", "trialing"].includes(b.status)) continue; // already subscribed
    const stripeBilled = !!b && !b.exempt;
    const { subject, body } = html(r, which, stripeBilled);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Zonoir <noreply@zonoir.com>", to: [r.email], subject, html: body }),
    });
    if (res.ok) sent.push(r.email);
    else errors.push(`${r.email}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  return { trialEnd, checked: list.length, sent, errors };
}

/** For tests: build the email without sending. */
export const buildTrialEmail = html;
