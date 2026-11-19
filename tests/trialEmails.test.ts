import { describe, expect, it } from "vitest";
import { buildTrialEmail } from "../supabase/functions/_shared/trialEmails";

const doctor = { ownerId: "d1", kind: "doctor" as const, email: "a@example.com", greeting: "Dr. Test <b>", name: "your account", trialEnd: "2026-12-02" };
const clinic = { ownerId: "c1", kind: "clinic" as const, email: "c@example.com", greeting: "Owner", name: "Test Clinic", trialEnd: "2026-12-02" };

describe("trial emails", () => {
  it("Stripe-billed: Subscribe link to the right page, no old product name", () => {
    const r = buildTrialEmail(doctor, "reminder", true);
    expect(r.subject).toContain("3 days");
    expect(r.body).toContain("https://app.zonoir.com/doctor/subscription");
    expect(r.body).toContain("read-only");
    expect(r.body).not.toMatch(/ClinicPro|contact our support/i);
    expect(r.body).toContain("Dr. Test &lt;b&gt;"); // escaped
    expect(buildTrialEmail(clinic, "expired", true).body).toContain("https://app.zonoir.com/clinic/subscription");
  });
  it("Manual billing: contact support, no Subscribe button", () => {
    const r = buildTrialEmail(clinic, "expired", false);
    expect(r.subject).toContain("ended");
    expect(r.body).toContain("contact our support team");
    expect(r.body).not.toContain("/subscription");
    expect(r.body).toContain("Test Clinic");
  });
});
