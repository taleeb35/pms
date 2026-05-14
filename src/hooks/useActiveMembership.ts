import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveMembership {
  membership_id: string;
  clinic_id: string;
  plan_id: string;
  plan_name: string;
  card_number: string;
  start_date: string;
  end_date: string;
  color: string;
  consultation_discount_pct: number;
  procedure_discount_pct: number;
  pharmacy_discount_pct: number;
}

export const useActiveMembership = (patientId: string | null | undefined) => {
  const [membership, setMembership] = useState<ActiveMembership | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!patientId) {
      setMembership(null);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("get_active_patient_membership", { _patient_id: patientId });
    if (!error && data && (data as any[]).length > 0) {
      const row = (data as any[])[0];
      setMembership({
        ...row,
        consultation_discount_pct: Number(row.consultation_discount_pct),
        procedure_discount_pct: Number(row.procedure_discount_pct),
        pharmacy_discount_pct: Number(row.pharmacy_discount_pct),
      });
    } else {
      setMembership(null);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { membership, loading, refetch: fetch };
};
