import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// "$35 everywhere": the old PKR subscription prices must not come back into the app.
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : /\.(tsx?|json)$/.test(f) ? [p] : []; });

describe("subscription pricing", () => {
  it("has no old PKR plan prices in the source", () => {
    const bad = files("src").filter((f) => /PKR\s?5,?999|Rs\.?\s?5,?999|PKR\s?29,?995/i.test(readFileSync(f, "utf8")));
    expect(bad).toEqual([]);
  });
});
