import { describe, expect, it } from "vitest";
import { clinicSignupEmail, doctorSignupEmail } from "../supabase/functions/_shared/adminSignupEmail";

// Tiny stand-in for the database client: returns fixed rows per table.
const fakeDb = (rows: Record<string, any>) => ({
  from: (table: string) => {
    const q: any = { select: () => q, eq: () => q, maybeSingle: async () => ({ data: rows[table] ?? null }) };
    return q;
  },
}) as any;

describe("admin sign-up emails", () => {
  it("doctor: professional content from the database, escaped, no old wording", async () => {
    const db = fakeDb({
      doctors: { id: "d1", specialization: "Bariatric / Weight Loss Physician", city: "Austin", country_code: "US", contact_number: "+15125550100",
        trial_end_date: "2026-12-03", payment_plan: "monthly", referred_by: null, pmdc_number: null,
        profiles: { full_name: "Pamela <b>French</b>", email: "mexe@mailinator.com" } },
      system_settings: { value: "35" },
      billing_accounts: { exempt: false },
    });
    const m = (await doctorSignupEmail(db, "d1"))!;
    expect(m.subject).toBe("New doctor sign-up: Dr. Pamela <b>French</b> (Austin)");
    expect(m.html).toContain("Dr. Pamela &lt;b&gt;French&lt;/b&gt;");
    expect(m.html).toContain("Austin, United States");
    expect(m.html).toContain("Card through Stripe, free trial until 3 Dec 2026");
    expect(m.html).toContain("https://app.zonoir.com/doctors");
    expect(m.html).not.toMatch(/Action Required|pending approval|Expected Revenue|⚠️|💰/);
  });
  it("clinic: active clinic summary and admin link", async () => {
    const db = fakeDb({
      clinics: { id: "c1", clinic_name: "Test Clinic", city: "Lahore", country_code: "PK", phone_number: "03001234567", address: "1 Road",
        requested_doctors: 3, trial_end_date: "2026-12-03", payment_plan: "monthly", referred_by: "ABC123", status: "active",
        profiles: { full_name: "Owner", email: "owner@example.com" } },
      system_settings: { value: "35" },
      billing_accounts: { exempt: false },
    });
    const m = (await clinicSignupEmail(db, "c1"))!;
    expect(m.subject).toBe("New clinic sign-up: Test Clinic (Lahore)");
    expect(m.html).toContain("can start adding doctors straight away");
    expect(m.html).toContain("Lahore, Pakistan");
    expect(m.html).toContain("ABC123");
    expect(m.html).toContain("https://app.zonoir.com/admin/clinics");
  });
});
