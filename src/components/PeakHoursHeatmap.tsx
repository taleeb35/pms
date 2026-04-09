import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { getDay, parseISO } from "date-fns";

interface PeakHoursHeatmapProps {
  /** Filter by a single doctor */
  doctorId?: string;
  /** Filter by doctor IDs (e.g. all doctors in a clinic) */
  doctorIds?: string[];
  /** If true, show all appointments (admin) */
  showAll?: boolean;
}

const PeakHoursHeatmap = ({ doctorId, doctorIds, showAll }: PeakHoursHeatmapProps) => {
  const [appointments, setAppointments] = useState<{ appointment_date: string; appointment_time: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("appointments")
          .select("appointment_date, appointment_time");

        if (doctorId) {
          query = query.eq("doctor_id", doctorId);
        } else if (doctorIds && doctorIds.length > 0) {
          query = query.in("doctor_id", doctorIds);
        }
        // if showAll, no filter

        const { data } = await query;
        setAppointments(data || []);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have valid filter or showAll
    if (doctorId || (doctorIds && doctorIds.length > 0) || showAll) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [doctorId, doctorIds, showAll]);

  const heatmapData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hourCounts: Record<string, Record<string, number>> = {};
    days.forEach((d) => { hourCounts[d] = {}; });

    appointments.forEach((a) => {
      if (!a.appointment_date || !a.appointment_time) return;
      const dayName = days[getDay(parseISO(a.appointment_date))];
      const hour = a.appointment_time.split(":")[0];
      const hourLabel = `${hour}:00`;
      hourCounts[dayName][hourLabel] = (hourCounts[dayName][hourLabel] || 0) + 1;
    });

    const allHours = new Set<string>();
    Object.values(hourCounts).forEach((h) => Object.keys(h).forEach((k) => allHours.add(k)));
    const sortedHours = Array.from(allHours).sort();

    return sortedHours.map((hour) => {
      const row: Record<string, any> = { hour };
      days.forEach((d) => { row[d] = hourCounts[d][hour] || 0; });
      return row;
    });
  }, [appointments]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peak Hours Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peak Hours Heatmap</CardTitle>
        <CardDescription>Appointment density by day of week and hour</CardDescription>
      </CardHeader>
      <CardContent>
        {heatmapData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="py-1 px-2 text-left font-medium text-muted-foreground">Hour</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <th key={d} className="py-1 px-2 text-center font-medium text-muted-foreground">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row) => {
                  const maxVal = Math.max(
                    ...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => row[d] || 0),
                    1
                  );
                  return (
                    <tr key={row.hour}>
                      <td className="py-1 px-2 font-medium text-muted-foreground">{row.hour}</td>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                        const val = row[d] || 0;
                        const intensity = val > 0 ? Math.max(0.15, val / maxVal) : 0;
                        return (
                          <td key={d} className="py-1 px-2 text-center">
                            <div
                              className="rounded-md mx-auto flex items-center justify-center h-7 w-10 text-xs font-medium"
                              style={{
                                backgroundColor: val > 0 ? `hsl(var(--primary) / ${intensity})` : "hsl(var(--muted))",
                                color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                              }}
                            >
                              {val || "–"}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No appointment data for heatmap</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeakHoursHeatmap;
