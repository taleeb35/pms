import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "doctor" | "clinic" | null;

export interface MobileUser {
  id: string;
  role: AppRole;
  name: string;
  loading: boolean;
}

/**
 * Resolves the current mobile-app user's role (doctor or clinic).
 * Cached on window to avoid re-querying on every page navigation.
 */
const cache: { value?: { id: string; role: AppRole; name: string } } = {};

export function useMobileRole(): MobileUser {
  const [user, setUser] = useState<MobileUser>({
    id: cache.value?.id ?? "",
    role: cache.value?.role ?? null,
    name: cache.value?.name ?? "",
    loading: !cache.value,
  });

  useEffect(() => {
    if (cache.value) return;
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) setUser((u) => ({ ...u, loading: false }));
        return;
      }
      const userId = session.user.id;
      const [clinicRes, doctorRes, profileRes] = await Promise.all([
        supabase.from("clinics").select("id").eq("id", userId).maybeSingle(),
        supabase.from("doctors").select("id").eq("id", userId).maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      ]);
      if (!active) return;
      const role: AppRole = clinicRes.data ? "clinic" : doctorRes.data ? "doctor" : "doctor";
      const name = profileRes.data?.full_name ?? "";
      cache.value = { id: userId, role, name };
      setUser({ id: userId, role, name, loading: false });
    })();
    return () => { active = false; };
  }, []);

  return user;
}
