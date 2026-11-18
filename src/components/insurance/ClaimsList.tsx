import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/region";
import { friendlyDate } from "@/lib/datetime";
import { useCareDoctors } from "@/hooks/useCareDoctors";
import { downloadSheets } from "@/lib/exportSheet";
import { CLAIM_STATUSES, claimStatus, claimTotals, type Claim } from "@/lib/insurance";
import ClaimDialog from "./ClaimDialog";

// F7: all insurance claims (Reports → Insurance), with totals by stage and a status filter.
export default function ClaimsList() {
  const { doctors, loading: docsLoading } = useCareDoctors();
  const [claims, setClaims] = useState<(Claim & { patients?: { full_name?: string } })[]>([]);
  const [status, setStatus] = useState<string>("open");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Claim | null>(null);
  const ids = useMemo(() => doctors.map((d) => d.id), [doctors]);

  const load = useCallback(async () => {
    if (!ids.length) { setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any).from("insurance_claims").select("*, patients(full_name)").in("doctor_id", ids).order("created_at", { ascending: false }).limit(2000);
    setClaims(data || []);
    setLoading(false);
  }, [ids]);
  useEffect(() => { if (!docsLoading) void load(); }, [docsLoading, load]);

  const shown = claims.filter((c) => status === "all" ? true : status === "open" ? !["paid", "rejected"].includes(c.status) : c.status === status);
  const t = claimTotals(claims);
  const docName = (id: string) => doctors.find((d) => d.id === id)?.name || "";

  const exportXlsx = () => downloadSheets(`insurance_claims_${new Date().toISOString().slice(0, 10)}.xlsx`, [{ name: "Claims", rows: shown.map((c) => ({
    Patient: c.patients?.full_name || "", Insurer: c.insurer, Policy: c.policy_number || "", Reference: c.claim_reference || "",
    Status: claimStatus(c.status).label, Claimed: Number(c.amount_claimed), Approved: c.amount_approved == null ? "" : Number(c.amount_approved),
    Submitted: c.submitted_at || "", Decided: c.decided_at || "", ...(doctors.length > 1 ? { Doctor: docName(c.doctor_id) } : {}), Notes: c.notes || "",
  })) }]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Waiting for insurer", v: t.waiting, hint: "Submitted, not decided" },
          { label: "Approved, not paid yet", v: t.expected },
          { label: "Paid by insurers", v: t.paid },
          { label: "Rejected", v: t.rejected },
        ].map((c) => (
          <Card key={c.label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{c.label}</p><p className="mt-1 text-xl font-bold tabular-nums">{money(c.v)}</p>{c.hint && <p className="text-[11px] text-muted-foreground">{c.hint}</p>}</CardContent></Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[{ value: "open", label: "Open" }, ...CLAIM_STATUSES, { value: "all", label: "All" }].map((s) => (
          <Button key={s.value} size="sm" variant={status === s.value ? "default" : "outline"} className="h-8" onClick={() => setStatus(s.value)}>{s.label}</Button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto h-8" onClick={exportXlsx} disabled={!shown.length}>Export Excel</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex items-center gap-2 p-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
            : shown.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">{claims.length ? "No claims with this status." : "No insurance claims yet. Add a patient's insurance on their page, then create a claim from the visit."}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr><th className="p-3 font-medium">Patient</th><th className="p-3 font-medium">Insurer</th><th className="p-3 font-medium">Status</th><th className="p-3 text-right font-medium">Claimed</th><th className="p-3 text-right font-medium">Approved</th><th className="p-3 font-medium">Submitted</th>{doctors.length > 1 && <th className="p-3 font-medium">Doctor</th>}</tr>
                </thead>
                <tbody>
                  {shown.map((c) => {
                    const st = claimStatus(c.status);
                    return (
                      <tr key={c.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setEditing(c)}>
                        <td className="p-3 font-medium">{c.patients?.full_name || "Patient"}</td>
                        <td className="p-3">{c.insurer}{c.claim_reference ? <span className="block text-xs text-muted-foreground">Ref {c.claim_reference}</span> : null}</td>
                        <td className="p-3"><span className={`rounded px-1.5 py-0.5 text-xs font-medium ${st.tone}`}>{st.label}</span></td>
                        <td className="p-3 text-right tabular-nums">{money(c.amount_claimed)}</td>
                        <td className="p-3 text-right tabular-nums">{c.amount_approved == null ? "—" : money(c.amount_approved)}</td>
                        <td className="p-3">{c.submitted_at ? friendlyDate(c.submitted_at) : "—"}</td>
                        {doctors.length > 1 && <td className="p-3">{docName(c.doctor_id)}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <ClaimDialog open={!!editing} claim={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />
    </div>
  );
}
