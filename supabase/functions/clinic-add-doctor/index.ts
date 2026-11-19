// A clinic owner adds a doctor to their clinic. Runs on the server so the browser never signs in
// as the new doctor, and so nobody can attach a doctor to a clinic that isn't theirs.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, authErrorResponse, requireRole } from "../_shared/auth.ts";
import { buildCorsHeaders, checkRateLimit, rateLimitResponse } from "../_shared/security.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const APP = "https://app.zonoir.com";
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

// Welcome email with a "set your password" link (valid 24 hours; after that, Forgot password works).
async function sendWelcome(admin: ReturnType<typeof adminClient>, clinicId: string, email: string, fullName: string): Promise<boolean> {
  try {
    const { data: link, error } = await admin.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${APP}/reset-password` } });
    if (error || !link?.properties?.action_link) { console.error("clinic-add-doctor link", error?.message); return false; }
    const { data: c } = await admin.from("clinics").select("clinic_name, city").eq("id", clinicId).maybeSingle();
    const clinicName = c?.clinic_name || "your clinic";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:24px;border-radius:10px 10px 0 0;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">Welcome to ${esc(clinicName)}</h1>
  </div>
  <div style="background:#f8f9fa;padding:28px;border-radius:0 0 10px 10px">
    <p style="font-size:16px">Dear <strong>Dr. ${esc(fullName)}</strong>,</p>
    <p style="font-size:16px"><strong>${esc(clinicName)}</strong> has added you as a doctor on Zonoir. Your login email is <strong>${esc(email)}</strong>.</p>
    <p style="font-size:16px">Choose your password to start:</p>
    <p style="text-align:center;margin:28px 0"><a href="${link.properties.action_link}" style="background:#059669;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block">Set your password</a></p>
    <p style="font-size:13px;color:#666">This link works for 24 hours. After that, use "Forgot password" on ${APP}/login.</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
    <p style="font-size:12px;color:#888;text-align:center">If you weren't expecting this email, you can ignore it.</p>
  </div>
</body></html>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY") ?? ""}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Zonoir <noreply@zonoir.com>", to: [email], subject: `You've been added to ${clinicName} on Zonoir`, html }),
    });
    if (!res.ok) console.error("clinic-add-doctor email", res.status, (await res.text()).slice(0, 200));
    return res.ok;
  } catch (e) {
    console.error("clinic-add-doctor email", (e as Error).message);
    return false;
  }
}
const str = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const rl = checkRateLimit(req, "clinic-add-doctor", 20, 60 * 60_000);
  if (!rl.ok) return rateLimitResponse(rl, cors);

  const admin = adminClient();
  try {
    const user = await requireRole(req, ["clinic"], admin);
    const clinicId = user.id;
    const b = await req.json().catch(() => ({}));

    const fullName = str(b.fullName, 100);
    const email = str(b.email, 200).toLowerCase();
    if (fullName.length < 2) return json(400, { error: "Please enter the doctor's name." });
    if (!EMAIL_RE.test(email)) return json(400, { error: "Please enter a valid email address." });
    // Nobody (not even the clinic) knows the doctor's password: a random one is set and the doctor
    // chooses their own through the link in the welcome email.
    const password = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24)))).slice(0, 32) + "aA1!";

    const { data: clinic } = await admin.from("clinics").select("id, status, requested_doctors").eq("id", clinicId).maybeSingle();
    if (!clinic) return json(403, { error: "Clinic not found." });
    if (clinic.status !== "active") return json(403, { error: "Your clinic is not active yet." });

    // Unpaid (read-only) clinics can't add doctors.
    const { data: canWrite } = await admin.rpc("billing_owner_can_write", { _owner: clinicId });
    if (canWrite === false) return json(403, { error: "Your account is read-only until a subscription is active." });

    const { count } = await admin.from("doctors").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId).eq("approved", true);
    if ((count || 0) >= (clinic.requested_doctors || 1)) {
      return json(400, { error: `You've reached your doctor limit (${clinic.requested_doctors || 1}). Please contact support to increase it.` });
    }

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName },
    });
    if (cErr || !created?.user) {
      const msg = /already/i.test(cErr?.message || "") ? "An account with this email already exists." : (cErr?.message || "Could not create the account.");
      return json(400, { error: msg });
    }
    const doctorId = created.user.id;

    const { error: dErr } = await admin.from("doctors").insert({
      id: doctorId,
      specialization: str(b.specialization, 100) || null,
      qualification: "Medical Doctor",
      contact_number: str(b.contactNumber, 30) || null,
      experience_years: num(b.experienceYears),
      consultation_fee: num(b.consultationFee),
      clinic_percentage: Math.min(100, Math.max(0, num(b.clinicPercentage) ?? 0)),
      introduction: str(b.introduction, 2000) || null,
      pmdc_number: str(b.pmdcNumber, 50) || null,
      clinic_id: clinicId,
      approved: true,
    });
    if (dErr) {
      await admin.auth.admin.deleteUser(doctorId);
      console.error("clinic-add-doctor insert", dErr.message);
      return json(400, { error: "Could not save the doctor. Please try again." });
    }
    await admin.from("profiles").update({ phone: str(b.contactNumber, 30) || null }).eq("id", doctorId);

    const emailSent = await sendWelcome(admin, clinicId, email, fullName);
    return json(200, { ok: true, doctor_id: doctorId, email_sent: emailSent });
  } catch (e) {
    const r = authErrorResponse(e, cors);
    if (r) return r;
    console.error("clinic-add-doctor", e);
    return json(500, { error: "Server error" });
  }
});
