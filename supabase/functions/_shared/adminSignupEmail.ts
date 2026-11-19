// Admin notification for a new doctor or clinic sign-up. Details are read from the database
// (not from what the browser sent), and everything is escaped.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const APP = "https://app.zonoir.com";
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const regionNames = (() => { try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; } })();
const country = (code?: string | null) => { if (!code) return ""; try { return regionNames?.of(code) || code; } catch { return code; } };
const day = (d?: string | null) => d ? new Date(`${String(d).slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";

export type AdminSignupEmail = { subject: string; html: string };

function layout(opts: { title: string; summary: string; rows: [string, string][]; button: { label: string; href: string } }): string {
  const rows = opts.rows.filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;color:#6b7280;font-size:13px;width:38%;vertical-align:top">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;color:#111827;font-size:14px;font-weight:500">${v}</td>
      </tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
        <tr><td style="padding:22px 28px;border-bottom:1px solid #eef0f4">
          <span style="font-size:18px;font-weight:700;color:#4338ca;letter-spacing:-0.2px">Zonoir</span>
          <span style="float:right;font-size:12px;color:#9ca3af;line-height:26px">Admin notification</span>
        </td></tr>
        <tr><td style="padding:26px 28px 8px">
          <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#111827">${esc(opts.title)}</h1>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563">${opts.summary}</p>
        </td></tr>
        <tr><td style="padding:12px 28px 4px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
        </td></tr>
        <tr><td style="padding:22px 28px 28px">
          <a href="${opts.button.href}" style="display:inline-block;background:#4338ca;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:8px">${esc(opts.button.label)}</a>
        </td></tr>
        <tr><td style="padding:14px 28px;border-top:1px solid #eef0f4;font-size:12px;color:#9ca3af">
          Sent automatically by Zonoir when an account is created.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const when = () => new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

async function billingText(db: SupabaseClient, ownerId: string, trialEnd?: string | null, plan?: string | null) {
  const { data: s } = await db.from("system_settings").select("value").eq("key", "stripe_price_usd").maybeSingle();
  const price = Number(s?.value) || 35;
  const { data: b } = await db.from("billing_accounts").select("exempt").eq("owner_id", ownerId).maybeSingle();
  const how = b && !b.exempt ? "Card through Stripe" : "Manual";
  return {
    plan: `USD ${price} per doctor per month${plan === "yearly" ? " (asked for yearly)" : ""}`,
    billing: `${how}${trialEnd ? `, free trial until ${day(trialEnd)}` : ""}`,
  };
}

export async function doctorSignupEmail(db: SupabaseClient, doctorId: string): Promise<AdminSignupEmail | null> {
  const { data: d } = await db.from("doctors")
    .select("id, specialization, city, country_code, contact_number, trial_end_date, payment_plan, referred_by, pmdc_number, profiles!doctors_id_fkey(full_name, email)")
    .eq("id", doctorId).maybeSingle();
  if (!d) return null;
  const p = (d as any).profiles || {};
  const name = `Dr. ${String(p.full_name || "").replace(/^dr\.?\s+/i, "")}`;
  const bill = await billingText(db, d.id, d.trial_end_date, d.payment_plan);
  return {
    subject: `New doctor sign-up: ${name}${d.city ? ` (${d.city})` : ""}`,
    html: layout({
      title: "New doctor sign-up",
      summary: `<strong>${esc(name)}</strong> created a single-doctor account. The account is active and can be used straight away.`,
      rows: [
        ["Name", esc(name)],
        ["Email", p.email ? `<a href="mailto:${esc(p.email)}" style="color:#4338ca;text-decoration:none">${esc(p.email)}</a>` : ""],
        ["Phone", esc(d.contact_number)],
        ["Specialization", esc(d.specialization)],
        ["Location", esc([d.city, country(d.country_code)].filter(Boolean).join(", "))],
        ["Licence number", esc(d.pmdc_number)],
        ["Plan", esc(bill.plan)],
        ["Billing", esc(bill.billing)],
        ["Referral code", esc(d.referred_by)],
        ["Signed up", esc(when())],
      ],
      button: { label: "Open doctors in admin", href: `${APP}/doctors` },
    }),
  };
}

export async function clinicSignupEmail(db: SupabaseClient, clinicId: string): Promise<AdminSignupEmail | null> {
  const { data: c } = await db.from("clinics")
    .select("id, clinic_name, city, country_code, phone_number, address, requested_doctors, trial_end_date, payment_plan, referred_by, status, profiles!clinics_id_fkey(full_name, email)")
    .eq("id", clinicId).maybeSingle();
  if (!c) return null;
  const p = (c as any).profiles || {};
  const bill = await billingText(db, c.id, c.trial_end_date, c.payment_plan);
  return {
    subject: `New clinic sign-up: ${c.clinic_name}${c.city ? ` (${c.city})` : ""}`,
    html: layout({
      title: "New clinic sign-up",
      summary: `<strong>${esc(c.clinic_name)}</strong> created a clinic account${c.status === "active" ? " and can start adding doctors straight away" : ", which is waiting for activation"}.`,
      rows: [
        ["Clinic", esc(c.clinic_name)],
        ["Email", p.email ? `<a href="mailto:${esc(p.email)}" style="color:#4338ca;text-decoration:none">${esc(p.email)}</a>` : ""],
        ["Phone", esc(c.phone_number)],
        ["Location", esc([c.city, country(c.country_code)].filter(Boolean).join(", "))],
        ["Address", esc(c.address)],
        ["Doctors asked for", esc(c.requested_doctors)],
        ["Plan", esc(bill.plan)],
        ["Billing", esc(bill.billing)],
        ["Referral code", esc(c.referred_by)],
        ["Signed up", esc(when())],
      ],
      button: { label: "Open clinics in admin", href: `${APP}/admin/clinics` },
    }),
  };
}
