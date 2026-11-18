import { describe, expect, it } from "vitest";
import { matchesTagFilter, tagsFor, type TagExtras } from "../src/lib/appointmentTags";

const extras: TagExtras = new Map([
  ["a1", new Set(["intake_sent", "intake_signed", "lab_ordered"] as const)],
  ["a2", new Set(["intake_sent"] as const)],
]);

describe("appointment tags", () => {
  it("combines appointment fields with other tables, signed replaces sent", () => {
    expect(tagsFor({ id: "a1", source: "public_profile", review_requested_at: "2026-11-18T10:00:00Z", invoice_token: "x" }, extras))
      .toEqual(["online_booking", "intake_signed", "lab_ordered", "invoice_shared", "review_asked"]);
    expect(tagsFor({ id: "a2" }, extras)).toEqual(["intake_sent"]);
    expect(tagsFor({ id: "zz" }, extras)).toEqual([]);
  });

  it("filters", () => {
    const done = { id: "c", status: "completed" };
    expect(matchesTagFilter(done, [], "no_review")).toBe(true);
    expect(matchesTagFilter(done, ["review_asked"], "no_review")).toBe(false);
    expect(matchesTagFilter({ id: "s", status: "scheduled" }, [], "no_intake")).toBe(true);
    expect(matchesTagFilter({ id: "s", status: "scheduled" }, ["intake_sent"], "no_intake")).toBe(false);
    expect(matchesTagFilter(done, ["lab_ordered"], "lab_ordered")).toBe(true);
    expect(matchesTagFilter(done, [], "lab_ordered")).toBe(false);
    expect(matchesTagFilter(done, [], "all")).toBe(true);
  });
});
