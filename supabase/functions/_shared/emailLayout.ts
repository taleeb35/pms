// One clean layout for every Zonoir email (admin notices, welcome emails, added-doctor emails).
// All values passed in `rows` must already be escaped with esc().

export const APP_URL = "https://app.zonoir.com";
export const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const regionNames = (() => { try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; } })();
export const countryLabel = (code?: string | null) => { if (!code) return ""; try { return regionNames?.of(code) || code; } catch { return code; } };
export const shortDate = (d?: string | null) => d ? new Date(`${String(d).slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";
export const mailLink = (email?: string | null) => email ? `<a href="mailto:${esc(email)}" style="color:#4338ca;text-decoration:none">${esc(email)}</a>` : "";

export type EmailOptions = {
  label: string;                         // small text top right, e.g. "Admin notification" or "Welcome"
  title: string;
  intro: string;                         // HTML (escape any user values)
  rows?: [string, string][];             // label, escaped value
  sections?: { title: string; html: string }[];
  button?: { label: string; href: string };
  note?: string;                         // small grey text under the button (HTML)
  footer: string;                        // footer text (HTML)
};

export function emailLayout(o: EmailOptions): string {
  const rows = (o.rows || []).filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;color:#6b7280;font-size:13px;width:38%;vertical-align:top">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;color:#111827;font-size:14px;font-weight:500">${v}</td>
      </tr>`).join("");
  const sections = (o.sections || []).map((s) => `<tr><td style="padding:18px 28px 0">
      <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#111827">${esc(s.title)}</p>
      <div style="font-size:14px;line-height:1.6;color:#4b5563">${s.html}</div>
    </td></tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(o.title)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
        <tr><td style="padding:22px 28px;border-bottom:1px solid #eef0f4">
          <span style="font-size:18px;font-weight:700;color:#4338ca;letter-spacing:-0.2px">Zonoir</span>
          <span style="float:right;font-size:12px;color:#9ca3af;line-height:26px">${esc(o.label)}</span>
        </td></tr>
        <tr><td style="padding:26px 28px 8px">
          <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#111827">${esc(o.title)}</h1>
          <div style="margin:0;font-size:14px;line-height:1.6;color:#4b5563">${o.intro}</div>
        </td></tr>
        ${rows ? `<tr><td style="padding:12px 28px 4px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table></td></tr>` : ""}
        ${sections}
        ${o.button ? `<tr><td style="padding:22px 28px ${o.note ? "8px" : "28px"}">
          <a href="${o.button.href}" style="display:inline-block;background:#4338ca;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:8px">${esc(o.button.label)}</a>
        </td></tr>` : ""}
        ${o.note ? `<tr><td style="padding:0 28px 26px;font-size:12px;line-height:1.5;color:#6b7280">${o.note}</td></tr>` : ""}
        <tr><td style="padding:14px 28px;border-top:1px solid #eef0f4;font-size:12px;line-height:1.5;color:#9ca3af">${o.footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
