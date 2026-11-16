import { describe, it, expect } from "vitest";
import { assignTokens, shortName } from "@/lib/queue";

describe("queue screen", () => {
  it("numbers the day by appointment time, then booking time, skipping cancelled", () => {
    const rows = [
      { id: "c", appointment_time: "10:00", created_at: "2026-11-16T05:00:00Z", status: "scheduled" },
      { id: "a", appointment_time: "09:00", created_at: "2026-11-16T06:00:00Z", status: "completed" },
      { id: "x", appointment_time: "09:30", created_at: "2026-11-16T04:00:00Z", status: "cancelled" },
      { id: "b", appointment_time: "10:00", created_at: "2026-11-16T04:00:00Z", status: "start" },
    ];
    expect(assignTokens(rows).map((r) => [r.id, r.token])).toEqual([["a", 1], ["b", 2], ["c", 3]]);
  });
  it("shows first name and last initial only", () => {
    expect(shortName("Ayesha Noor Khan")).toBe("Ayesha K.");
    expect(shortName("Bilal")).toBe("Bilal");
    expect(shortName("")).toBe("");
  });
});
