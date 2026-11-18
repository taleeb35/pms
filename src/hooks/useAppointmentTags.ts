import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import type { TagExtras, TagKey } from "@/lib/appointmentTags";

// Loads the tags that live in other tables (intake forms, lab orders, insurance claims) for these doctors.
export function useAppointmentTags(doctorIds: string[], refreshKey: unknown = 0): TagExtras {
  const [extras, setExtras] = useState<TagExtras>(new Map());
  const key = [...doctorIds].sort().join(",");

  useEffect(() => {
    if (!key) { setExtras(new Map()); return; }
    let alive = true;
    const ids = key.split(",");
    (async () => {
      const db = supabase as any;
      const [intake, labs, claims] = await Promise.all([
        fetchAllRows<any>(() => db.from("intake_forms").select("id, appointment_id, status").in("doctor_id", ids).neq("status", "cancelled")),
        fetchAllRows<any>(() => db.from("lab_orders").select("id, appointment_id").in("doctor_id", ids)),
        fetchAllRows<any>(() => db.from("insurance_claims").select("id, appointment_id").in("doctor_id", ids)),
      ]);
      const map: TagExtras = new Map();
      const add = (apptId: string | null | undefined, tag: TagKey) => {
        if (!apptId) return;
        if (!map.has(apptId)) map.set(apptId, new Set());
        map.get(apptId)!.add(tag);
      };
      (intake.data || []).forEach((r) => add(r.appointment_id, r.status === "completed" ? "intake_signed" : "intake_sent"));
      (labs.data || []).forEach((r) => add(r.appointment_id, "lab_ordered"));
      (claims.data || []).forEach((r) => add(r.appointment_id, "insurance_claim"));
      if (alive) setExtras(map);
    })();
    return () => { alive = false; };
  }, [key, refreshKey]);

  return extras;
}
