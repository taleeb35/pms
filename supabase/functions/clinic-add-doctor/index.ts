// A clinic owner adds a doctor to their clinic. Runs on the server so the browser never signs in
// as the new doctor, and so nobody can attach a doctor to a clinic that isn't theirs.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient, authErrorResponse, requireRole } from "../_shared/auth.ts";
import { buildCorsHeaders, checkRateLimit, rateLimitResponse } from "../_shared/security.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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
    const password = String(b.password ?? "");
    if (fullName.length < 2) return json(400, { error: "Please enter the doctor's name." });
    if (!EMAIL_RE.test(email)) return json(400, { error: "Please enter a valid email address." });
    if (password.length < 8 || password.length > 72) return json(400, { error: "Password must be 8 to 72 characters." });

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
    return json(200, { ok: true, doctor_id: doctorId });
  } catch (e) {
    const r = authErrorResponse(e, cors);
    if (r) return r;
    console.error("clinic-add-doctor", e);
    return json(500, { error: "Server error" });
  }
});
