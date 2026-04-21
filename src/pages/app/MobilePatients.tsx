import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import MobileFAB from "@/components/mobile/MobileFAB";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, SlidersHorizontal, X, ChevronRight, Phone, MapPin, Users } from "lucide-react";
import { CitySelect } from "@/components/CitySelect";
import { calculatePregnancyWeeks } from "@/lib/pregnancyUtils";
import { useMobileRole } from "@/hooks/useMobileRole";

const calcAge = (dob: string) => {
  const b = new Date(dob);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

const MobilePatients = () => {
  const navigate = useNavigate();
  const { id: userId, role } = useMobileRole();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGynecologist, setIsGynecologist] = useState(false);

  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [age, setAge] = useState("all");
  const [city, setCity] = useState("all");
  const [trimester, setTrimester] = useState("all");
  const [delivery, setDelivery] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!userId || !role) return;
    const load = async () => {
      setLoading(true);

      if (role === "doctor") {
        const { data: doc } = await supabase
          .from("doctors")
          .select("specialization")
          .eq("id", userId)
          .maybeSingle();
        setIsGynecologist(!!doc?.specialization?.toLowerCase().includes("gynecologist"));

        const { data } = await supabase
          .from("patients")
          .select("id, full_name, phone, gender, patient_id, created_at, city, date_of_birth, pregnancy_start_date, delivery_status")
          .eq("created_by", userId)
          .order("created_at", { ascending: false })
          .limit(500);
        setItems(data || []);
      } else {
        // Clinic owner — fetch all patients created by clinic's doctors + clinic itself
        const { data: docs } = await supabase
          .from("doctors")
          .select("id")
          .eq("clinic_id", userId);
        const ids = [userId, ...(docs?.map((d) => d.id) || [])];
        const { data } = await supabase
          .from("patients")
          .select("id, full_name, phone, gender, patient_id, created_at, city, date_of_birth, pregnancy_start_date, delivery_status, created_by")
          .in("created_by", ids)
          .order("created_at", { ascending: false })
          .limit(500);
        setItems(data || []);
      }
      setLoading(false);
    };
    load();
  }, [userId, role]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (q) {
        const s = q.toLowerCase();
        const hit =
          p.full_name?.toLowerCase().includes(s) ||
          p.phone?.includes(s) ||
          p.patient_id?.toLowerCase().includes(s) ||
          p.city?.toLowerCase().includes(s);
        if (!hit) return false;
      }
      if (gender !== "all" && p.gender !== gender) return false;
      if (city !== "all" && p.city !== city) return false;

      if (age !== "all" && p.date_of_birth) {
        const a = calcAge(p.date_of_birth);
        if (age === "0-18" && a > 18) return false;
        if (age === "19-40" && (a < 19 || a > 40)) return false;
        if (age === "41-60" && (a < 41 || a > 60)) return false;
        if (age === "60+" && a <= 60) return false;
      }

      if (isGynecologist) {
        if (trimester !== "all") {
          if (!p.pregnancy_start_date) return false;
          const w = calculatePregnancyWeeks(p.pregnancy_start_date);
          if (w === null) return false;
          if (trimester === "1" && w > 12) return false;
          if (trimester === "2" && (w < 13 || w > 27)) return false;
          if (trimester === "3" && w < 28) return false;
        }
        if (delivery !== "all") {
          if (delivery === "no_pregnancy" && p.pregnancy_start_date) return false;
          if (delivery === "delivery_completed" && p.delivery_status !== "completed") return false;
          if (delivery === "active" && (!p.pregnancy_start_date || p.delivery_status === "completed")) return false;
        }
      }
      return true;
    });
  }, [items, q, gender, age, city, trimester, delivery, isGynecologist]);

  const activeFilters = [
    gender !== "all" && { key: "gender", label: `Gender: ${gender}`, clear: () => setGender("all") },
    age !== "all" && { key: "age", label: `Age: ${age}`, clear: () => setAge("all") },
    city !== "all" && { key: "city", label: `City: ${city}`, clear: () => setCity("all") },
    trimester !== "all" && isGynecologist && { key: "tri", label: `Trimester: ${trimester}`, clear: () => setTrimester("all") },
    delivery !== "all" && isGynecologist && { key: "del", label: `Delivery: ${delivery.replace("_", " ")}`, clear: () => setDelivery("all") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const resetAll = () => {
    setGender("all"); setAge("all"); setCity("all");
    setTrimester("all"); setDelivery("all");
  };

  return (
    <MobileAppShell title="Patients">
      <div className="space-y-2 mb-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, ID"
              className="pl-9 h-11 rounded-xl bg-muted/50 border-0"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl relative shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter patients</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gender</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Age</label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ages</SelectItem>
                      <SelectItem value="0-18">0-18 years</SelectItem>
                      <SelectItem value="19-40">19-40 years</SelectItem>
                      <SelectItem value="41-60">41-60 years</SelectItem>
                      <SelectItem value="60+">60+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                  <CitySelect value={city === "all" ? "" : city} onValueChange={(v) => setCity(v || "all")} />
                </div>
                {isGynecologist && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Trimester</label>
                      <Select value={trimester} onValueChange={setTrimester}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="1">1st (0-12 wk)</SelectItem>
                          <SelectItem value="2">2nd (13-27 wk)</SelectItem>
                          <SelectItem value="3">3rd (28+ wk)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Delivery</label>
                      <Select value={delivery} onValueChange={setDelivery}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Currently pregnant</SelectItem>
                          <SelectItem value="delivery_completed">Delivery completed</SelectItem>
                          <SelectItem value="no_pregnancy">No pregnancy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={resetAll}>Reset</Button>
                  <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                    Show {filtered.length}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={f.clear}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium active:scale-95 transition-transform"
              >
                {f.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground px-1">
          Showing {filtered.length} of {items.length}
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <MobileEmptyState
          icon={Users}
          title={items.length === 0 ? "No patients yet" : "No patients match"}
          description={items.length === 0 ? "Tap the + button to register your first patient." : "Try adjusting your filters."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const a = p.date_of_birth ? calcAge(p.date_of_birth) : null;
            return (
              <Card
                key={p.id}
                onClick={() => navigate(`/app/patients/${p.id}`)}
                className="p-3 flex items-center gap-3 border-border/50 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm truncate">{p.full_name}</div>
                    {a !== null && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{a}y</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 truncate">
                    <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{p.phone}</span>
                    {p.city && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.city}</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                    {p.gender} · #{p.patient_id}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Card>
            );
          })}
        </div>
      )}

      <MobileFAB onClick={() => navigate("/app/walk-in")} ariaLabel="Add patient" />
    </MobileAppShell>
  );
};

export default MobilePatients;
