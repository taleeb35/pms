// Shared security helpers: CORS allowlist + in-memory rate limiting.
// Note: in-memory rate limiting is per-instance (best-effort). Good enough to
// stop cost-runaway abuse on paid APIs (Gemini, Resend).

const ALLOWED_ORIGINS = new Set<string>([
  "https://zonoir.com",
  "https://www.zonoir.com",
  "https://zonoir.lovable.app",
]);

const ALLOWED_SUFFIXES = [
  ".lovable.app", // preview / staging
  ".lovableproject.com", // editor preview
];

const ALLOW_LOCALHOST = true;

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  let allow = "https://zonoir.com";
  try {
    const u = new URL(origin);
    if (ALLOWED_ORIGINS.has(origin)) allow = origin;
    else if (ALLOWED_SUFFIXES.some((s) => u.hostname.endsWith(s))) allow = origin;
    else if (ALLOW_LOCALHOST && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) allow = origin;
  } catch (_) { /* no origin (e.g. server-to-server) — leave default */ }

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}

// Simple sliding-window rate limit keyed by IP + bucket name.
const buckets = new Map<string, number[]>();

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

export function checkRateLimit(
  req: Request,
  bucket: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const ip = getClientIp(req);
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    const retry = Math.ceil((windowMs - (now - arr[0])) / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retry) };
  }
  arr.push(now);
  buckets.set(key, arr);
  // Opportunistic cleanup
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > windowMs * 4) buckets.delete(k);
    }
  }
  return { ok: true, retryAfterSec: 0 };
}

export function rateLimitResponse(
  res: RateLimitResult,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down and try again." }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(res.retryAfterSec),
      },
    },
  );
}
