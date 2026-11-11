// One-time admin bootstrap. The admin account already exists, so this
// function is disabled (it previously contained hard-coded credentials).
// To create another admin, use the admin panel or SQL on the server.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  return new Response(JSON.stringify({ error: "Setup is disabled" }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  });
});
