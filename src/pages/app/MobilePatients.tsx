import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User } from "lucide-react";
import { subDays, isAfter, startOfDay } from "date-fns";

type GenderFilter = "all" | "male" | "female" | "other";
type RecencyFilter = "all" | "7" | "30" | "90";

const MobilePatients = () => {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [recency, setRecency] = useState<RecencyFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("patients")
        .select("id, full_name, phone, gender, patient_id, created_at, city")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(300);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    return items.filter((p) => {
      if (gender !== "all" && p.gender !== gender) return false;
      if (recency !== "all") {
        const days = parseInt(recency);
        if (!p.created_at || !isAfter(new Date(p.created_at), subDays(today, days))) return false;
      }
      if (q) {
        const s = q.toLowerCase();
        const matches =
          p.full_name?.toLowerCase().includes(s) ||
          p.phone?.includes(s) ||
          p.patient_id?.toLowerCase().includes(s) ||
          p.city?.toLowerCase().includes(s);
        if (!matches) return false;
      }
      return true;
    });
  }, [items, q, gender, recency]);

  return (
    <MobileAppShell title="Patients">
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, ID, city"
            className="pl-9 h-11 rounded-xl bg-muted/50 border-0"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={gender} onValueChange={(v) => setGender(v as GenderFilter)}>
            <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-0 text-sm">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={recency} onValueChange={(v) => setRecency(v as RecencyFilter)}>
            <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-0 text-sm">
              <SelectValue placeholder="Added" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-[11px] text-muted-foreground px-1">
          Showing {filtered.length} of {items.length}
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12">No patients match</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="p-3 flex items-center gap-3 border-border/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{p.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.phone} · {p.gender}{p.city ? ` · ${p.city}` : ""}
                </div>
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
