// Caller checks for edge functions that run without the gateway JWT check.
// The gateway accepts the public anon key as a "token", so functions must
// verify the real caller themselves.
import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.76.1";

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function bearer(req: Request): string {
  const h = req.headers.get("Authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Only server-side callers holding the service role key (e.g. pg_cron jobs). */
export function requireServiceRole(req: Request): void {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!key || bearer(req) !== key) throw new AuthError(401, "Unauthorized");
}

/** Any signed-in user (rejects the public anon key). */
export async function requireUser(req: Request, admin = adminClient()): Promise<User> {
  const token = bearer(req);
  if (!token) throw new AuthError(401, "Not signed in");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) throw new AuthError(401, "Not signed in");
  return data.user;
}

/** Signed-in user holding one of the given roles. */
export async function requireRole(req: Request, roles: string[], admin = adminClient()): Promise<User> {
  const user = await requireUser(req, admin);
  const { data } = await admin.from("user_roles").select("role").eq("user_id", user.id).in("role", roles);
  if (!data || data.length === 0) throw new AuthError(403, "Not allowed");
  return user;
}

export function authErrorResponse(e: unknown, headers: Record<string, string>): Response | null {
  if (e instanceof AuthError) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: e.status,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
  return null;
}
