import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";

export interface PrescriptionVitals {
  blood_pressure?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  height?: string;
  pain_scale?: number | null;
  right_eye_vision?: string;
  left_eye_vision?: string;
}

export interface PrescriptionPatient {
  full_name: string;
  patient_id: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
}

export interface PrescriptionAppointment {
  id: string;
  appointment_date: string;
  appointment_time?: string | null;
  appointment_type?: string | null;
  doctor_id: string;
}

export interface PrescriptionClinical {
  chief_complaint?: string;
  patient_history?: string;
  current_prescription?: string;
  test_reports?: string;
  next_visit_notes?: string;
  next_visit_date?: string | null; // yyyy-MM-dd or ISO
  icd_code?: string | null;
  icd_description?: string | null;
}

export type OphthalmologyPrintData = Record<string, any>;


const escapeHtml = (s: any) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const fmtTime = (t?: string | null) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return format(d, "h:mm a");
};

export async function printAppointmentPrescription(opts: {
  appointment: PrescriptionAppointment;
  patient: PrescriptionPatient;
  vitals: PrescriptionVitals;
  clinical: PrescriptionClinical;
  ophthalmology?: OphthalmologyPrintData | null;
  doctorName?: string;
  doctorSpecialization?: string;
}) {
  const { appointment, patient, vitals, clinical, ophthalmology } = opts;


  let doctorName = opts.doctorName || "";
  let doctorSpecialization = opts.doctorSpecialization || "";
  let clinicInfo: { clinic_name?: string; address?: string; city?: string; phone_number?: string } | null = null;

  try {
    const { data: doc } = await supabase
      .from("doctors")
      .select("specialization, clinic_id, profiles(full_name)")
      .eq("id", appointment.doctor_id)
      .maybeSingle();
    if (doc) {
      doctorName = doctorName || (doc as any)?.profiles?.full_name || "";
      doctorSpecialization = doctorSpecialization || doc.specialization || "";
      if (doc.clinic_id) {
        const { data: c } = await supabase
          .from("clinics")
          .select("clinic_name, address, city, phone_number")
          .eq("id", doc.clinic_id)
          .maybeSingle();
        clinicInfo = c || null;
      }
    }
  } catch (e) {
    console.error("Prescription header fetch failed", e);
  }

  const w = window.open("", "_blank");
  if (!w) return;

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const visitDate = format(new Date(appointment.appointment_date), "dd MMM yyyy");
  const visitTime = fmtTime(appointment.appointment_time);
  const rxNo = `RX-${appointment.id.slice(0, 8).toUpperCase()}`;
  const issuedOn = format(new Date(), "dd MMM yyyy, h:mm a");

  const vitalsRows: { label: string; value?: string }[] = [
    { label: "Blood Pressure", value: vitals.blood_pressure },
    { label: "Temperature", value: vitals.temperature ? `${vitals.temperature} °F` : "" },
    { label: "Pulse", value: vitals.pulse ? `${vitals.pulse} bpm` : "" },
    { label: "Weight", value: vitals.weight ? `${vitals.weight} kg` : "" },
    { label: "Height", value: vitals.height ? `${vitals.height} cm` : "" },
    { label: "Pain Scale", value: vitals.pain_scale != null ? `${vitals.pain_scale}/10` : "" },
    { label: "Right Eye Vision", value: vitals.right_eye_vision },
    { label: "Left Eye Vision", value: vitals.left_eye_vision },
  ].filter((v) => v.value && String(v.value).trim().length > 0);

  let nextVisitFormatted = "";
  if (clinical.next_visit_date) {
    try {
      nextVisitFormatted = format(new Date(clinical.next_visit_date), "dd MMM yyyy");
    } catch {
      nextVisitFormatted = String(clinical.next_visit_date);
    }
  }

  // ---- Ophthalmology data (eye specialists) ----
  const oph = (ophthalmology || {}) as Record<string, any>;
  const hasOph = Object.values(oph).some((v) => v != null && String(v).trim() !== "");
  const v = (k: string) => (oph[k] != null && String(oph[k]).trim() !== "" ? String(oph[k]) : "");

  // Build fallbacks from ophthalmology if main clinical fields are blank
  const effChiefComplaint = clinical.chief_complaint?.trim() || v("presenting_complaints");
  const historyParts = [
    v("ocular_history") && `Ocular: ${v("ocular_history")}`,
    v("systemic_history") && `Systemic: ${v("systemic_history")}`,
    v("drug_allergy") && `Drug allergy: ${v("drug_allergy")}`,
    v("surgical_history") && `Surgical: ${v("surgical_history")}`,
  ].filter(Boolean) as string[];
  const effPatientHistory = clinical.patient_history?.trim() || historyParts.join("\n");
  const effDiagnosisText = clinical.icd_description || v("eye_diagnosis");
  const effPrescription =
    clinical.current_prescription?.trim() ||
    [v("treatment_plan"), v("management_plan")].filter(Boolean).join("\n\n");

  // Vision & Refraction table
  const visionFilled = ["va_right_unaided","va_right_glasses","va_right_pinhole","va_right_near","va_left_unaided","va_left_glasses","va_left_pinhole","va_left_near"].some(k=>v(k));
  const refractionFilled = ["refraction_right_sphere","refraction_right_cylinder","refraction_right_axis","refraction_right_add","refraction_right_final_va","refraction_left_sphere","refraction_left_cylinder","refraction_left_axis","refraction_left_add","refraction_left_final_va"].some(k=>v(k));
  const extraVision = ["auto_refraction","cyclo_auto_refraction","retinoscopy","iop"].filter(k=>v(k));

  const visionHTML = visionFilled ? `
    <table class="vitals" style="margin-bottom:8px;">
      <thead><tr><td class="lab">Visual Acuity</td><td class="lab">Unaided</td><td class="lab">With Glasses</td><td class="lab">Pinhole</td><td class="lab">Near</td></tr></thead>
      <tbody>
        <tr><td class="lab">OD (Right)</td><td>${escapeHtml(v("va_right_unaided"))}</td><td>${escapeHtml(v("va_right_glasses"))}</td><td>${escapeHtml(v("va_right_pinhole"))}</td><td>${escapeHtml(v("va_right_near"))}</td></tr>
        <tr><td class="lab">OS (Left)</td><td>${escapeHtml(v("va_left_unaided"))}</td><td>${escapeHtml(v("va_left_glasses"))}</td><td>${escapeHtml(v("va_left_pinhole"))}</td><td>${escapeHtml(v("va_left_near"))}</td></tr>
      </tbody>
    </table>` : "";

  const refractionHTML = refractionFilled ? `
    <table class="vitals" style="margin-bottom:8px;">
      <thead><tr><td class="lab">Refraction</td><td class="lab">Sphere</td><td class="lab">Cyl</td><td class="lab">Axis</td><td class="lab">Add</td><td class="lab">Final VA</td></tr></thead>
      <tbody>
        <tr><td class="lab">OD</td><td>${escapeHtml(v("refraction_right_sphere"))}</td><td>${escapeHtml(v("refraction_right_cylinder"))}</td><td>${escapeHtml(v("refraction_right_axis"))}</td><td>${escapeHtml(v("refraction_right_add"))}</td><td>${escapeHtml(v("refraction_right_final_va"))}</td></tr>
        <tr><td class="lab">OS</td><td>${escapeHtml(v("refraction_left_sphere"))}</td><td>${escapeHtml(v("refraction_left_cylinder"))}</td><td>${escapeHtml(v("refraction_left_axis"))}</td><td>${escapeHtml(v("refraction_left_add"))}</td><td>${escapeHtml(v("refraction_left_final_va"))}</td></tr>
      </tbody>
    </table>` : "";

  const extraVisionHTML = extraVision.length ? `
    <table class="vitals" style="margin-bottom:8px;"><tbody>
      ${(() => {
        const labels: Record<string,string> = { auto_refraction:"Auto Refraction", cyclo_auto_refraction:"Cyclo Auto Refraction", retinoscopy:"Retinoscopy", iop:"IOP" };
        const rows: string[] = [];
        for (let i=0;i<extraVision.length;i+=2){
          const a = extraVision[i]; const b = extraVision[i+1];
          rows.push(`<tr><td class="lab">${labels[a]}</td><td>${escapeHtml(v(a))}</td>${b?`<td class="lab">${labels[b]}</td><td>${escapeHtml(v(b))}</td>`:`<td></td><td></td>`}</tr>`);
        }
        return rows.join("");
      })()}
    </tbody></table>` : "";

  // External examination
  const externalRows = [
    { k: "pupil", label: "Pupil" },
    { k: "lids", label: "Lids" },
    { k: "lacrimal_passage", label: "Lacrimal Passage" },
    { k: "other_external_findings", label: "Other Findings" },
  ].filter(r => v(r.k));
  const externalHTML = externalRows.length ? `
    <table class="vitals" style="margin-bottom:8px;"><tbody>
      ${(() => {
        const rows: string[] = [];
        for (let i=0;i<externalRows.length;i+=2){
          const a = externalRows[i]; const b = externalRows[i+1];
          rows.push(`<tr><td class="lab">${a.label}</td><td>${escapeHtml(v(a.k))}</td>${b?`<td class="lab">${b.label}</td><td>${escapeHtml(v(b.k))}</td>`:`<td></td><td></td>`}</tr>`);
        }
        return rows.join("");
      })()}
    </tbody></table>` : "";

  // Anterior segment
  const antRows = [
    { key: "conjunctiva", label: "Conjunctiva" },
    { key: "sclera", label: "Sclera" },
    { key: "cornea", label: "Cornea" },
    { key: "ac", label: "AC" },
    { key: "iris", label: "Iris" },
    { key: "lens", label: "Lens" },
  ].map(r => ({
    ...r,
    right: v(`ant_${r.key}_right`),
    left: v(`ant_${r.key}_left`),
    status: v(`ant_${r.key}_status`),
  })).filter(r => r.right || r.left || r.status);
  const antHTML = antRows.length ? `
    <table class="vitals" style="margin-bottom:8px;">
      <thead><tr><td class="lab">Structure</td><td class="lab">OD (Right)</td><td class="lab">OS (Left)</td><td class="lab">Status</td></tr></thead>
      <tbody>
        ${antRows.map(r => `<tr><td class="lab">${r.label}</td><td>${escapeHtml(r.right)}</td><td>${escapeHtml(r.left)}</td><td>${escapeHtml(r.status)}</td></tr>`).join("")}
      </tbody>
    </table>` : "";

  // Posterior segment
  const postRows = [
    { k: "fundus", label: "Fundus" },
    { k: "optic_disc", label: "Optic Disc" },
    { k: "vitreous", label: "Vitreous" },
    { k: "cd_ratio", label: "C/D Ratio" },
    { k: "macula", label: "Macula" },
    { k: "peripheral_retina", label: "Peripheral Retina" },
  ].filter(r => v(r.k));
  const postHTML = postRows.length ? `
    <table class="vitals" style="margin-bottom:8px;"><tbody>
      ${(() => {
        const rows: string[] = [];
        for (let i=0;i<postRows.length;i+=2){
          const a = postRows[i]; const b = postRows[i+1];
          rows.push(`<tr><td class="lab">${a.label}</td><td>${escapeHtml(v(a.k))}</td>${b?`<td class="lab">${b.label}</td><td>${escapeHtml(v(b.k))}</td>`:`<td></td><td></td>`}</tr>`);
        }
        return rows.join("");
      })()}
    </tbody></table>` : "";

  const octHTML = v("oct_findings") ? `<div class="content-box">${escapeHtml(v("oct_findings"))}</div>` : "";

  const ophthalmologySections = hasOph ? `
    ${(visionHTML || refractionHTML || extraVisionHTML) ? `<h3 class="section">Vision &amp; Refraction</h3>${visionHTML}${refractionHTML}${extraVisionHTML}` : ""}
    ${externalHTML ? `<h3 class="section">External Examination</h3>${externalHTML}` : ""}
    ${antHTML ? `<h3 class="section">Anterior Segment</h3>${antHTML}` : ""}
    ${(postHTML || octHTML) ? `<h3 class="section">Posterior Segment</h3>${postHTML}${octHTML}` : ""}
  ` : "";



  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Prescription ${escapeHtml(rxNo)} — ${escapeHtml(patient.full_name)}</title>
<style>
  @page { margin: 1.2cm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; margin: 0; }
  .doc { max-width: 780px; margin: 0 auto; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1d4ed8; padding-bottom: 14px; margin-bottom: 18px; }
  .clinic-name { font-size: 20pt; font-weight: 700; color: #1d4ed8; margin: 0; }
  .clinic-meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .doc-meta { font-size: 9.5pt; color: #444; margin-top: 6px; }
  .rx-block { text-align: right; }
  .rx-block h2 { margin: 0; font-size: 22pt; color: #1d4ed8; letter-spacing: 1px; }
  .rx-block .meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .pat { display: flex; justify-content: space-between; gap: 24px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 16px; font-size: 10pt; }
  .pat .col { flex: 1; }
  .pat .label { font-size: 8.5pt; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
  .pat .val { font-weight: 600; color: #0f172a; }
  h3.section { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .6px; color: #1d4ed8; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 10px; }
  table { width: 100%; border-collapse: collapse; }
  table.vitals td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 10pt; }
  table.vitals td.lab { background: #f8fafc; color: #475569; width: 25%; font-weight: 600; }
  .content-box { padding: 10px 12px; background: #fafafa; border-left: 3px solid #475569; white-space: pre-wrap; font-size: 10.5pt; line-height: 1.55; }
  .rx-box { padding: 12px 14px; background: #eff6ff; border-left: 4px solid #1d4ed8; white-space: pre-wrap; font-size: 11pt; line-height: 1.6; }
  .test-box { padding: 10px 12px; background: #fefce8; border-left: 3px solid #eab308; white-space: pre-wrap; font-size: 10.5pt; }
  .nv-box { padding: 10px 12px; background: #f0fdf4; border-left: 3px solid #16a34a; font-size: 10.5pt; }
  .icd { display: inline-block; padding: 4px 10px; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; border-radius: 4px; font-size: 10pt; font-weight: 600; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9pt; color: #64748b; display: flex; justify-content: space-between; }
  .stamp { margin-top: 30px; text-align: right; font-size: 9.5pt; color: #475569; }
  .stamp .line { display: inline-block; border-top: 1px solid #94a3b8; padding-top: 4px; min-width: 200px; }
  .rx-symbol { font-size: 16pt; color: #1d4ed8; font-weight: 700; margin-right: 6px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="doc">
  <div class="top">
    <div>
      <h1 class="clinic-name">${escapeHtml(clinicInfo?.clinic_name || doctorName || "Medical Prescription")}</h1>
      <div class="clinic-meta">
        ${clinicInfo?.address ? escapeHtml(clinicInfo.address) + (clinicInfo.city ? ", " + escapeHtml(clinicInfo.city) : "") : ""}
        ${clinicInfo?.phone_number ? `<br/>Phone: ${escapeHtml(clinicInfo.phone_number)}` : ""}
      </div>
      ${doctorName ? `<div class="doc-meta"><strong>${escapeHtml(doctorName)}</strong>${doctorSpecialization ? " — " + escapeHtml(doctorSpecialization) : ""}</div>` : ""}
    </div>
    <div class="rx-block">
      <h2>PRESCRIPTION</h2>
      <div class="meta">
        <div><strong>${escapeHtml(rxNo)}</strong></div>
        <div>Issued: ${escapeHtml(issuedOn)}</div>
      </div>
    </div>
  </div>

  <div class="pat">
    <div class="col">
      <div class="label">Patient</div>
      <div class="val">${escapeHtml(patient.full_name)}</div>
      <div style="font-size:9pt;color:#64748b;margin-top:2px;">ID: ${escapeHtml(patient.patient_id)}</div>
    </div>
    <div class="col">
      <div class="label">Age / Gender</div>
      <div class="val">${age != null ? age + " yrs" : "—"} ${patient.gender ? "/ " + escapeHtml(patient.gender) : ""}</div>
      ${patient.phone ? `<div style="font-size:9pt;color:#64748b;margin-top:2px;">${escapeHtml(patient.phone)}</div>` : ""}
    </div>
    <div class="col">
      <div class="label">Visit Date</div>
      <div class="val">${escapeHtml(visitDate)}${visitTime ? " · " + escapeHtml(visitTime) : ""}</div>
      ${appointment.appointment_type ? `<div style="font-size:9pt;color:#64748b;margin-top:2px;text-transform:capitalize;">${escapeHtml(String(appointment.appointment_type).replace(/_/g, " "))}</div>` : ""}
    </div>
  </div>

  ${vitalsRows.length > 0 ? `<h3 class="section">Vitals</h3>
  <table class="vitals">
    <tbody>
      ${(() => {
        const rows: string[] = [];
        for (let i = 0; i < vitalsRows.length; i += 2) {
          const a = vitalsRows[i];
          const b = vitalsRows[i + 1];
          rows.push(`<tr><td class="lab">${escapeHtml(a.label)}</td><td>${escapeHtml(a.value || "")}</td>${
            b ? `<td class="lab">${escapeHtml(b.label)}</td><td>${escapeHtml(b.value || "")}</td>` : `<td></td><td></td>`
          }</tr>`);
        }
        return rows.join("");
      })()}
    </tbody>
  </table>` : ""}

  ${clinical.chief_complaint ? `<h3 class="section">Chief Complaint</h3><div class="content-box">${escapeHtml(clinical.chief_complaint)}</div>` : ""}

  ${clinical.patient_history ? `<h3 class="section">History</h3><div class="content-box">${escapeHtml(clinical.patient_history)}</div>` : ""}

  ${(clinical.icd_code || clinical.icd_description) ? `<h3 class="section">Diagnosis</h3>
    <div style="font-size:10.5pt;">
      ${clinical.icd_code ? `<span class="icd">${escapeHtml(clinical.icd_code)}</span> ` : ""}
      ${clinical.icd_description ? escapeHtml(clinical.icd_description) : ""}
    </div>` : ""}

  ${clinical.current_prescription ? `<h3 class="section"><span class="rx-symbol">℞</span>Prescription</h3>
    <div class="rx-box">${escapeHtml(clinical.current_prescription)}</div>` : ""}

  ${clinical.test_reports ? `<h3 class="section">Recommended Tests</h3>
    <div class="test-box">${escapeHtml(clinical.test_reports)}</div>` : ""}

  ${(nextVisitFormatted || clinical.next_visit_notes) ? `<h3 class="section">Next Visit</h3>
    <div class="nv-box">
      ${nextVisitFormatted ? `<div><strong>Date:</strong> ${escapeHtml(nextVisitFormatted)}</div>` : ""}
      ${clinical.next_visit_notes ? `<div style="margin-top:4px;white-space:pre-wrap;">${escapeHtml(clinical.next_visit_notes)}</div>` : ""}
    </div>` : ""}

  <div class="stamp"><span class="line">Doctor's Signature</span></div>

  <div class="footer">
    <div>${clinicInfo?.clinic_name ? escapeHtml(clinicInfo.clinic_name) : ""}</div>
    <div>This is a computer-generated prescription.</div>
  </div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;

  w.document.write(html);
  w.document.close();
}
