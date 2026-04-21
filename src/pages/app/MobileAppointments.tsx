import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

const MobileAppointments = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, reason, patients(full_name)")
        .eq("doctor_id", user.id)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })
        .limit(50);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <MobileAppShell title="Appointments">
      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-12">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12">No appointments yet</div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a.id} className="p-3 border-border/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{a.patients?.full_name || "Unknown"}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(a.appointment_date), "dd MMM")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.appointment_time}</span>
                  </div>
                  {a.reason && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.reason}</p>}
                </div>
                <Badge variant="outline" className="capitalize text-[10px]">{a.status || "scheduled"}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </MobileAppShell>
  );
};

export default MobileAppointments;
