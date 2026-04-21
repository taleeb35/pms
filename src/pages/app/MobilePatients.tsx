import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";

const MobilePatients = () => {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("patients")
        .select("id, full_name, phone, gender, patient_id")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = items.filter((p) =>
    !q || p.full_name?.toLowerCase().includes(q.toLowerCase()) || p.phone?.includes(q)
  );

  return (
    <MobileAppShell title="Patients">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or phone"
          className="pl-9 h-11 rounded-xl bg-muted/50 border-0"
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12">No patients found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="p-3 flex items-center gap-3 border-border/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{p.full_name}</div>
                <div className="text-xs text-muted-foreground">{p.phone} · {p.gender}</div>
              </div>
              <span className="text-[10px] text-muted-foreground">#{p.patient_id}</span>
            </Card>
          ))}
        </div>
      )}
    </MobileAppShell>
  );
};

export default MobilePatients;
