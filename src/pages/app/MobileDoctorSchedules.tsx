import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, CalendarClock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DoctorRow {
  id: string;
  specialization: string;
  available_days: string[] | null;
  available_hours: string | null;
  profiles?: { full_name: string } | null;
  schedules?: { day_of_week: number; is_available: boolean }[];
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MobileDoctorSchedules = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("doctors")
        .select("id, specialization, available_days, available_hours, profiles:id (full_name)")
        .eq("clinic_id", user.id)
        .eq("approved", true);

      const docs = (data ?? []) as any[];
      if (docs.length === 0) {
        setDoctors([]);
        return;
      }
      const ids = docs.map((d) => d.id);
      const { data: scheds } = await supabase
        .from("doctor_schedules")
        .select("doctor_id, day_of_week, is_available")
        .in("doctor_id", ids);
      const byDoc: Record<string, any[]> = {};
      (scheds ?? []).forEach((s: any) => {
        (byDoc[s.doctor_id] ??= []).push(s);
      });
      setDoctors(docs.map((d) => ({ ...d, schedules: byDoc[d.id] ?? [] })));
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (d.profiles?.full_name ?? "").toLowerCase().includes(q) ||
      (d.specialization ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <MobileScreen
      title="Doctor Schedules"
      subtitle={`${doctors.length} doctor${doctors.length === 1 ? "" : "s"}`}
      back="/app/more"
    >
      {doctors.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor or specialty…"
            className="pl-10 h-11"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <MobileEmptyState
          icon={CalendarClock}
          title={doctors.length === 0 ? "No doctors yet" : "No matches"}
          description={
            doctors.length === 0
              ? "Add doctors from the Doctors module to manage their schedules."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => {
            const activeDays = new Set(
              (d.schedules ?? []).filter((s) => s.is_available).map((s) => s.day_of_week)
            );
            return (
              <div
                key={d.id}
                className="rounded-xl bg-card border border-border/60 p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold truncate">
                      Dr. {d.profiles?.full_name ?? "—"}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.specialization}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(`/clinic/doctor-schedules?doctor=${d.id}`, "_blank")
                    }
                    className="text-primary text-xs font-semibold flex items-center gap-1 active:scale-95"
                  >
                    Edit <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {DAYS_SHORT.map((label, idx) => {
                    const active = activeDays.has(idx);
                    return (
                      <div
                        key={idx}
                        className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-medium ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
                {d.available_hours && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {d.available_hours}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MobileScreen>
  );
};

export default MobileDoctorSchedules;
