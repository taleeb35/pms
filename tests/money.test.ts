import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/region";
import { grossFee, netFee, isRevenueAppointment } from "@/lib/revenue";
import { PRICE_CURRENCY, PRICE_MONTHLY, PRICE_YEARLY_MONTHLY, usd } from "@/lib/pricingConfig";

describe("money", () => {
  it("formats amounts in the account currency", () => {
    expect(formatMoney(1500, "USD")).toBe("$1,500");
    expect(formatMoney("35.5", "USD")).toBe("$35.5");
    expect(formatMoney(null, "USD")).toBe("$0");
  });
  it("adds consultation, procedure and other fees, minus refunds", () => {
    const visit = { status: "completed", consultation_fee: 30, procedure_fee: 10, other_fee: 5, refund: 15 };
    expect(grossFee(visit as any)).toBe(45);
    expect(netFee(visit as any)).toBe(30);
    expect(grossFee({ consultation_fee: null } as any)).toBe(0);
  });
  it("counts only completed visits as revenue", () => {
    expect(isRevenueAppointment({ status: "completed" } as any)).toBe(true);
    expect(isRevenueAppointment({ status: "no_show" } as any)).toBe(false);
  });
});

describe("subscription price", () => {
  it("is $35 per doctor per month, in USD", () => {
    expect(PRICE_CURRENCY).toBe("USD");
    expect(PRICE_MONTHLY).toBe(35);
    expect(PRICE_YEARLY_MONTHLY).toBeLessThan(35);
    expect(usd(35)).toContain("35");
  });
});

import { balanceDue } from "@/lib/revenue";
describe("balance due per visit", () => {
  it("is zero when nothing was recorded (paid in full)", () => {
    expect(balanceDue({ consultation_fee: 2000, amount_paid: null })).toBe(0);
  });
  it("is fees minus refund minus what was paid", () => {
    expect(balanceDue({ consultation_fee: 2000, procedure_fee: 1000, refund: 500, amount_paid: 1500 })).toBe(1000);
  });
  it("never goes negative and ignores cancelled visits", () => {
    expect(balanceDue({ consultation_fee: 1000, amount_paid: 1200 })).toBe(0);
    expect(balanceDue({ status: "cancelled", consultation_fee: 1000, amount_paid: 0 })).toBe(0);
  });
});
