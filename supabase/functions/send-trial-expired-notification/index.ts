// Daily cron (service role): email owners whose free trial ended yesterday.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, authErrorResponse, requireServiceRole } from "../_shared/auth.ts";
import { sendTrialEmails } from "../_shared/trialEmails.ts";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

serve(async (req: Request) => {
  try {
    requireServiceRole(req);
  } catch (e) {
    return authErrorResponse(e, {})!;
  }
  try {
    const r = await sendTrialEmails(adminClient(), "expired", Deno.env.get("RESEND_API_KEY") ?? "");
    console.log("trial expired", r.trialEnd, "checked", r.checked, "sent", r.sent.length, "errors", r.errors.length);
    return json(200, { success: true, ...r, emailsSent: r.sent.length });
  } catch (e) {
    console.error("send-trial-expired-notification", e);
    return json(500, { error: (e as Error).message });
  }
});
