import { describe, expect, it } from "vitest";
import { needsStatusUpdate } from "@/lib/appointmentStatus";

const now = new Date("2026-11-16T12:00:00");

describe("needsStatusUpdate", () => {
  it("flags scheduled visits more than an hour past", () => {
    expect(needsStatusUpdate({ status: "scheduled", appointment_date: "2026-11-16", appointment_time: "10:30:00" }, now)).toBe(true);
    expect(needsStatusUpdate({ status: "start", appointment_date: "2026-11-15", appointment_time: "18:00" }, now)).toBe(true);
  });
  it("gives an hour of grace", () => {
    expect(needsStatusUpdate({ status: "scheduled", appointment_date: "2026-11-16", appointment_time: "11:30:00" }, now)).toBe(false);
  });
  it("ignores finished and future visits", () => {
    expect(needsStatusUpdate({ status: "completed", appointment_date: "2026-11-01", appointment_time: "10:00" }, now)).toBe(false);
    expect(needsStatusUpdate({ status: "cancelled", appointment_date: "2026-11-01", appointment_time: "10:00" }, now)).toBe(false);
    expect(needsStatusUpdate({ status: "scheduled", appointment_date: "2026-11-20", appointment_time: "10:00" }, now)).toBe(false);
  });
  it("treats a missing time as end of day", () => {
    expect(needsStatusUpdate({ status: "scheduled", appointment_date: "2026-11-16", appointment_time: null }, now)).toBe(false);
    expect(needsStatusUpdate({ status: "scheduled", appointment_date: "2026-11-15", appointment_time: null }, now)).toBe(true);
  });
});
