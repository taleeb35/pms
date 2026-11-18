import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = { id: string; owner_id: string; kind: string; reason: string; comment: string | null; ends_at: string | null; undone_at: string | null; created_at: string };

// Admin: why clinics and doctors cancelled their subscription.
export default function CancelFeedbackList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("billing_cancel_feedback").select("*").order("created_at", { ascending: false }).limit(500);
      const list: Row[] = data || [];
      setRows(list);
      const ids = [...new Set(list.map((r) => r.owner_id))];
      if (!ids.length) return;
      const [cl, pr] = await Promise.all([
        supabase.from("clinics").select("id, clinic_name").in("id", ids),
        supabase.from("profiles").select("id, full_name, email").in("id", ids),
      ]);
      const n: Record<string, string> = {};
      (pr.data || []).forEach((p: any) => { n[p.id] = p.full_name || p.email; });
      (cl.data || []).forEach((c: any) => { n[c.id] = c.clinic_name; });
      setNames(n);
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription cancellations</CardTitle>
        <CardDescription>Reasons given when a clinic or doctor cancelled card billing.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows === null ? <p className="text-sm text-muted-foreground">Loading...</p> : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cancellations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Account</TableHead><TableHead>Reason</TableHead><TableHead>Comment</TableHead><TableHead>Access until</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(r.created_at), "d MMM yyyy")}</TableCell>
                    <TableCell>{names[r.owner_id] || "-"} <span className="text-xs text-muted-foreground">({r.kind})</span></TableCell>
                    <TableCell>{r.reason}{r.undone_at && <Badge variant="outline" className="ml-2">Undone</Badge>}</TableCell>
                    <TableCell className="max-w-[320px] whitespace-pre-wrap text-sm">{r.comment || "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.ends_at ? format(new Date(r.ends_at), "d MMM yyyy") : "-"}</TableCell>
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
