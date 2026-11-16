// Full-text search: public/kb-search-index.json is built from the articles before each build.
export type KBDoc = { slug: string; title: string; headings: string[]; text: string };
let kbIndex: Promise<KBDoc[]> | null = null;
export const loadKBIndex = () => (kbIndex ??= fetch("/kb-search-index.json").then((r) => (r.ok ? r.json() : [])).catch(() => { kbIndex = null; return []; }));

export const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const countOf = (hay: string, t: string) => { let n = 0, i = hay.indexOf(t); while (i !== -1 && n < 5) { n++; i = hay.indexOf(t, i + t.length); } return n; };

export const searchKB = (docs: KBDoc[], q: string) => {
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
  if (!terms.length) return [];
  return docs.map((d) => {
    const title = d.title.toLowerCase(), heads = d.headings.join(" · ").toLowerCase(), text = d.text.toLowerCase();
    let score = title.includes(q.toLowerCase().trim()) ? 30 : 0;
    for (const t of terms) {
      const s = (title.includes(t) ? 10 : 0) + (heads.includes(t) ? 4 : 0) + countOf(text, t);
      if (!s) return null; // every word must appear somewhere
      score += s;
    }
    const section = d.headings.find((h) => terms.some((t) => h.toLowerCase().includes(t)) && h !== d.title);
    const at = Math.min(...terms.map((t) => text.indexOf(t)).filter((i) => i >= 0), Number.MAX_SAFE_INTEGER);
    const snippet = at === Number.MAX_SAFE_INTEGER ? d.text.slice(0, 160)
      : (at > 70 ? "…" : "") + d.text.slice(Math.max(0, at - 70), at + 110).trim() + (at + 110 < d.text.length ? "…" : "");
    return { doc: d, score, section, snippet };
  }).filter(Boolean).sort((a, b) => b!.score - a!.score).slice(0, 8) as { doc: KBDoc; score: number; section?: string; snippet: string }[];
};
