import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";

export interface InvoiceVitals {
  blood_pressure?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  height?: string;
  pain_scale?: number | null;
  right_eye_vision?: string;
  left_eye_vision?: string;
}

export interface InvoiceFees {
  consultation_fee?: number | string | null;
  procedure_fee?: number | string | null;
  procedure_name?: string | null;
  other_fee?: number | string | null;
  refund?: number | string | null;
}

export interface InvoicePatient {
  full_name: string;
  patient_id: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
}

export interface InvoiceAppointment {
  id: string;
  appointment_date: string;
  appointment_time?: string | null;
  appointment_type?: string | null;
  doctor_id: string;
}

const escapeHtml = (s: any) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const fmtMoney = (n: any) => {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (!v || isNaN(v)) return "0";
  return new Intl.NumberFormat("en-PK").format(v);
};

const fmtTime = (t?: string | null) => {
  if (!t) return "";
  // t is HH:MM:SS or HH:MM
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return format(d, "h:mm a");
};

export async function printAppointmentInvoice(opts: {
  appointment: InvoiceAppointment;
  patient: InvoicePatient;
  vitals: InvoiceVitals;
  fees: InvoiceFees;
  doctorName?: string;
  doctorSpecialization?: string;
}) {
  const { appointment, patient, vitals, fees } = opts;

  // Fetch doctor + clinic if not provided
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
    console.error("Invoice header fetch failed", e);
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const consultation = parseFloat(String(fees.consultation_fee ?? 0)) || 0;
  const procedure = parseFloat(String(fees.procedure_fee ?? 0)) || 0;
  const other = parseFloat(String(fees.other_fee ?? 0)) || 0;
  const refund = parseFloat(String(fees.refund ?? 0)) || 0;
  const subtotal = consultation + procedure + other;
  const total = subtotal - refund;

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const visitDate = format(new Date(appointment.appointment_date), "dd MMM yyyy");
  const visitTime = fmtTime(appointment.appointment_time);
  const invoiceNo = `INV-${appointment.id.slice(0, 8).toUpperCase()}`;
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

  const lineItems: { label: string; amount: number }[] = [];
  if (consultation > 0) lineItems.push({ label: "Consultation Fee", amount: consultation });
  if (procedure > 0)
    lineItems.push({
      label: fees.procedure_name ? `Procedure — ${fees.procedure_name}` : "Procedure Fee",
      amount: procedure,
    });
  if (other > 0) lineItems.push({ label: "Other Charges", amount: other });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(invoiceNo)} — ${escapeHtml(patient.full_name)}</title>
