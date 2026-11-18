import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// The doctors the signed-in person works for, based on the portal they are in:
// a doctor (themself), a clinic (its doctors), a clinic receptionist (the clinic's doctors)
// or a doctor's receptionist (that doctor). `base` is the portal path, e.g. "/clinic".
export type CareDoctor = { id: string; name: string };

export function portalBase(pathname: string) {
  return ["/doctor-receptionist", "/doctor", "/clinic", "/receptionist"].find((b) => pathname === b || pathname.startsWith(`${b}/`)) || "/doctor";
}

export function useCareDoctors() {
  const { pathname } = useLocation();
  const base = portalBase(pathname);
  const [doctors, setDoctors] = useState<CareDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      let ids: string[] = [];
      let clinicId: string | null = null;
      if (base === "/doctor") ids = [user.id];
      else if (base === "/clinic") clinicId = user.id;
      else if (base === "/receptionist") {
        const { data } = await supabase.rpc("get_receptionist_clinic_id" as any, { _user_id: user.id });
        clinicId = (data as string) || null;
      } else {
        const { data } = await supabase.rpc("get_doctor_receptionist_doctor_id" as any, { _user_id: user.id });
        if (data) ids = [data as string];
      }
      let q = supabase.from("doctors").select("id, profiles(full_name)");
      q = clinicId ? q.eq("clinic_id", clinicId) : q.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const { data } = await q;
      if (!alive) return;
      setDoctors(((data || []) as any[]).map((d) => ({ id: d.id, name: d.profiles?.full_name || "Doctor" })));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [base]);

  return { base, doctors, loading };
}
