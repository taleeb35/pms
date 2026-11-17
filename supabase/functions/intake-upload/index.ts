// Patients attach a report (photo or PDF) while filling in the intake form, without signing in.
// The intake link token is the only permission: the form must still be open (not sent back, not expired).
// The file is stored in the patient's documents and listed on the intake form.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { adminClient } from "../_shared/auth.ts";
import { buildCorsHeaders, checkRateLimit, rateLimitResponse } from "../_shared/security.ts";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;
const TYPES: Record<string, string> = {
  "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif",
};

serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json(405, { ok: false, error: "method" });

  const rl = checkRateLimit(req, "intake-upload", 20, 10 * 60_000);
  if (!rl.ok) return rateLimitResponse(rl, cors);

  try {
    const form = await req.formData();
    const token = String(form.get("token") || "");
    const file = form.get("file");
    if (token.length !== 64 || !/^[0-9a-f]+$/.test(token)) return json(400, { ok: false, error: "not_found" });
    if (!(file instanceof File)) return json(400, { ok: false, error: "no_file" });
    if (file.size === 0 || file.size > MAX_BYTES) return json(400, { ok: false, error: "too_large" });
    const ext = TYPES[file.type];
    if (!ext) return json(400, { ok: false, error: "bad_type" });

    const admin = adminClient();
    const { data: f } = await admin.from("intake_forms")
      .select("id, patient_id, doctor_id, status, expires_at, attachments").eq("token", token).maybeSingle();
    if (!f) return json(404, { ok: false, error: "not_found" });
    if (f.status !== "sent") return json(400, { ok: false, error: "already_done" });
    if (new Date(f.expires_at) < new Date()) return json(400, { ok: false, error: "expired" });
    const list = Array.isArray(f.attachments) ? f.attachments : [];
    if (list.length >= MAX_FILES) return json(400, { ok: false, error: "too_many" });

    const safeName = (file.name || `report.${ext}`).replace(/[^\w.\- ]+/g, "_").slice(0, 80);
    const path = `${f.patient_id}/intake-${f.id}-${Date.now()}.${ext}`;
    const up = await admin.storage.from("medical-documents").upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) return json(500, { ok: false, error: "upload_failed" });

    const { data: doc, error: docErr } = await admin.from("medical_documents").insert({
      patient_id: f.patient_id, document_type: file.type, document_name: `Intake form: ${safeName}`, document_url: path, uploaded_by: null,
    }).select("id").single();
    if (docErr) {
      await admin.storage.from("medical-documents").remove([path]);
      return json(500, { ok: false, error: "save_failed" });
    }

    const entry = { path, name: safeName, type: file.type, size: file.size, document_id: doc.id, uploaded_at: new Date().toISOString() };
    await admin.from("intake_forms").update({ attachments: [...list, entry] }).eq("id", f.id);
    return json(200, { ok: true, name: safeName, count: list.length + 1 });
  } catch (_e) {
    return json(500, { ok: false, error: "server" });
  }
});
