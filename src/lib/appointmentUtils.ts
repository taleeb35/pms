import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a time slot is already booked for a doctor
 * @param doctorId - The doctor's ID
 * @param date - The appointment date (YYYY-MM-DD format)
 * @param time - The appointment time (HH:MM format)
 * @param excludeAppointmentId - Optional appointment ID to exclude (for edit scenarios)
 * @returns true if the slot is available, false if already booked
 */
export const isTimeSlotAvailable = async (
  doctorId: string,
  date: string,
  time: string,
  excludeAppointmentId?: string
): Promise<{ available: boolean; error?: string }> => {
  try {
    let query = supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .eq("appointment_time", time)
      .neq("status", "cancelled"); // Don't count cancelled appointments

    if (excludeAppointmentId) {
      query = query.neq("id", excludeAppointmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking time slot:", error);
      return { available: false, error: error.message };
    }

    return { available: !data || data.length === 0 };
  } catch (error: any) {
    console.error("Error checking time slot:", error);
    return { available: false, error: error.message };
  }
};
