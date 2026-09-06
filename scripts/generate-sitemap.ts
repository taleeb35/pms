// Fetches the live dynamic sitemap edge function and writes it as a static
// file. Runs as `prebuild` so the file is present in `public/` before Vite
// copies it into `dist/`. Also writes directly to `dist/` if it exists.

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const SITEMAP_URL =
  "https://anqhnkcppujulkugcpee.supabase.co/functions/v1/dynamic-sitemap";

async function main() {
  let xml: string;
  try {
    const res = await fetch(SITEMAP_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
    const count = (xml.match(/<url>/g) || []).length;
    console.log(`✓ Fetched sitemap (${count} URLs)`);
  } catch (err) {
    console.error("⚠ Failed to fetch sitemap, using fallback:", err);
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://zonoir.com/</loc><priority>1.0</priority></url>
</urlset>`;
  }

  if (!existsSync("public")) mkdirSync("public", { recursive: true });
  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log("✓ Wrote public/sitemap.xml");

  if (existsSync("dist")) {
    writeFileSync(resolve("dist/sitemap.xml"), xml);
    console.log("✓ Wrote dist/sitemap.xml");
  }
}

main();
