import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileFAB from "@/components/mobile/MobileFAB";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import { useMobileRole } from "@/hooks/useMobileRole";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, Mail, Phone, MapPin, ExternalLink, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DoctorRow {
  id: string;
  specialization: string;
  experience_years: number | null;
  consultation_fee: number | null;
  city: string | null;
  contact_number: string | null;
  profile: { full_name: string; email: string } | null;
}

const MobileDoctors = () => {
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<DoctorRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (roleLoading || !userId || role !== "clinic") {
      if (!roleLoading) setLoading(false);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, role]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: docs } = await supabase
        .from("doctors")
        .select("id, specialization, experience_years, consultation_fee, city, contact_number")
        .eq("clinic_id", userId)
        .order("created_at", { ascending: false });
      const enriched = await Promise.all(
        (docs ?? []).map(async (d) => {
          const { data: p } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", d.id)
            .maybeSingle();
          return { ...d, profile: p } as DoctorRow;
        })
      );
      setList(enriched);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "clinic" && !roleLoading) {
    return (
      <MobileScreen title="Doctors" back="/app/more">
        <MobileEmptyState
          icon={Stethoscope}
          title="Clinic owners only"
          description="Doctor management is available to clinic accounts."
        />
      </MobileScreen>
    );
  }

  const filtered = list.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (d.profile?.full_name ?? "").toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.city ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <MobileScreen
      title="Doctors"
      subtitle={`${list.length} doctor${list.length === 1 ? "" : "s"}`}
      back="/app/more"
      fab={
        <MobileFAB
          onClick={() => (window.location.href = "/clinic/doctors/add")}
          label="Add"
          ariaLabel="Add doctor"
        />
      }
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, specialty, city…"
          className="pl-10 h-11"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <MobileEmptyState
          icon={Stethoscope}
          title={list.length === 0 ? "No doctors yet" : "No matches"}
          description={list.length === 0 ? "Tap Add to onboard your first doctor." : "Try a different search term."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0">
                  {(d.profile?.full_name ?? "Dr").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">Dr. {d.profile?.full_name ?? "—"}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] h-4">{d.specialization}</Badge>
                    {d.experience_years != null && (
                      <span className="text-[11px] text-muted-foreground">{d.experience_years}y exp</span>
                    )}
                  </div>
                </div>
                {d.consultation_fee != null && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Fee</p>
                    <p className="font-bold text-sm">Rs {Number(d.consultation_fee).toLocaleString("en-PK")}</p>
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {d.profile?.email && (
                  <a href={`mailto:${d.profile.email}`} className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{d.profile.email}</span>
                  </a>
                )}
                {d.contact_number && (
                  <a href={`tel:${d.contact_number}`} className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{d.contact_number}</span>
                  </a>
                )}
                {d.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{d.city}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-5">
        <Link to="/clinic/doctors" className="inline-flex items-center gap-1 underline">
          Edit details on web <ExternalLink className="h-3 w-3" />
        </Link>
      </p>
    </MobileScreen>
  );
};

export default MobileDoctors;
