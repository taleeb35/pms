import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifyStripeSignature } from "../supabase/functions/_shared/stripe";
import { trialDaysLeft } from "../src/lib/billingUtils";

const secret = "whsec_test_secret";
const payload = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
const sign = (t: number, body = payload, key = secret) => createHmac("sha256", key).update(`${t}.${body}`).digest("hex");

describe("verifyStripeSignature", () => {
  it("accepts a correct, fresh signature", async () => {
    const t = Math.floor(Date.now() / 1000);
    expect(await verifyStripeSignature(payload, `t=${t},v1=${sign(t)}`, secret)).toBe(true);
  });
  it("accepts when one of several v1 signatures matches", async () => {
    const t = Math.floor(Date.now() / 1000);
    expect(await verifyStripeSignature(payload, `t=${t},v1=${"0".repeat(64)},v1=${sign(t)}`, secret)).toBe(true);
  });
  it("rejects a changed body", async () => {
    const t = Math.floor(Date.now() / 1000);
    expect(await verifyStripeSignature(payload + " ", `t=${t},v1=${sign(t)}`, secret)).toBe(false);
  });
  it("rejects the wrong secret", async () => {
    const t = Math.floor(Date.now() / 1000);
    expect(await verifyStripeSignature(payload, `t=${t},v1=${sign(t, payload, "whsec_other")}`, secret)).toBe(false);
  });
  it("rejects an old timestamp (replay)", async () => {
    const t = Math.floor(Date.now() / 1000) - 3600;
    expect(await verifyStripeSignature(payload, `t=${t},v1=${sign(t)}`, secret)).toBe(false);
  });
  it("rejects missing or malformed headers", async () => {
    expect(await verifyStripeSignature(payload, null, secret)).toBe(false);
    expect(await verifyStripeSignature(payload, "garbage", secret)).toBe(false);
    expect(await verifyStripeSignature(payload, "t=1", secret)).toBe(false);
  });
});

describe("trialDaysLeft", () => {
  it("counts whole days", () => {
    const d = new Date();
    const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
    expect(trialDaysLeft(iso(d))).toBe(0);
    const n = new Date(d); n.setDate(d.getDate() + 5);
    expect(trialDaysLeft(iso(n))).toBe(5);
    const p = new Date(d); p.setDate(d.getDate() - 1);
    expect(trialDaysLeft(iso(p))).toBe(-1);
    expect(trialDaysLeft(null)).toBeNull();
  });
});
