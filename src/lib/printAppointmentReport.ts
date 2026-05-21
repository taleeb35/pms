import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";

export interface ReportPatient {
  full_name: string;
  patient_id: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
}

export interface ReportAppointment {
  id: string;
  appointment_date: string;
  appointment_time?: string | null;
  doctor_id: string;
}

export interface ReportField {
  title: string;
  value: string;
}

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

export async function printAppointmentReport(opts: {
  appointment: ReportAppointment;
  patient: ReportPatient;
  templateName: string;
  fields: ReportField[];
  additionalNotes?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}) {
  const { appointment, patient, templateName, fields, additionalNotes } = opts;

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
    console.error("Report header fetch failed", e);
  }

  const w = window.open("", "_blank");
  if (!w) return;

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const visitDate = format(new Date(appointment.appointment_date), "dd MMM yyyy");
  const visitTime = fmtTime(appointment.appointment_time);
  const reportNo = `RPT-${appointment.id.slice(0, 8).toUpperCase()}`;
  const issuedOn = format(new Date(), "dd MMM yyyy, h:mm a");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(templateName)} — ${escapeHtml(patient.full_name)}</title>
<style>
  @page { margin: 1.2cm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; margin: 0; }
  .doc { max-width: 780px; margin: 0 auto; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f766e; padding-bottom: 14px; margin-bottom: 18px; }
  .clinic-name { font-size: 20pt; font-weight: 700; color: #0f766e; margin: 0; }
  .clinic-meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .doc-meta { font-size: 9.5pt; color: #444; margin-top: 6px; }
  .rpt-block { text-align: right; }
  .rpt-block h2 { margin: 0; font-size: 18pt; color: #0f766e; letter-spacing: 1px; }
  .rpt-block .meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .title-bar { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: #fff; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 13pt; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
  .pat { display: flex; justify-content: space-between; gap: 24px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 16px; font-size: 10pt; }
  .pat .col { flex: 1; }
  .pat .label { font-size: 8.5pt; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
  .pat .val { font-weight: 600; color: #0f172a; }
  h3.section { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .6px; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 10px; }
  table.fields { width: 100%; border-collapse: collapse; }
  table.fields td { padding: 9px 12px; border: 1px solid #e2e8f0; font-size: 10.5pt; vertical-align: top; }
  table.fields td.lab { background: #f0fdfa; color: #0f766e; width: 35%; font-weight: 600; }
  .notes-box { padding: 10px 12px; background: #fafafa; border-left: 3px solid #475569; white-space: pre-wrap; font-size: 10.5pt; line-height: 1.55; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9pt; color: #64748b; display: flex; justify-content: space-between; }
  .stamp { margin-top: 30px; text-align: right; font-size: 9.5pt; color: #475569; }
  .stamp .line { display: inline-block; border-top: 1px solid #94a3b8; padding-top: 4px; min-width: 200px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="doc">
  <div class="top">
    <div>
      <h1 class="clinic-name">${escapeHtml(clinicInfo?.clinic_name || doctorName || "Medical Report")}</h1>
      <div class="clinic-meta">
        ${clinicInfo?.address ? escapeHtml(clinicInfo.address) + (clinicInfo.city ? ", " + escapeHtml(clinicInfo.city) : "") : ""}
        ${clinicInfo?.phone_number ? `<br/>Phone: ${escapeHtml(clinicInfo.phone_number)}` : ""}
      </div>
      ${doctorName ? `<div class="doc-meta"><strong>${escapeHtml(doctorName)}</strong>${doctorSpecialization ? " — " + escapeHtml(doctorSpecialization) : ""}</div>` : ""}
    </div>
    <div class="rpt-block">
      <h2>TEST REPORT</h2>
      <div class="meta">
        <div><strong>${escapeHtml(reportNo)}</strong></div>
        <div>Issued: ${escapeHtml(issuedOn)}</div>
      </div>
    </div>
  </div>

  <div class="title-bar">${escapeHtml(templateName)}</div>

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
    </div>
  </div>

  ${fields.length > 0 ? `<h3 class="section">Report Details</h3>
  <table class="fields">
    <tbody>
      ${fields.map(f => `<tr><td class="lab">${escapeHtml(f.title)}</td><td>${escapeHtml(f.value || "—")}</td></tr>`).join("")}
    </tbody>
  </table>` : ""}

  ${additionalNotes && additionalNotes.trim() ? `<h3 class="section">Additional Notes</h3>
    <div class="notes-box">${escapeHtml(additionalNotes)}</div>` : ""}

  <div class="stamp"><span class="line">Doctor's Signature</span></div>

  <div class="footer">
    <div>${clinicInfo?.clinic_name ? escapeHtml(clinicInfo.clinic_name) : ""}</div>
    <div>This is a computer-generated report.</div>
  </div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;

  w.document.write(html);
  w.document.close();
}
