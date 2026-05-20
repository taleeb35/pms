import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface SalesInvoiceData {
  id: string;
  clinic_id: string;
  invoice_number: string;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  sale_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
}

export interface SalesInvoiceItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  _productName?: string;
  _unit?: string;
}

export interface SalesInvoiceReturn {
  id: string;
  return_number?: string | null;
  return_date?: string | null;
  created_at?: string;
  refund_amount?: number | string | null;
  notes?: string | null;
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
  return new Intl.NumberFormat("en-PK").format(Math.round(Number(v)));
};

export async function printSalesInvoice(opts: {
  invoice: SalesInvoiceData;
  items: SalesInvoiceItem[];
  returns?: SalesInvoiceReturn[];
}) {
  const { invoice, items, returns = [] } = opts;

  let clinicInfo: {
    clinic_name?: string;
    address?: string;
    city?: string;
    phone_number?: string;
  } | null = null;

  try {
    const { data: c } = await supabase
      .from("clinics")
      .select("clinic_name, address, city, phone_number")
      .eq("id", invoice.clinic_id)
      .maybeSingle();
    clinicInfo = (c as any) || null;
  } catch (e) {
    console.error("Sales invoice header fetch failed", e);
  }

  const w = window.open("", "_blank");
  if (!w) return;

  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax || 0);
  const discount = Number(invoice.discount || 0);
  const total = Number(invoice.total || subtotal + tax - discount);

  const totalRefunded = returns.reduce(
    (s, r) => s + Number(r.refund_amount || 0),
    0
  );
  const netPayable = total - totalRefunded;

  const saleDate = format(new Date(invoice.sale_date), "dd MMM yyyy");
  const issuedOn = format(new Date(), "dd MMM yyyy, h:mm a");

  const statusLabel = (invoice.status || "").toUpperCase();
  const statusColors: Record<string, { bg: string; fg: string; bd: string }> = {
    ISSUED: { bg: "#ecfdf5", fg: "#047857", bd: "#a7f3d0" },
    DRAFT: { bg: "#fef9c3", fg: "#854d0e", bd: "#fde68a" },
    CANCELLED: { bg: "#fee2e2", fg: "#b91c1c", bd: "#fecaca" },
  };
  const sc = statusColors[statusLabel] ?? { bg: "#f1f5f9", fg: "#475569", bd: "#e2e8f0" };

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(invoice.invoice_number)} — ${escapeHtml(clinicInfo?.clinic_name || "Sales Invoice")}</title>
<style>
  @page { margin: 1.2cm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; margin: 0; }
  .invoice { max-width: 780px; margin: 0 auto; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f766e; padding-bottom: 14px; margin-bottom: 18px; }
  .clinic-name { font-size: 20pt; font-weight: 700; color: #0f766e; margin: 0; }
  .clinic-meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .invoice-block { text-align: right; }
  .invoice-block h2 { margin: 0; font-size: 22pt; color: #0f766e; letter-spacing: 1px; }
  .invoice-block .meta { font-size: 9.5pt; color: #555; margin-top: 4px; line-height: 1.5; }
  .badge { display: inline-block; padding: 2px 8px; background: ${sc.bg}; color: ${sc.fg}; border: 1px solid ${sc.bd}; border-radius: 4px; font-size: 8.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
  .pat { display: flex; justify-content: space-between; gap: 24px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 16px; font-size: 10pt; }
  .pat .col { flex: 1; }
  .pat .label { font-size: 8.5pt; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
  .pat .val { font-weight: 600; color: #0f172a; }
  h3.section { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .6px; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 10px; }
  table { width: 100%; border-collapse: collapse; }
  table.items th, table.items td { padding: 9px 12px; text-align: left; font-size: 10.5pt; }
  table.items thead th { background: #0f766e; color: #fff; font-weight: 600; font-size: 10pt; }
  table.items tbody tr { border-bottom: 1px solid #e2e8f0; }
  table.items td.amt, table.items th.amt { text-align: right; font-variant-numeric: tabular-nums; }
  table.items td.qty, table.items th.qty { text-align: center; }
  .totals { margin-top: 8px; margin-left: auto; width: 320px; font-size: 10.5pt; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 12px; }
  .totals .row.sub { border-top: 1px dashed #cbd5e1; }
  .totals .row.refund { color: #b91c1c; }
  .totals .row.total { background: #0f766e; color: #fff; font-weight: 700; font-size: 12pt; border-radius: 4px; margin-top: 6px; padding: 10px 12px; }
  .totals .row.net { background: #0f172a; color: #fff; font-weight: 700; font-size: 12pt; border-radius: 4px; margin-top: 6px; padding: 10px 12px; }
  .notes-box { padding: 10px 12px; background: #fefce8; border-left: 3px solid #eab308; color: #713f12; font-size: 9.5pt; border-radius: 3px; margin-top: 12px; white-space: pre-wrap; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9pt; color: #64748b; display: flex; justify-content: space-between; }
  .stamp { margin-top: 30px; text-align: right; font-size: 9.5pt; color: #475569; }
  .stamp .line { display: inline-block; border-top: 1px solid #94a3b8; padding-top: 4px; min-width: 200px; }
  table.returns th, table.returns td { padding: 7px 10px; font-size: 10pt; border-bottom: 1px solid #e2e8f0; text-align: left; }
  table.returns thead th { background: #f1f5f9; color: #475569; font-weight: 600; font-size: 9.5pt; text-transform: uppercase; letter-spacing: .4px; }
  table.returns td.amt, table.returns th.amt { text-align: right; color: #b91c1c; font-variant-numeric: tabular-nums; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="top">
    <div>
      <h1 class="clinic-name">${escapeHtml(clinicInfo?.clinic_name || "Sales Invoice")}</h1>
      <div class="clinic-meta">
        ${clinicInfo?.address ? escapeHtml(clinicInfo.address) + (clinicInfo.city ? ", " + escapeHtml(clinicInfo.city) : "") : ""}
        ${clinicInfo?.phone_number ? `<br/>Phone: ${escapeHtml(clinicInfo.phone_number)}` : ""}
        ${clinicInfo?.email ? ` &middot; ${escapeHtml(clinicInfo.email)}` : ""}
      </div>
    </div>
    <div class="invoice-block">
      <h2>INVOICE</h2>
      <div class="meta">
        <div><strong>${escapeHtml(invoice.invoice_number)}</strong></div>
        <div>Issued: ${escapeHtml(issuedOn)}</div>
        <div><span class="badge">${escapeHtml(statusLabel)}</span></div>
      </div>
    </div>
  </div>

  <div class="pat">
    <div class="col">
      <div class="label">Customer</div>
      <div class="val">${escapeHtml(invoice.customer_name || "Walk-in")}</div>
      ${invoice.customer_phone ? `<div style="font-size:9pt;color:#64748b;margin-top:2px;">${escapeHtml(invoice.customer_phone)}</div>` : ""}
    </div>
    <div class="col">
      <div class="label">Sale Date</div>
      <div class="val">${escapeHtml(saleDate)}</div>
    </div>
    <div class="col">
      <div class="label">Invoice #</div>
      <div class="val">${escapeHtml(invoice.invoice_number)}</div>
    </div>
  </div>

  <h3 class="section">Items</h3>
  ${
    items.length === 0
      ? `<div class="notes-box">No items on this invoice.</div>`
      : `<table class="items">
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th class="qty">Qty</th>
        <th class="amt">Unit Price (Rs)</th>
        <th class="amt">Line Total (Rs)</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (it, idx) => `<tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(it._productName || "—")}${it._unit ? ` <span style="color:#64748b;font-size:9pt;">(${escapeHtml(it._unit)})</span>` : ""}</td>
            <td class="qty">${fmtMoney(it.quantity)}</td>
            <td class="amt">${fmtMoney(it.unit_price)}</td>
            <td class="amt">${fmtMoney(Number(it.quantity) * Number(it.unit_price))}</td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table>`
  }

  <div class="totals">
    <div class="row sub"><span>Subtotal</span><span>Rs ${fmtMoney(subtotal)}</span></div>
    ${tax > 0 ? `<div class="row"><span>Tax</span><span>Rs ${fmtMoney(tax)}</span></div>` : ""}
    ${discount > 0 ? `<div class="row"><span>Discount</span><span>- Rs ${fmtMoney(discount)}</span></div>` : ""}
    <div class="row total"><span>Total</span><span>Rs ${fmtMoney(total)}</span></div>
    ${
      totalRefunded > 0
        ? `<div class="row refund" style="margin-top:6px;"><span>Refunded</span><span>- Rs ${fmtMoney(totalRefunded)}</span></div>
           <div class="row net"><span>Net Payable</span><span>Rs ${fmtMoney(netPayable)}</span></div>`
        : ""
    }
  </div>

  ${
    returns.length > 0
      ? `<h3 class="section">Refunds / Returns</h3>
    <table class="returns">
      <thead>
        <tr>
          <th>Return #</th>
          <th>Date</th>
          <th>Notes</th>
          <th class="amt">Refund (Rs)</th>
        </tr>
      </thead>
      <tbody>
        ${returns
          .map(
            (r) => `<tr>
              <td>${escapeHtml(r.return_number || r.id?.slice(0, 8).toUpperCase() || "—")}</td>
              <td>${escapeHtml(r.return_date ? format(new Date(r.return_date), "dd MMM yyyy") : r.created_at ? format(new Date(r.created_at), "dd MMM yyyy") : "—")}</td>
              <td>${escapeHtml(r.notes || "—")}</td>
              <td class="amt">- Rs ${fmtMoney(r.refund_amount)}</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>`
      : ""
  }

  ${invoice.notes ? `<div class="notes-box"><strong>Notes:</strong> ${escapeHtml(invoice.notes)}</div>` : ""}

  <div class="stamp"><span class="line">Authorised Signature</span></div>

  <div class="footer">
    <div>Thank you for your business${clinicInfo?.clinic_name ? " — " + escapeHtml(clinicInfo.clinic_name) : ""}.</div>
    <div>This is a computer-generated invoice.</div>
  </div>
</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;

  w.document.write(html);
  w.document.close();
}
