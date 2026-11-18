import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { npsOf } from "@/lib/nps";
import { downloadSheets } from "@/lib/exportSheet";
import CancelFeedbackList from "@/components/billing/CancelFeedbackList";

// Admin → Feedback: recommend scores (NPS) and ideas/problems sent from inside the app.
type Row = { id: string; user_id: string; kind: string; score: number | null; message: string | null; page: string | null; portal: string | null; created_at: string };
const KIND: Record<string, string> = { nps: "Score", idea: "Idea", problem: "Problem", other: "Other" };

export default function AdminFeedback() {
  const [rows, setRows] = useState<Row[]>([]);
  const [who, setWho] = useState<Record<string, { name: string; email: string }>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Feedback | Zonoir";
    (async () => {
      const { data } = await (supabase as any).from("app_feedback").select("*").order("created_at", { ascending: false }).limit(2000);
      const list = (data || []) as Row[];
      setRows(list);
      const ids = [...new Set(list.map((r) => r.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids.slice(0, 500));
        const m: Record<string, { name: string; email: string }> = {};
        (profs || []).forEach((p: any) => { m[p.id] = { name: p.full_name || "", email: p.email || "" }; });
        setWho(m);
      }
      setLoading(false);
    })();
  }, []);

  const scores90 = useMemo(() => rows.filter((r) => r.kind === "nps" && r.score !== null && Date.now() - new Date(r.created_at).getTime() < 90 * 864e5).map((r) => r.score!), [rows]);
  const nps = npsOf(scores90);
  const shown = filter === "all" ? rows : rows.filter((r) => r.kind === filter);

  const exportXlsx = () => downloadSheets(`Zonoir_feedback_${format(new Date(), "yyyy-MM-dd")}`, [{
    name: "Feedback",
    rows: rows.map((r) => ({ Date: format(new Date(r.created_at), "yyyy-MM-dd HH:mm"), Type: KIND[r.kind] || r.kind, Score: r.score, Message: r.message || "", Name: who[r.user_id]?.name || "", Email: who[r.user_id]?.email || "", Portal: r.portal || "", Page: r.page || "" })),
  }]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Feedback</h1>
          <p className="text-muted-foreground">Recommend scores and messages sent from inside the app.</p>
        </div>
        <Button variant="outline" onClick={exportXlsx} disabled={!rows.length}>Export Excel</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">NPS (last 90 days)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{nps === null ? "—" : nps}</div><p className="text-xs text-muted-foreground">{scores90.length} answers · 9–10 minus 0–6</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ideas</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{rows.filter((r) => r.kind === "idea").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Problems reported</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{rows.filter((r) => r.kind === "problem").length}</div></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "nps", "idea", "problem", "other"].map((k) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)}>{k === "all" ? "All" : KIND[k]}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {loading && <p className="p-4 text-muted-foreground">Loading…</p>}
          {!loading && !shown.length && <p className="p-4 text-muted-foreground">No feedback yet.</p>}
          {shown.map((r) => (
            <div key={r.id} className="p-4 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant={r.kind === "problem" ? "destructive" : "secondary"}>{KIND[r.kind] || r.kind}</Badge>
                {r.score !== null && <span className="font-semibold tabular-nums">{r.score}/10</span>}
                <span className="font-medium">{who[r.user_id]?.name || "Unknown"}</span>
                <span className="text-muted-foreground">{who[r.user_id]?.email}</span>
                <span className="ml-auto text-xs text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy, h:mm a")}{r.page ? ` · ${r.page}` : ""}</span>
              </div>
              {r.message && <p className="text-sm whitespace-pre-wrap">{r.message}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <CancelFeedbackList />
    </div>
  );
}
