import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Loader2, Printer, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/region";

// F4: invoice a patient opens from a link (no sign-in). Billing details only.
type Inv = {
  found: boolean; number?: string; date?: string; status?: string;
  consultation_fee?: number; procedure_fee?: number; procedure_name?: string | null; other_fee?: number; discount?: number;
  amount_paid?: number | null; currency?: string; patient?: string; patient_ref?: string;
  doctor?: string | null; doctor_specialization?: string | null; clinic?: string | null; address?: string | null; phone?: string | null; city?: string | null;
};

export default function SharedInvoice() {
  const { token = "" } = useParams();
  const [inv, setInv] = useState<Inv | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    document.title = "Invoice | Zonoir";
    (async () => {
      const { data, error } = await (supabase as any).rpc("get_shared_invoice", { p_token: token });
      if (error) setErr(true); else setInv(data as Inv);
    })();
  }, [token]);

  const m = (v?: number | null) => formatMoney(Number(v || 0), inv?.currency || "PKR");
  const lines = inv?.found ? [
    { label: "Consultation", amount: Number(inv.consultation_fee || 0) },
    { label: inv.procedure_name ? `Procedure: ${inv.procedure_name}` : "Procedure", amount: Number(inv.procedure_fee || 0) },
    { label: "Other charges", amount: Number(inv.other_fee || 0) },
  ].filter((l) => l.amount > 0) : [];
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const discount = Number(inv?.discount || 0);
  const total = subtotal - discount;
  const paid = inv?.amount_paid === null || inv?.amount_paid === undefined ? total : Number(inv.amount_paid);
  const due = Math.max(0, Math.round((total - paid) * 100) / 100);

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8 print:bg-white print:p-0">
      <Card className="mx-auto w-full max-w-2xl print:border-0 print:shadow-none">
        <CardContent className="space-y-6 p-6 sm:p-8">
          {!inv && !err && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading invoice…</div>}
          {err && <p className="text-destructive">Could not load the invoice right now. Please try again.</p>}
          {inv && !inv.found && (
            <div className="flex items-start gap-3"><HelpCircle className="h-7 w-7 shrink-0 text-amber-500" />
              <div><p className="text-lg font-semibold">Invoice not found</p><p className="text-sm text-muted-foreground">This link is not valid. Please ask the clinic for a new one.</p></div></div>
          )}
          {inv?.found && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-xl font-bold">{inv.clinic || inv.doctor}</p>
                  {inv.clinic && inv.doctor && <p className="text-sm">{inv.doctor}{inv.doctor_specialization ? ` · ${inv.doctor_specialization}` : ""}</p>}
                  <p className="text-sm text-muted-foreground">{[inv.address, inv.city].filter(Boolean).join(", ")}</p>
                  {inv.phone && <p className="text-sm text-muted-foreground">{inv.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-wide">INVOICE</p>
                  <p className="font-mono text-sm">{inv.number}</p>
                  <p className="text-sm text-muted-foreground">{inv.date ? format(parseISO(inv.date), "d MMM yyyy") : ""}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Bill to</p>
                <p className="font-medium">{inv.patient}</p>
                <p className="text-muted-foreground">Patient ID {inv.patient_ref}</p>
              </div>

              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 font-medium">Description</th><th className="py-2 text-right font-medium">Amount</th></tr></thead>
                <tbody>
                  {lines.length === 0 && <tr><td className="py-2 text-muted-foreground" colSpan={2}>No charges recorded for this visit.</td></tr>}
                  {lines.map((l) => <tr key={l.label} className="border-b"><td className="py-2">{l.label}</td><td className="py-2 text-right tabular-nums">{m(l.amount)}</td></tr>)}
                </tbody>
                <tfoot>
                  {discount > 0 && <tr><td className="py-1.5 text-right text-muted-foreground">Discount</td><td className="py-1.5 text-right tabular-nums">−{m(discount)}</td></tr>}
                  <tr><td className="py-1.5 text-right font-semibold">Total</td><td className="py-1.5 text-right text-base font-bold tabular-nums">{m(total)}</td></tr>
                  <tr><td className="py-1.5 text-right text-muted-foreground">Paid</td><td className="py-1.5 text-right tabular-nums">{m(paid)}</td></tr>
                  <tr><td className="py-1.5 text-right font-semibold">Balance due</td><td className={`py-1.5 text-right font-bold tabular-nums ${due > 0 ? "text-destructive" : ""}`}>{m(due)}</td></tr>
                </tfoot>
              </table>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 print:hidden">
                <p className="text-xs text-muted-foreground">{due > 0 ? "Please pay the balance at the clinic." : "Paid in full. Thank you."}</p>
                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print or save as PDF</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
