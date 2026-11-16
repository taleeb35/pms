import { describe, expect, it } from "vitest";
import { friendlyTime } from "@/lib/datetime";

describe("friendlyTime", () => {
  it("shows 12-hour times", () => {
    expect(friendlyTime("00:05:00")).toBe("12:05 AM");
    expect(friendlyTime("09:45:00")).toBe("9:45 AM");
    expect(friendlyTime("12:00:00")).toBe("12:00 PM");
    expect(friendlyTime("21:45")).toBe("9:45 PM");
  });
  it("leaves bad input alone", () => {
    expect(friendlyTime("")).toBe("");
    expect(friendlyTime(null)).toBe("");
    expect(friendlyTime("soon")).toBe("soon");
  });
});
