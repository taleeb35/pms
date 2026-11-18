import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// E4: where this appointment takes place. Hidden for doctors who have not added locations.
export default function AppointmentLocation({ appointmentId, doctorId }: { appointmentId: string; doctorId: string }) {
  const { toast } = useToast();
  const [locs, setLocs] = useState<{ id: string; name: string; address: string | null }[]>([]);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    (async () => {
      const [l, a] = await Promise.all([
        (supabase as any).from("doctor_locations").select("id, name, address").eq("doctor_id", doctorId).eq("active", true).order("is_default", { ascending: false }).order("name"),
        (supabase as any).from("appointments").select("location_id").eq("id", appointmentId).maybeSingle(),
      ]);
      setLocs(l.data || []);
      setValue(a.data?.location_id || "");
    })();
  }, [appointmentId, doctorId]);

  if (!locs.length) return null;

  const change = async (v: string) => {
    const old = value;
    setValue(v);
    const { error } = await (supabase as any).from("appointments").update({ location_id: v || null }).eq("id", appointmentId);
    if (error) { setValue(old); toast({ title: "Could not change the location", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Location updated" });
  };
  const current = locs.find((l) => l.id === value);

  return (
    <Card>
      <CardContent className="space-y-1.5 p-4">
        <label htmlFor={`loc-${appointmentId}`} className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-primary" /> Location</label>
        <select id={`loc-${appointmentId}`} className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={value} onChange={(e) => change(e.target.value)}>
          <option value="">Not set</option>
          {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        {current?.address && <p className="text-xs text-muted-foreground">{current.address}</p>}
      </CardContent>
    </Card>
  );
}
