import { describe, it, expect } from "vitest";
import { periodRange, kpis, revenueTrend, topBy, byWeekday } from "@/lib/reportsOverview";
import { hideFloatingHelpers } from "@/lib/authRoutes";
import { generateDoctorProfileUrl } from "@/lib/slugUtils";

describe("reports overview", () => {
  const today = new Date(2026, 10, 17); // 17 Nov 2026

  it("compares with the period just before", () => {
    expect(periodRange("7d", today)).toEqual({ current: { from: "2026-11-11", to: "2026-11-17" }, previous: { from: "2026-11-04", to: "2026-11-10" } });
    expect(periodRange("month", today)).toEqual({ current: { from: "2026-11-01", to: "2026-11-17" }, previous: { from: "2026-10-01", to: "2026-10-17" } });
    expect(periodRange("last_month", today)).toEqual({ current: { from: "2026-10-01", to: "2026-10-31" }, previous: { from: "2026-09-01", to: "2026-09-30" } });
    expect(periodRange("today", today).previous).toEqual({ from: "2026-11-16", to: "2026-11-16" });
  });

  const appts = [
    { appointment_date: "2026-11-12", status: "completed", patient_id: "p1", doctor_id: "d1", consultation_fee: 1000, procedure_fee: 500, refund: 100, amount_paid: null, procedure_id: "x" },
    { appointment_date: "2026-11-13", status: "completed", patient_id: "p1", doctor_id: "d1", consultation_fee: 1000, amount_paid: 600 },
    { appointment_date: "2026-11-13", status: "no_show", patient_id: "p2", doctor_id: "d2" },
    { appointment_date: "2026-11-14", status: "cancelled", patient_id: "p3", doctor_id: "d2", consultation_fee: 999 },
    { appointment_date: "2026-11-15", status: "completed", patient_id: "p4", doctor_id: "d2", consultation_fee: 2000, source: "public_profile", lead_status: "active" },
    { appointment_date: "2026-11-01", status: "completed", patient_id: "p5", doctor_id: "d1", consultation_fee: 5000 },
  ];
  const r = { from: "2026-11-11", to: "2026-11-17" };

  it("uses Finance's revenue rule and counts part payments as still to collect", () => {
    const k = kpis(appts, r, 3, 400);
    expect(k.revenue).toBe(2400);       // 1000+500-100 + 1000; no-show, cancelled and the unconverted lead are left out
    expect(k.due).toBe(400);            // 1000 - 600
    expect(k.collected).toBe(2000);
    expect(k.visits).toBe(2);
    expect(k.patientsSeen).toBe(1);
    expect(k.noShowRate).toBeCloseTo(33.33, 1);
    expect(k.avgFee).toBe(1200);
    expect(k.profit).toBe(2000);
  });

  it("fills every day in short periods and ranks top items", () => {
    const t = revenueTrend(appts, r);
    expect(t).toHaveLength(7);
    expect(t.find((x) => x.key === "2026-11-12")?.revenue).toBe(1400);
    expect(topBy(appts, r, (a) => a.doctor_id)).toEqual([{ key: "d1", count: 2, revenue: 2400 }]);
    expect(byWeekday(appts, r).find((d) => d.label === "Thu")?.visits).toBe(1); // 12 Nov 2026 is a Thursday
  });

  it("groups long periods by month", () => {
    const t = revenueTrend(appts, { from: "2026-01-01", to: "2026-11-17" });
    expect(t).toHaveLength(11);
    expect(t[10]).toMatchObject({ key: "2026-11", revenue: 7400 });
  });
});

describe("floating helpers", () => {
  it("hide on sign-in screens and inside every portal, show on public pages", () => {
    for (const p of ["/login", "/auth", "/doctor/dashboard", "/clinic/patients/abc", "/receptionist/appointments", "/admin/clinics", "/doctors", "/dashboard", "/queue", "/intake/x"]) {
      expect(hideFloatingHelpers(p), p).toBe(true);
    }
    for (const p of ["/", "/find-doctors", "/doctors/gynecologist", "/doctors/gynecologist/dr-sana-khan", "/pricing"]) {
      expect(hideFloatingHelpers(p), p).toBe(false);
    }
  });
});

describe("doctor profile address", () => {
  it("has no city or country", () => {
    expect(generateDoctorProfileUrl("Lahore", "Gynecologist", "Dr. Sana Khan")).toBe("/doctors/gynecologist/dr-sana-khan");
  });
});
