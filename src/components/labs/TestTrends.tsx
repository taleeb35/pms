import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { friendlyDate } from "@/lib/datetime";
import { buildTrends, type LabOrder, type Trend } from "@/lib/labs";

// Trend charts for repeat tests (from lab results) and blood pressure / weight (from visit vitals).
// Shows nothing until something has at least two readings.
export default function TestTrends({ patientId, refreshKey }: { patientId: string; refreshKey?: unknown }) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [labs, visits] = await Promise.all([
        (supabase as any).from("lab_orders").select("test_name, status, result_value, result_unit, result_date, ordered_at").eq("patient_id", patientId).eq("status", "done").limit(1000),
        supabase.from("visit_records").select("visit_date, blood_pressure, weight").eq("patient_id", patientId).order("visit_date").limit(500),
      ]);
      if (!alive) return;
      const t = buildTrends((labs.data || []) as LabOrder[], (visits.data || []) as any[]);
      setTrends(t);
      setActive((cur) => (t.some((x) => x.key === cur) ? cur : t[0]?.key || ""));
    })();
    return () => { alive = false; };
  }, [patientId, refreshKey]);

  const trend = useMemo(() => trends.find((t) => t.key === active), [trends, active]);
  if (!trends.length || !trend) return null;
  const latest = trend.points[trend.points.length - 1];
  const data = trend.points.map((p) => ({ ...p, label: friendlyDate(p.date) }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Trends</CardTitle>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {trends.map((t) => (
            <Button key={t.key} type="button" size="sm" variant={t.key === active ? "default" : "outline"} className="h-8" onClick={() => setActive(t.key)}>
              {t.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm text-muted-foreground">
          Latest: <span className="font-semibold text-foreground tabular-nums">{latest.value}{latest.value2 !== undefined ? `/${latest.value2}` : ""}{trend.unit ? ` ${trend.unit}` : ""}</span> on {friendlyDate(latest.date)} · {trend.points.length} readings
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={16} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip
                formatter={(v: number, n: string) => [`${v}${trend.unit ? ` ${trend.unit}` : ""}`, n === "value2" ? (trend.series2 || "") : trend.series2 ? "Systolic" : trend.label]}
                contentStyle={{ fontSize: 12 }}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              {trend.series2 && <Line type="monotone" dataKey="value2" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
