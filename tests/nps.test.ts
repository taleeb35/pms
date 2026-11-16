import { describe, it, expect } from "vitest";
import { npsOf } from "@/lib/nps";
describe("NPS", () => {
  it("is promoters minus detractors, in percent", () => {
    expect(npsOf([10, 9, 8, 6])).toBe(25);
    expect(npsOf([0, 0])).toBe(-100);
    expect(npsOf([])).toBeNull();
  });
});
