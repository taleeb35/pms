// The server returns at most 1000 rows per request. Reports and finance pages need every row in the
// chosen period, so they fetch in pages of 1000 until a short page comes back.
// `build` must return a NEW query each time (query builders change when .range() is added).
// Rows are also ordered by id so pages never overlap or skip rows that share the same date.
const PAGE = 1000;
const MAX_PAGES = 100; // 100,000 rows: a safety stop

export async function fetchAllRows<T = any>(build: () => any): Promise<{ data: T[]; error: any }> {
  const out: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE;
    const { data, error } = await build().order("id", { ascending: true }).range(from, from + PAGE - 1);
    if (error) return { data: out, error };
    if (!data) break;
    out.push(...(data as T[]));
    if (data.length < PAGE) break;
  }
  return { data: out, error: null };
}
