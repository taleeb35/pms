// Fill a certificate template and print it with a QR code that links to the public check page.
import { differenceInCalendarDays, differenceInYears, format, parseISO } from "date-fns";


export type CertType = "sick_leave" | "work_leave" | "fitness" | "other";
export const CERT_TYPES: { value: CertType; label: string }[] = [
  { value: "sick_leave", label: "Sick leave certificate" },
  { value: "work_leave", label: "Work leave certificate" },
  { value: "fitness", label: "Fitness certificate" },
  { value: "other", label: "Medical certificate" },
];

export type CertFill = {
  patientName: string; patientId?: string; dob?: string | null; gender?: string | null;
  doctorName: string; visitDate?: string | null; from?: string; to?: string;
};

const nice = (d?: string | null) => (d ? format(parseISO(d), "d MMM yyyy") : "");
export const leaveDays = (from?: string, to?: string) =>
  from && to ? Math.max(1, differenceInCalendarDays(parseISO(to), parseISO(from)) + 1) : 0;

// Placeholders the doctor can type in a template, e.g. [Patient Name]. Matching ignores case and spaces.
export function fillTemplate(text: string, f: CertFill) {
  const map: Record<string, string> = {
    patientname: f.patientName,
    patientid: f.patientId || "",
    age: f.dob ? String(differenceInYears(new Date(), parseISO(f.dob))) : "",
    gender: f.gender || "",
    doctorname: f.doctorName,
    date: format(new Date(), "d MMM yyyy"),
    visitdate: nice(f.visitDate),
    from: nice(f.from), fromdate: nice(f.from), startdate: nice(f.from),
    to: nice(f.to), todate: nice(f.to), enddate: nice(f.to),
    days: f.from && f.to ? String(leaveDays(f.from, f.to)) : "",
  };
  return text.replace(/\[([^\]]+)\]/g, (m, k: string) => {
    const v = map[k.toLowerCase().replace(/[\s_-]/g, "")];
    return v !== undefined && v !== "" ? v : m;
  });
}

// The app domain the doctor is using (app.zonoir.com, or staging when testing).
export const verifyUrl = (code: string) => `${window.location.origin}/verify/${code}`;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export async function printCertificate(o: {
  code: string; title: string; body: string; issuedAt: string;
  doctorName: string; qualification?: string; specialization?: string; licence?: string;
  clinicName?: string; clinicAddress?: string; clinicPhone?: string;
}) {
  const QR = await import("qrcode");
  const url = verifyUrl(o.code);
  const qr = await QR.toDataURL(url, { margin: 1, width: 220 });
  const w = window.open("", "_blank");
  if (!w) throw new Error("Allow pop-ups to print the certificate.");
  const sub = [o.qualification, o.specialization].filter(Boolean).join(" · ");
  const clinic = [o.clinicName, o.clinicAddress, o.clinicPhone].filter(Boolean).join(" · ");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(o.title)} ${esc(o.code)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 0; }
  .head { border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 28px; }
  .doc { font-size: 22px; font-weight: bold; }
  .sub, .clinic { font-size: 13px; color: #444; margin-top: 3px; }
  h1 { text-align: center; font-size: 22px; letter-spacing: 1px; text-transform: uppercase; margin: 10px 0 26px; }
  .body { font-size: 16px; line-height: 1.75; white-space: pre-wrap; min-height: 220px; }
  .foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; }
  .sign { border-top: 1px solid #111; width: 240px; padding-top: 6px; font-size: 14px; }
  .qr { text-align: center; font-family: Arial, sans-serif; font-size: 11px; color: #444; }
  .qr img { width: 120px; height: 120px; display: block; margin: 0 auto 4px; }
  .meta { font-family: Arial, sans-serif; font-size: 12px; color: #555; margin-top: 18px; }
</style></head><body>
  <div class="head">
    <div class="doc">${esc(o.doctorName)}</div>
    ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
    ${o.licence ? `<div class="sub">${esc(o.licence)}</div>` : ""}
    ${clinic ? `<div class="clinic">${esc(clinic)}</div>` : ""}
  </div>
  <h1>${esc(o.title)}</h1>
  <div class="body">${esc(o.body)}</div>
  <div class="meta">Issued ${esc(format(new Date(o.issuedAt), "d MMM yyyy"))} · Certificate no. ${esc(o.code)}</div>
  <div class="foot">
    <div class="sign">${esc(o.doctorName)}<br>Signature and stamp</div>
    <div class="qr"><img src="${qr}" alt="QR code"><div>Scan to check this certificate</div><div>${esc(url.replace(/^https?:\/\//, ""))}</div></div>
  </div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body></html>`);
  w.document.close();
}
