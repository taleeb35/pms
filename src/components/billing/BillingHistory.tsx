import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FileText, Receipt, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usd } from "@/lib/pricingConfig";
import { billingAction, useBillingState } from "@/lib/billing";

type Invoice = {
  id: string; number: string | null; created: number; status: string; total: number; amount_paid: number; amount_due: number;
  currency: string; period_start?: number; period_end?: number; hosted_invoice_url?: string; invoice_pdf?: string;
};
type Payment = {
  id: string; created: number; amount: number; amount_refunded: number; currency: string; status: string;
  paid: boolean; refunded: boolean; card: string | null; failure: string | null; receipt_url?: string;
};
type ManualPayment = { id: string; month: string; amount: number; status: string; payment_date: string | null };

const money = (cents: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: (cur || "usd").toUpperCase() }).format((cents || 0) / 100);
const day = (unix?: number) => (unix ? format(new Date(unix * 1000), "d MMM yyyy") : "-");

const INVOICE_STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  paid: { label: "Paid", variant: "default" },
  open: { label: "Due", variant: "destructive" },
  void: { label: "Void", variant: "outline" },
  uncollectible: { label: "Unpaid", variant: "destructive" },
};

// Past invoices and payments on the Billing & Subscription page.
// Card billing: read from Stripe. Manual billing: the monthly payments the admin recorded.
export default function BillingHistory() {
  const { state, loading } = useBillingState(true);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [manual, setManual] = useState<ManualPayment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !state) return;
    if (!state.is_owner) return;
    if (state.exempt) {
      const table = state.kind === "clinic" ? "clinic_payments" : "doctor_payments";
      const col = state.kind === "clinic" ? "clinic_id" : "doctor_id";
      (supabase as any).from(table).select("id, month, amount, status, payment_date").eq(col, state.owner_id)
        .order("month", { ascending: false }).limit(60)
        .then(({ data }: any) => setManual(data || []));
      return;
    }
    billingAction<{ invoices: Invoice[]; payments: Payment[] }>("history")
      .then((r) => { setInvoices(r.invoices); setPayments(r.payments); })
      .catch((e) => { setError(e.message); setInvoices([]); setPayments([]); });
  }, [loading, state]);

  if (loading || !state || !state.is_owner) return null;

  if (state.exempt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Payment history</CardTitle>
          <CardDescription>Monthly payments recorded by Zonoir.</CardDescription>
        </CardHeader>
        <CardContent>
          {manual === null ? <p className="text-sm text-muted-foreground">Loading...</p> : manual.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Paid on</TableHead></TableRow></TableHeader>
                <TableBody>
                  {manual.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{format(new Date(`${p.month.slice(0, 10)}T00:00:00`), "MMMM yyyy")}</TableCell>
                      <TableCell>{usd(p.amount)}</TableCell>
                      <TableCell><Badge variant={p.status === "paid" ? "default" : "destructive"}>{p.status === "paid" ? "Paid" : "Unpaid"}</Badge></TableCell>
                      <TableCell>{p.payment_date ? format(new Date(p.payment_date), "d MMM yyyy") : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Invoices</CardTitle>
          <CardDescription>Your last 24 invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          {invoices === null ? <p className="text-sm text-muted-foreground">Loading...</p> : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Period</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>
                  {invoices.map((i) => {
                    const st = INVOICE_STATUS[i.status] || { label: i.status, variant: "secondary" as const };
                    return (
                      <TableRow key={i.id}>
                        <TableCell className="whitespace-nowrap">{day(i.created)}<div className="text-xs text-muted-foreground">{i.number}</div></TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{day(i.period_start)} – {day(i.period_end)}</TableCell>
                        <TableCell>{money(i.total, i.currency)}</TableCell>
                        <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {i.hosted_invoice_url && (
                            <a href={i.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="mr-3 inline-flex items-center text-sm text-primary hover:underline">
                              <ExternalLink className="mr-1 h-3.5 w-3.5" />{i.status === "open" ? "Pay" : "View"}
                            </a>
                          )}
                          {i.invoice_pdf && (
                            <a href={i.invoice_pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary hover:underline">
                              <Download className="mr-1 h-3.5 w-3.5" />PDF
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Payments</CardTitle>
          <CardDescription>Card payments and refunds.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments === null ? <p className="text-sm text-muted-foreground">Loading...</p> : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Card</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap">{day(p.created)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {money(p.amount, p.currency)}
                        {p.amount_refunded > 0 && <div className="text-xs text-muted-foreground">Refunded {money(p.amount_refunded, p.currency)}</div>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs capitalize">{p.card || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={p.refunded ? "outline" : p.paid ? "default" : "destructive"} title={p.failure || undefined}>
                          {p.refunded ? "Refunded" : p.paid ? "Paid" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.receipt_url && (
                          <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary hover:underline">
                            <ExternalLink className="mr-1 h-3.5 w-3.5" />Receipt
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
