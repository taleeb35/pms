import { describe, expect, it } from "vitest";
import { countryFromTimeZone } from "@/lib/detectCountry";

describe("countryFromTimeZone", () => {
  it("knows Pakistan and the US", () => {
    expect(countryFromTimeZone("Asia/Karachi")).toBe("PK");
    expect(countryFromTimeZone("America/New_York")).toBe("US");
    expect(countryFromTimeZone("America/Indiana/Indianapolis")).toBe("US");
    expect(countryFromTimeZone("Pacific/Honolulu")).toBe("US");
  });
  it("treats everywhere else as other", () => {
    expect(countryFromTimeZone("Asia/Dubai")).toBe("OTHER");
    expect(countryFromTimeZone("Europe/London")).toBe("OTHER");
    expect(countryFromTimeZone("America/Toronto")).toBe("OTHER");
  });
  it("falls back to Pakistan when unknown", () => {
    expect(countryFromTimeZone(undefined)).toBe("PK");
  });
});
