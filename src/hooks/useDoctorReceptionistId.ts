import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDoctorReceptionistId = () => {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("doctor_receptionists")
          .select("doctor_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (!error && data) {
          setDoctorId(data.doctor_id);
        }
      } catch (error) {
        console.error("Error fetching doctor ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorId();
  }, []);

  return { doctorId, loading };
};
