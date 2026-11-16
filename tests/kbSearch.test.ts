import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { searchKB, type KBDoc } from "@/lib/kbSearch";

const docs: KBDoc[] = JSON.parse(readFileSync("public/kb-search-index.json", "utf8"));

describe("knowledge-base index", () => {
  it("has every article with text", () => {
    expect(docs.length).toBeGreaterThanOrEqual(60);
    for (const d of docs) expect(d.text.length, d.slug).toBeGreaterThan(100);
  });
});

describe("searchKB", () => {
  it("finds articles by words inside them", () => {
    const hits = searchKB(docs, "whatsapp prescription");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.map((h) => h.doc.slug)).toContain("prescription-templates");
  });
  it("ranks a title match first", () => {
    expect(searchKB(docs, "reset password")[0].doc.slug).toBe("reset-password");
  });
  it("needs every word to match", () => {
    expect(searchKB(docs, "prescription zzqxv")).toEqual([]);
  });
  it("ignores one-letter searches", () => {
    expect(searchKB(docs, "a")).toEqual([]);
  });
});
