// Runs after `vite build` via the postbuild npm hook.
// Fetches the live dynamic sitemap edge function and writes it as a static
// file to dist/sitemap.xml so that https://zonoir.com/sitemap.xml serves a
// real XML file (not the SPA fallback / 404).

import { writeFileSync } from "fs";
import { resolve } from "path";

const SITEMAP_URL =
  "https://anqhnkcppujulkugcpee.supabase.co/functions/v1/dynamic-sitemap";

async function main() {
  try {
    const res = await fetch(SITEMAP_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    writeFileSync(resolve("dist/sitemap.xml"), xml);
    const count = (xml.match(/<url>/g) || []).length;
    console.log(`✓ sitemap.xml written (${count} URLs)`);
  } catch (err) {
    console.error("⚠ Failed to generate sitemap.xml:", err);
    // Don't fail the build — fall back to a minimal sitemap
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://zonoir.com/</loc><priority>1.0</priority></url>
</urlset>`;
    writeFileSync(resolve("dist/sitemap.xml"), fallback);
  }
}

main();
