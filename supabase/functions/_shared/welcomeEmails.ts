// Emails new users receive: doctor sign-up, clinic sign-up, and a doctor added by a clinic.
// Same layout as the admin notices. Details come from the database and are escaped.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { APP_URL, countryLabel, emailLayout, esc, mailLink, shortDate } from "./emailLayout.ts";
import { billingText } from "./adminSignupEmail.ts";

export type Email = { subject: string; html: string };
// Office address as it appeared in the previous emails.
const FOOTER = "Zonoir · 140 B, Khayaban e Amin, Lahore, Pakistan<br>You received this email because an account was created with this address.";

async function supportEmail(db: SupabaseClient): Promise<string> {
  const { data } = await db.from("system_settings").select("key, value").in("key", ["support_email", "admin_email"]);
  return (data || []).find((r: any) => r.key === "support_email")?.value || (data || []).find((r: any) => r.key === "admin_email")?.value || "hello@zonoir.com";
}

function afterTrial(card: boolean, price: number, trialEnd: string | null | undefined, page: string): string {
  const until = trialEnd ? `until <strong>${esc(shortDate(trialEnd))}</strong>` : "for 14 days";
  return card
    ? `Your free trial runs ${until}. No card is needed during the trial. To keep adding and changing records afterwards, subscribe on the <a href="${page}" style="color:#4338ca;text-decoration:none">Billing &amp; Subscription</a> page (USD ${price} per doctor per month). Without a subscription the account becomes read-only, and your records stay safe.`
    : `Your free trial runs ${until}. Our team will contact you about your subscription (USD ${price} per doctor per month).`;
}

export async function doctorWelcomeEmail(db: SupabaseClient, doctorId: string): Promise<Email | null> {
  const { data: d } = await db.from("doctors")
    .select("id, specialization, city, country_code, trial_end_date, payment_plan, profiles!doctors_id_fkey(full_name, email)")
    .eq("id", doctorId).maybeSingle();
  if (!d) return null;
  const p = (d as any).profiles || {};
  const name = `Dr. ${String(p.full_name || "").replace(/^dr\.?\s+/i, "")}`;
  const bill = await billingText(db, d.id, d.trial_end_date, d.payment_plan);
  const support = await supportEmail(db);
  return {
    subject: "Welcome to Zonoir: your account is ready",
    html: emailLayout({
      label: "Welcome",
      title: `Welcome to Zonoir, ${name}`,
      intro: "Your account is active and you can start using Zonoir now.",
      rows: [
        ["Login email", mailLink(p.email)],
        ["Specialization", esc(d.specialization)],
        ["Location", esc([d.city, countryLabel(d.country_code)].filter(Boolean).join(", "))],
        ["Free trial", esc(d.trial_end_date ? `Until ${shortDate(d.trial_end_date)}` : "14 days")],
        ["Plan after the trial", esc(bill.plan)],
      ],
      sections: [
        { title: "Getting started", html: `<ol style="margin:0;padding-left:18px">
            <li>Add your consultation fee and details in Profile.</li>
            <li>Set your weekly timings in Timing &amp; Schedule.</li>
            <li>Add your first patient and book an appointment.</li>
          </ol>` },
        { title: "After the free trial", html: afterTrial(bill.card, bill.price, d.trial_end_date, `${APP_URL}/doctor/subscription`) },
      ],
      button: { label: "Log in to Zonoir", href: `${APP_URL}/login` },
      note: `Questions? Write to ${mailLink(support)}.`,
      footer: FOOTER,
    }),
  };
}

export async function clinicWelcomeEmail(db: SupabaseClient, clinicId: string): Promise<Email | null> {
  const { data: c } = await db.from("clinics")
    .select("id, clinic_name, city, country_code, requested_doctors, trial_end_date, payment_plan, profiles!clinics_id_fkey(full_name, email)")
    .eq("id", clinicId).maybeSingle();
  if (!c) return null;
  const p = (c as any).profiles || {};
  const bill = await billingText(db, c.id, c.trial_end_date, c.payment_plan);
  const support = await supportEmail(db);
  return {
    subject: `Welcome to Zonoir: ${c.clinic_name} is ready`,
    html: emailLayout({
      label: "Welcome",
      title: `Welcome to Zonoir, ${c.clinic_name}`,
      intro: "Your clinic account is active and you can start adding doctors and staff now.",
      rows: [
        ["Clinic", esc(c.clinic_name)],
        ["Login email", mailLink(p.email)],
        ["Location", esc([c.city, countryLabel(c.country_code)].filter(Boolean).join(", "))],
        ["Doctors", esc(c.requested_doctors)],
        ["Free trial", esc(c.trial_end_date ? `Until ${shortDate(c.trial_end_date)}` : "14 days")],
        ["Plan after the trial", esc(bill.plan)],
      ],
      sections: [
        { title: "Getting started", html: `<ol style="margin:0;padding-left:18px">
            <li>Check your clinic details in Clinic Profile.</li>
            <li>Add your doctors in Clinic Setup → Doctors. Each doctor gets an email to set their own password.</li>
            <li>Add receptionists and set each doctor's schedule.</li>
          </ol>` },
        { title: "After the free trial", html: afterTrial(bill.card, bill.price, c.trial_end_date, `${APP_URL}/clinic/subscription`) },
      ],
      button: { label: "Log in to Zonoir", href: `${APP_URL}/login` },
      note: `Questions? Write to ${mailLink(support)}.`,
      footer: FOOTER,
    }),
  };
}

export function addedDoctorEmail(o: { clinicName: string; fullName: string; email: string; link: string }): Email {
  const name = `Dr. ${String(o.fullName || "").replace(/^dr\.?\s+/i, "")}`;
  return {
    subject: `You've been added to ${o.clinicName} on Zonoir`,
    html: emailLayout({
      label: "Welcome",
      title: `Welcome to ${o.clinicName}`,
      intro: `Dear <strong>${esc(name)}</strong>, <strong>${esc(o.clinicName)}</strong> has added you as a doctor on Zonoir. Choose your password to start.`,
      rows: [["Login email", mailLink(o.email)], ["Clinic", esc(o.clinicName)]],
      button: { label: "Set your password", href: o.link },
      note: `This link works for 24 hours. After that, use "Forgot password" on ${esc(APP_URL)}/login. If you weren't expecting this email, you can ignore it.`,
      footer: FOOTER.replace("an account was created with this address", "a clinic added this address on Zonoir"),
    }),
  };
}
