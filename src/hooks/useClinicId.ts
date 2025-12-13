import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClinicId = () => {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [isReceptionist, setIsReceptionist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // First check if user is a clinic owner
        const { data: clinicData } = await supabase
          .from("clinics")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (clinicData) {
          setClinicId(clinicData.id);
          setIsReceptionist(false);
          setLoading(false);
          return;
        }

        // Check if user is a receptionist
        const { data: receptionistData } = await supabase
          .from("clinic_receptionists")
          .select("clinic_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (receptionistData) {
          setClinicId(receptionistData.clinic_id);
          setIsReceptionist(true);
        }
      } catch (error) {
        console.error("Error fetching clinic ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicId();
  }, []);

  return { clinicId, isReceptionist, loading };
};
