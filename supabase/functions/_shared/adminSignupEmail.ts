// Admin notification for a new doctor or clinic sign-up. Details are read from the database
// (not from what the browser sent), and everything is escaped.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { APP_URL, countryLabel, emailLayout, esc, mailLink, shortDate } from "./emailLayout.ts";

export type AdminSignupEmail = { subject: string; html: string };

const when = () => new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
const FOOTER = "Sent automatically by Zonoir when an account is created.";

export async function billingText(db: SupabaseClient, ownerId: string, trialEnd?: string | null, plan?: string | null) {
  const { data: s } = await db.from("system_settings").select("value").eq("key", "stripe_price_usd").maybeSingle();
  const price = Number(s?.value) || 35;
  const { data: b } = await db.from("billing_accounts").select("exempt").eq("owner_id", ownerId).maybeSingle();
  const card = !!b && !b.exempt;
  return {
    price,
    card,
    plan: `USD ${price} per doctor per month${plan === "yearly" ? " (asked for yearly)" : ""}`,
    billing: `${card ? "Card through Stripe" : "Manual"}${trialEnd ? `, free trial until ${shortDate(trialEnd)}` : ""}`,
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
    html: emailLayout({
      label: "Admin notification",
      title: "New doctor sign-up",
      intro: `<strong>${esc(name)}</strong> created a single-doctor account. The account is active and can be used straight away.`,
      rows: [
        ["Name", esc(name)],
        ["Email", mailLink(p.email)],
        ["Phone", esc(d.contact_number)],
        ["Specialization", esc(d.specialization)],
        ["Location", esc([d.city, countryLabel(d.country_code)].filter(Boolean).join(", "))],
        ["Licence number", esc(d.pmdc_number)],
        ["Plan", esc(bill.plan)],
        ["Billing", esc(bill.billing)],
        ["Referral code", esc(d.referred_by)],
        ["Signed up", esc(when())],
      ],
      button: { label: "Open doctors in admin", href: `${APP_URL}/doctors` },
      footer: FOOTER,
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
    html: emailLayout({
      label: "Admin notification",
      title: "New clinic sign-up",
      intro: `<strong>${esc(c.clinic_name)}</strong> created a clinic account${c.status === "active" ? " and can start adding doctors straight away" : ", which is waiting for activation"}.`,
      rows: [
        ["Clinic", esc(c.clinic_name)],
        ["Email", mailLink(p.email)],
        ["Phone", esc(c.phone_number)],
        ["Location", esc([c.city, countryLabel(c.country_code)].filter(Boolean).join(", "))],
        ["Address", esc(c.address)],
        ["Doctors asked for", esc(c.requested_doctors)],
        ["Plan", esc(bill.plan)],
        ["Billing", esc(bill.billing)],
        ["Referral code", esc(c.referred_by)],
        ["Signed up", esc(when())],
      ],
      button: { label: "Open clinics in admin", href: `${APP_URL}/admin/clinics` },
      footer: FOOTER,
    }),
  };
}
