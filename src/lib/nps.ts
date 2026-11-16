// Net Promoter Score: % of answers scoring 9-10 minus % scoring 0-6 (from -100 to 100).
export function npsOf(scores: number[]) {
  if (!scores.length) return null;
  const pro = scores.filter((s) => s >= 9).length, det = scores.filter((s) => s <= 6).length;
  return Math.round(((pro - det) / scores.length) * 100);
}
