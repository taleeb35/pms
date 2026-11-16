import { defineConfig } from "vitest/config";
import path from "path";

// Unit tests for the app's money, dates, statuses, search and pricing rules.
// Run with `npm test`. The live deploy runs them first and stops if any fail.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
