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
  let doctorQualification = "";
  let doctorPmdc = "";
  let doctorContact = "";
  let clinicInfo: { clinic_name?: string; address?: string; city?: string; phone_number?: string } | null = null;

  try {
    const { data: doc } = await supabase
      .from("doctors")
      .select("specialization, qualification, pmdc_number, contact_number, clinic_id, profiles(full_name)")
      .eq("id", appointment.doctor_id)
      .maybeSingle();
    if (doc) {
      doctorName = doctorName || (doc as any)?.profiles?.full_name || "";
      doctorSpecialization = doctorSpecialization || doc.specialization || "";
      doctorQualification = (doc as any).qualification || "";
      doctorPmdc = (doc as any).pmdc_number || "";
      doctorContact = (doc as any).contact_number || "";
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

  // For eye specialists we render presenting_complaints / ocular_history in a dedicated
  // ophthalmology block, so don't auto-promote them into the generic Chief Complaint / History sections.
  const effChiefComplaint = clinical.chief_complaint?.trim() || "";
  const historyParts = [
    v("systemic_history") && `Systemic: ${v("systemic_history")}`,
    v("drug_allergy") && `Drug allergy: ${v("drug_allergy")}`,
    v("surgical_history") && `Surgical: ${v("surgical_history")}`,
  ].filter(Boolean) as string[];
  const effPatientHistory = clinical.patient_history?.trim() || historyParts.join("\n");
  const effDiagnosisText = clinical.icd_description || v("eye_diagnosis");
  const effPrescription =
    clinical.current_prescription?.trim() ||
    [v("treatment_plan"), v("management_plan")].filter(Boolean).join("\n\n");

  // ---- Ophthalmology print block (limited per doctor request) ----
  // Pick a single VA value per eye: prefer unaided -> glasses -> pinhole -> near
  const pickVA = (eye: "right" | "left") =>
    v(`va_${eye}_unaided`) || v(`va_${eye}_glasses`) || v(`va_${eye}_pinhole`) || v(`va_${eye}_near`);
  const vaRight = pickVA("right");
  const vaLeft = pickVA("left");
  const vaFilled = !!(vaRight || vaLeft);

  // Structured IOP table
  const iopFields = [
    "iop_right","iop_left","pachymetry_right","pachymetry_left",
    "cf_right","cf_left","iop_final_right","iop_final_left","iop_method","iop"
  ];
  const iopFilled = iopFields.some((k) => v(k));

  const vaHTML = vaFilled ? `
    <div class="kv"><span class="kv-label">VA:</span>
      ${vaRight ? `<strong>(R)</strong> ${escapeHtml(vaRight)}` : ""}
      ${vaLeft ? `<span style="margin-left:14px;"><strong>(L)</strong> ${escapeHtml(vaLeft)}</span>` : ""}
    </div>` : "";

  const iopHTML = iopFilled ? `
    <table class="data-table">
      <thead><tr>
        <th style="width:10%;">For</th><th>IOP (mmHg)</th><th>Pachymetry</th><th>CF</th><th>Final</th>
      </tr></thead>
      <tbody>
        <tr><td><strong>(R)</strong></td><td>${escapeHtml(v("iop_right"))}</td><td>${escapeHtml(v("pachymetry_right"))}</td><td>${escapeHtml(v("cf_right"))}</td><td>${escapeHtml(v("iop_final_right"))}</td></tr>
        <tr><td><strong>(L)</strong></td><td>${escapeHtml(v("iop_left"))}</td><td>${escapeHtml(v("pachymetry_left"))}</td><td>${escapeHtml(v("cf_left"))}</td><td>${escapeHtml(v("iop_final_left"))}</td></tr>
      </tbody>
    </table>
    ${v("iop_method") || v("iop") ? `<div class="muted-line">
      ${v("iop_method") ? `<strong>Method:</strong> ${escapeHtml(v("iop_method"))}` : ""}
      ${v("iop") ? `${v("iop_method") ? " · " : ""}<strong>Notes:</strong> ${escapeHtml(v("iop"))}` : ""}
    </div>` : ""}` : "";

  const presenting = v("presenting_complaints");
  const ocular = v("ocular_history");
  const eyeHistoryHTML = (presenting || ocular) ? `
    ${presenting ? `<div class="kv"><span class="kv-label">Presenting Complaints:</span> ${escapeHtml(presenting)}</div>` : ""}
    ${ocular ? `<div class="kv"><span class="kv-label">Ocular History:</span> ${escapeHtml(ocular)}</div>` : ""}` : "";

  const ophthalmologySections = (vaHTML || iopHTML)
    ? `<h3 class="section">Vision &amp; IOP</h3>${vaHTML}${iopHTML}`
    : "";
  const eyeHistorySection = eyeHistoryHTML
    ? `<h3 class="section">History &amp; Presenting Complaints</h3>${eyeHistoryHTML}`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Prescription ${escapeHtml(rxNo)} — ${escapeHtml(patient.full_name)}</title>
<style>
  @page { margin: 1.2cm 1.2cm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; color: #000; margin: 0; line-height: 1.4; }
  .doc { max-width: 800px; margin: 0 auto; }

  /* Header */
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; gap: 20px; }
  .clinic-name { font-size: 18pt; font-weight: 700; margin: 0; color: #000; }
  .clinic-meta { font-size: 9pt; margin-top: 2px; line-height: 1.35; color: #000; }
  .doctor-side { text-align: right; }
  .doctor-name { font-size: 12.5pt; font-weight: 700; margin: 0; color: #000; }
  .doctor-quals, .doctor-spec, .doctor-extra { font-size: 9pt; margin-top: 1px; color: #000; line-height: 1.35; }
  .doctor-spec { font-weight: 600; }

  /* Patient strip */
  .pat-strip { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #000; margin-bottom: 10px; }
  .pat-cell { padding: 5px 8px; border-right: 1px solid #000; }
  .pat-cell:last-child { border-right: none; }
  .pat-cell .label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: .4px; color: #000; }
  .pat-cell .val { font-weight: 700; font-size: 10pt; color: #000; }
  .pat-cell .sub { font-size: 8.5pt; color: #000; }

  /* Section headings */
  h3.section { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #000; margin: 10px 0 4px; padding-bottom: 2px; border-bottom: 1px solid #000; }

  /* Inline key/value & generic */
  .kv { font-size: 10pt; margin: 2px 0; color: #000; }
  .kv-label { font-weight: 700; }
  .muted-line { font-size: 9.5pt; margin-top: 3px; color: #000; }

  /* Vitals inline list */
  .vitals-line { font-size: 10pt; color: #000; margin: 2px 0 0; }
  .vitals-line .vi { display: inline-block; margin-right: 16px; }
  .vitals-line .vi-label { font-weight: 700; }

  /* Content paragraphs */
  .para { font-size: 10pt; white-space: pre-wrap; margin: 2px 0; color: #000; }

  /* Data tables */
  table.data-table { width: 100%; border-collapse: collapse; margin-top: 3px; font-size: 9.5pt; }
  table.data-table th, table.data-table td { border: 1px solid #000; padding: 3px 6px; text-align: left; color: #000; }
  table.data-table th { font-weight: 700; }

  /* Diagnosis */
  .dx { font-size: 10pt; margin: 3px 0; color: #000; }
  .dx-code { display: inline-block; padding: 1px 6px; border: 1px solid #000; font-weight: 700; margin-right: 6px; font-size: 9.5pt; }

  /* Rx block */
  .rx-wrap { border: 1px solid #000; margin-top: 4px; }
  .rx-head { display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: #000; color: #fff; }
  .rx-symbol { font-size: 14pt; font-weight: 800; }
  .rx-title { font-size: 10pt; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; }
  .rx-body { padding: 8px 12px; white-space: pre-wrap; font-size: 10.5pt; line-height: 1.5; color: #000; }

  /* Footer */
  .stamp { margin-top: 28px; text-align: right; font-size: 9pt; color: #000; }
  .stamp .line { display: inline-block; border-top: 1px solid #000; padding-top: 3px; min-width: 200px; font-weight: 700; }
  .footer { margin-top: 14px; padding-top: 6px; border-top: 1px solid #000; font-size: 8.5pt; color: #000; display: flex; justify-content: space-between; }

  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="doc">
  <div class="top">
    <div class="clinic-side">
      <h1 class="clinic-name">${escapeHtml(clinicInfo?.clinic_name || "Medical Prescription")}</h1>
      <div class="clinic-meta">
        ${clinicInfo?.address ? escapeHtml(clinicInfo.address) + (clinicInfo.city ? ", " + escapeHtml(clinicInfo.city) : "") : ""}
        ${clinicInfo?.phone_number ? `<br/>Tel: ${escapeHtml(clinicInfo.phone_number)}` : ""}
      </div>
    </div>
    <div class="doctor-side">
      ${doctorName ? `<div class="doctor-name">${escapeHtml(doctorName)}</div>` : ""}
      ${doctorQualification ? `<div class="doctor-quals">${escapeHtml(doctorQualification)}</div>` : ""}
      ${doctorSpecialization ? `<div class="doctor-spec">${escapeHtml(doctorSpecialization)}</div>` : ""}
      ${doctorPmdc ? `<div class="doctor-extra">PMDC #: ${escapeHtml(doctorPmdc)}</div>` : ""}
      ${doctorContact ? `<div class="doctor-extra">${escapeHtml(doctorContact)}</div>` : ""}
    </div>
  </div>

  <div class="pat-strip">
    <div class="pat-cell">
      <div class="label">Patient</div>
      <div class="val">${escapeHtml(patient.full_name)}</div>
      <div class="sub">ID: ${escapeHtml(patient.patient_id)}</div>
    </div>
    <div class="pat-cell">
      <div class="label">Age / Gender</div>
      <div class="val">${age != null ? age + " yrs" : "—"}${patient.gender ? " / " + escapeHtml(patient.gender) : ""}</div>
      ${patient.phone ? `<div class="sub">${escapeHtml(patient.phone)}</div>` : ""}
    </div>
    <div class="pat-cell">
      <div class="label">Visit Date</div>
      <div class="val">${escapeHtml(visitDate)}</div>
      ${visitTime ? `<div class="sub">${escapeHtml(visitTime)}</div>` : ""}
    </div>
    <div class="pat-cell">
      <div class="label">Rx No.</div>
      <div class="val">${escapeHtml(rxNo)}</div>
      <div class="sub">Issued: ${escapeHtml(issuedOn)}</div>
    </div>
  </div>

  ${vitalsRows.length > 0 ? `<h3 class="section">Vitals</h3>
  <div class="vitals-line">
    ${vitalsRows.map(r => `<span class="vi"><span class="vi-label">${escapeHtml(r.label)}:</span> ${escapeHtml(r.value || "")}</span>`).join("")}
  </div>` : ""}

  ${effChiefComplaint ? `<h3 class="section">Chief Complaint</h3><div class="para">${escapeHtml(effChiefComplaint)}</div>` : ""}

  ${effPatientHistory ? `<h3 class="section">History</h3><div class="para">${escapeHtml(effPatientHistory)}</div>` : ""}

  ${ophthalmologySections}

  ${eyeHistorySection}

  ${(clinical.icd_code || effDiagnosisText) ? `<h3 class="section">Diagnosis</h3>
    <div class="dx">
      ${clinical.icd_code ? `<span class="dx-code">${escapeHtml(clinical.icd_code)}</span>` : ""}
      ${effDiagnosisText ? escapeHtml(effDiagnosisText) : ""}
    </div>` : ""}

  ${effPrescription ? `<h3 class="section">Prescription</h3>
    <div class="rx-wrap">
      <div class="rx-head"><span class="rx-symbol">℞</span><span class="rx-title">Medications</span></div>
      <div class="rx-body">${escapeHtml(effPrescription)}</div>
    </div>` : ""}

  ${clinical.test_reports ? `<h3 class="section">Recommended Tests</h3><div class="para">${escapeHtml(clinical.test_reports)}</div>` : ""}

  ${(nextVisitFormatted || clinical.next_visit_notes) ? `<h3 class="section">Next Visit</h3>
    <div class="para">${nextVisitFormatted ? `<strong>Date:</strong> ${escapeHtml(nextVisitFormatted)}` : ""}${clinical.next_visit_notes ? (nextVisitFormatted ? "\n" : "") + escapeHtml(clinical.next_visit_notes) : ""}</div>` : ""}

  <div class="stamp"><span class="line">${escapeHtml(doctorName || "Doctor's Signature")}</span></div>

  <div class="footer">
    <div>${clinicInfo?.clinic_name ? escapeHtml(clinicInfo.clinic_name) : ""}</div>
    <div>Computer-generated prescription.</div>
  </div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;


  w.document.write(html);
  w.document.close();
}