<style>
  @page { margin: 1.2cm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; margin: 0; }
  .invoice { max-width: 780px; margin: 0 auto; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f766e; padding-bottom: 14px; margin-bottom: 18px; }
  .clinic-name { font-size: 20pt; font-weight: 700; color: #0f766e; margin: 0; }
  .clinic-meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .doc-meta { font-size: 9.5pt; color: #444; margin-top: 6px; }
  .invoice-block { text-align: right; }
  .invoice-block h2 { margin: 0; font-size: 22pt; color: #0f766e; letter-spacing: 1px; }
  .invoice-block .meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .badge { display: inline-block; padding: 2px 8px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 8.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
  .pat { display: flex; justify-content: space-between; gap: 24px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 16px; font-size: 10pt; }
  .pat .col { flex: 1; }
  .pat .label { font-size: 8.5pt; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
  .pat .val { font-weight: 600; color: #0f172a; }
  h3.section { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .6px; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 10px; }
  table { width: 100%; border-collapse: collapse; }
  table.vitals td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 10pt; }
  table.vitals td.lab { background: #f8fafc; color: #475569; width: 40%; font-weight: 600; }
  table.items th, table.items td { padding: 9px 12px; text-align: left; font-size: 10.5pt; }
  table.items thead th { background: #0f766e; color: #fff; font-weight: 600; font-size: 10pt; }
  table.items tbody tr { border-bottom: 1px solid #e2e8f0; }
  table.items td.amt, table.items th.amt { text-align: right; font-variant-numeric: tabular-nums; }
  .totals { margin-top: 8px; margin-left: auto; width: 320px; font-size: 10.5pt; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 12px; }
  .totals .row.sub { border-top: 1px dashed #cbd5e1; }
  .totals .row.refund { color: #b91c1c; }
  .totals .row.total { background: #0f766e; color: #fff; font-weight: 700; font-size: 12pt; border-radius: 4px; margin-top: 6px; padding: 10px 12px; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9pt; color: #64748b; display: flex; justify-content: space-between; }
  .stamp { margin-top: 30px; text-align: right; font-size: 9.5pt; color: #475569; }
  .stamp .line { display: inline-block; border-top: 1px solid #94a3b8; padding-top: 4px; min-width: 200px; }
  .empty-note { padding: 8px 12px; background: #fefce8; border-left: 3px solid #eab308; color: #713f12; font-size: 9.5pt; border-radius: 3px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="top">
    <div>
      <h1 class="clinic-name">${escapeHtml(clinicInfo?.clinic_name || doctorName || "Medical Invoice")}</h1>
      <div class="clinic-meta">
        ${clinicInfo?.address ? escapeHtml(clinicInfo.address) + (clinicInfo.city ? ", " + escapeHtml(clinicInfo.city) : "") : ""}
        ${clinicInfo?.phone_number ? `<br/>Phone: ${escapeHtml(clinicInfo.phone_number)}` : ""}
      </div>
      ${doctorName ? `<div class="doc-meta"><strong>${escapeHtml(doctorName)}</strong>${doctorSpecialization ? " — " + escapeHtml(doctorSpecialization) : ""}</div>` : ""}
    </div>
    <div class="invoice-block">
      <h2>INVOICE</h2>
      <div class="meta">
        <div><strong>${escapeHtml(invoiceNo)}</strong></div>
        <div>Issued: ${escapeHtml(issuedOn)}</div>
        <div><span class="badge">Paid</span></div>
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

  ${
    vitalsRows.length > 0
      ? `<h3 class="section">Vitals Recorded</h3>
  <table class="vitals">
    <tbody>
      ${(() => {
        const rows: string[] = [];
        for (let i = 0; i < vitalsRows.length; i += 2) {
          const a = vitalsRows[i];
          const b = vitalsRows[i + 1];
          rows.push(
            `<tr><td class="lab">${escapeHtml(a.label)}</td><td>${escapeHtml(a.value || "")}</td>${
              b
                ? `<td class="lab">${escapeHtml(b.label)}</td><td>${escapeHtml(b.value || "")}</td>`
                : `<td></td><td></td>`
            }</tr>`
          );
        }
        return rows.join("");
      })()}
    </tbody>
  </table>`
      : ""
  }

  <h3 class="section">Charges</h3>
  ${
    lineItems.length === 0
      ? `<div class="empty-note">No charges were recorded for this visit.</div>`
      : `<table class="items">
    <thead>
      <tr>
        <th>Description</th>
        <th class="amt">Amount (Rs)</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems
        .map(
          (it) =>
            `<tr><td>${escapeHtml(it.label)}</td><td class="amt">${fmtMoney(it.amount)}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="row sub"><span>Subtotal</span><span>Rs ${fmtMoney(subtotal)}</span></div>
    ${refund > 0 ? `<div class="row refund"><span>Refund</span><span>- Rs ${fmtMoney(refund)}</span></div>` : ""}
    <div class="row total"><span>Total Payable</span><span>Rs ${fmtMoney(total)}</span></div>
  </div>`
  }

  <div class="stamp"><span class="line">Authorised Signature</span></div>

  <div class="footer">
    <div>Thank you for visiting${clinicInfo?.clinic_name ? " " + escapeHtml(clinicInfo.clinic_name) : ""}.</div>
    <div>This is a computer-generated invoice.</div>
  </div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
