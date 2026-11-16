import { describe, it, expect } from "vitest";
import { fillTemplate, leaveDays } from "@/lib/certificates";

describe("certificate templates", () => {
  const f = { patientName: "Ayesha Khan", doctorName: "Dr. Sarah", visitDate: "2026-11-16", from: "2026-11-16", to: "2026-11-18" };
  it("fills placeholders whatever their case or spacing", () => {
    expect(fillTemplate("[Patient Name] rest [from] to [TO] ([days] days), [Doctor_Name]", f))
      .toBe("Ayesha Khan rest 16 Nov 2026 to 18 Nov 2026 (3 days), Dr. Sarah");
  });
  it("leaves unknown or empty placeholders as typed", () => {
    expect(fillTemplate("[Diagnosis] [Age]", f)).toBe("[Diagnosis] [Age]");
  });
  it("counts both end days", () => {
    expect(leaveDays("2026-11-16", "2026-11-16")).toBe(1);
    expect(leaveDays("2026-11-30", "2026-12-02")).toBe(3);
  });
});
