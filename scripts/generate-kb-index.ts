// Builds public/kb-search-index.json: the readable text of every knowledge-base article,
// so the Knowledge Base page can search inside articles, not only their titles.
// Runs before each build (see "prebuild" in package.json).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "src/pages/KnowledgeBaseArticle.tsx"), "utf8").replace(/\r\n/g, "\n");

// slug -> title
const titleBlock = src.match(/const slugTitleMap[^{]*\{([\s\S]*?)\n\};/);
const titles: Record<string, string> = {};
for (const m of (titleBlock?.[1] || "").matchAll(/"([^"]+)":\s*"([^"]+)"/g)) titles[m[1]] = m[2];

// slug -> article component
// (one `if` can list several alias slugs: `if (slug === "a" || slug === "b") { return <X /> }`)
const comp: Record<string, string> = {};
for (const m of src.matchAll(/if \(((?:\s*\|\|\s*)?(?:slug === "[^"]+"(?:\s*\|\|\s*)?)+)\)\s*\{?\s*return\s*<(\w+)/g)) {
  for (const s of m[1].matchAll(/slug === "([^"]+)"/g)) comp[s[1]] ??= m[2];
}
// The slugs the Knowledge Base page links to are the preferred one for each article.
const listed = new Set([...readFileSync(resolve(root, "src/pages/KnowledgeBase.tsx"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));

// component name -> source of that component
const bodies: Record<string, string> = {};
const starts = [...src.matchAll(/^const (\w+) = \(\) => \{/gm)];
starts.forEach((m, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].index! : src.length;
  bodies[m[1]] = src.slice(m.index!, end);
});

const ENT: Record<string, string> = { "&apos;": "'", "&quot;": '"', "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&rarr;": "→", "&mdash;": "—", "&ndash;": "–" };
const clean = (s: string) => s.replace(/&[a-z]+;/g, (e) => ENT[e] ?? " ").replace(/\{" "\}/g, " ").replace(/\s+/g, " ").trim();
const hasWords = (s: string) => /[A-Za-z]{2,}/.test(s);

function extract(body: string) {
  const code = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/className=("[^"]*"|\{`[^`]*`\})/g, "");
  const headings: string[] = [];
  for (const m of code.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/g)) {
    const t = clean(m[1].replace(/<[^>]+>/g, " ").replace(/\{[^}]*\}/g, " "));
    if (hasWords(t)) headings.push(t);
  }
  const parts: string[] = [];
  for (const m of code.matchAll(/>([^<>{}]+)</g)) { const t = clean(m[1]); if (hasWords(t)) parts.push(t); }
  for (const m of code.matchAll(/\b(?:title|description|desc|text|question|answer|q|a|step|content|label|tip|detail|details|note|action|result):\s*"([^"]{3,})"/g)) parts.push(clean(m[1]));
  for (const m of code.matchAll(/\{"([^"]{3,})"\}/g)) parts.push(clean(m[1]));
  const seen = new Set<string>();
  const text = parts.filter((p) => !seen.has(p) && seen.add(p) && !/^(Back to Knowledge Base|Knowledge Base)$/.test(p)).join(" · ");
  return { headings: [...new Set(headings)], text: text.slice(0, 8000) };
}

// One entry per article: aliases of the same article are folded into the listed (or first) slug.
const bySlugComp = new Map<string, string>(); // component -> chosen slug
for (const slug of Object.keys(comp)) {
  const c = comp[slug];
  const cur = bySlugComp.get(c);
  if (!cur || (listed.has(slug) && !listed.has(cur))) bySlugComp.set(c, slug);
}
const out = [...bySlugComp.entries()].filter(([c]) => bodies[c]).map(([c, slug]) => {
  const aliasTitles = Object.keys(comp).filter((s) => comp[s] === c).map((s) => titles[s]).filter(Boolean);
  const title = titles[slug] || aliasTitles[0] || slug.replace(/-/g, " ");
  return { slug, title, ...extract(bodies[c]) };
});

const file = resolve(root, "public/kb-search-index.json");
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, JSON.stringify(out));
const withText = out.filter((a) => a.text).length;
console.log(`✓ Knowledge-base search index: ${out.length} articles (${withText} with text)`);
