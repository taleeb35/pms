import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { addedDoctorEmail, clinicWelcomeEmail, doctorWelcomeEmail } from "../supabase/functions/_shared/welcomeEmails";

const fakeDb = (rows: Record<string, any>) => ({
  from: (table: string) => {
    const q: any = {
      select: () => q, eq: () => q, in: () => Promise.resolve({ data: rows[`${table}:list`] ?? [] }),
      maybeSingle: async () => ({ data: rows[table] ?? null }),
    };
    return q;
  },
}) as any;

const common = {
  system_settings: { value: "35" },
  "system_settings:list": [{ key: "support_email", value: "support@zonoir.com" }],
  billing_accounts: { exempt: false },
};

describe("welcome emails", () => {
  it("doctor: trial date, card billing text, steps, no old emoji style", async () => {
    const m = (await doctorWelcomeEmail(fakeDb({
      ...common,
      doctors: { id: "d1", specialization: "General Physician", city: "Austin", country_code: "US", trial_end_date: "2026-12-03", payment_plan: "monthly",
        profiles: { full_name: "Dr. Emma <i>Wilson</i>", email: "emma@example.com" } },
    }), "d1"))!;
    expect(m.subject).toBe("Welcome to Zonoir: your account is ready");
    expect(m.html).toContain("Welcome to Zonoir, Dr. Emma &lt;i&gt;Wilson&lt;/i&gt;");
    expect(m.html).toContain("Until 3 Dec 2026");
    expect(m.html).toContain("https://app.zonoir.com/doctor/subscription");
    expect(m.html).toContain("Austin, United States");
    expect(m.html).toContain("support@zonoir.com");
    expect(m.html).not.toMatch(/🎉|🎁|💰|📋|Congratulations|payment instructions/);
    if (process.env.PREVIEW_DIR) writeFileSync(`${process.env.PREVIEW_DIR}/zonoir-welcome-doctor-preview.html`, m.html);
  });
  it("clinic: welcome with clinic steps", async () => {
    const m = (await clinicWelcomeEmail(fakeDb({
      ...common,
      clinics: { id: "c1", clinic_name: "City Care Clinic", city: "Lahore", country_code: "PK", requested_doctors: 3, trial_end_date: "2026-12-03", payment_plan: "monthly",
        profiles: { full_name: "Owner", email: "owner@example.com" } },
    }), "c1"))!;
    expect(m.subject).toBe("Welcome to Zonoir: City Care Clinic is ready");
    expect(m.html).toContain("Each doctor gets an email to set their own password");
    expect(m.html).toContain("https://app.zonoir.com/clinic/subscription");
    if (process.env.PREVIEW_DIR) writeFileSync(`${process.env.PREVIEW_DIR}/zonoir-welcome-clinic-preview.html`, m.html);
  });
  it("manual billing mentions the team instead of the billing page", async () => {
    const m = (await doctorWelcomeEmail(fakeDb({
      ...common, billing_accounts: { exempt: true },
      doctors: { id: "d1", specialization: "GP", city: "Lahore", country_code: "PK", trial_end_date: "2026-12-03", payment_plan: "monthly", profiles: { full_name: "Ali", email: "a@example.com" } },
    }), "d1"))!;
    expect(m.html).toContain("Our team will contact you");
    expect(m.html).not.toContain("/doctor/subscription");
  });
  it("added doctor: set-password button, escaped clinic name", () => {
    const m = addedDoctorEmail({ clinicName: "Care <b>Clinic</b>", fullName: "Sara Khan", email: "sara@example.com", link: "https://app.zonoir.com/auth/v1/verify?token=x" });
    expect(m.html).toContain("Set your password");
    expect(m.html).toContain("Care &lt;b&gt;Clinic&lt;/b&gt;");
    expect(m.html).toContain("Dr. Sara Khan");
  });
});
