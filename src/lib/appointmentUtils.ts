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

/**
 * Check if a doctor is on leave for a specific date
 * @param doctorId - The doctor's ID
 * @param date - The date to check (YYYY-MM-DD format)
 * @returns Leave info if on leave, null otherwise
 */
export const checkDoctorLeave = async (
  doctorId: string,
  date: string
): Promise<{ onLeave: boolean; leaveType?: string; reason?: string }> => {
  try {
    const { data, error } = await supabase
      .from("doctor_leaves")
      .select("leave_type, reason")
      .eq("doctor_id", doctorId)
      .eq("leave_date", date)
      .maybeSingle();

    if (error) {
      console.error("Error checking doctor leave:", error);
      return { onLeave: false };
    }

    if (data) {
      return { 
        onLeave: true, 
        leaveType: data.leave_type, 
        reason: data.reason || undefined 
      };
    }

    return { onLeave: false };
  } catch (error: any) {
    console.error("Error checking doctor leave:", error);
    return { onLeave: false };
  }
};

/**
 * Get doctor's schedule for a specific day of week
 * @param doctorId - The doctor's ID
 * @param dayOfWeek - Day of week (0=Sunday, 6=Saturday)
 * @returns Schedule info or null
 */
export const getDoctorScheduleForDay = async (
  doctorId: string,
  dayOfWeek: number
): Promise<{
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from("doctor_schedules")
      .select("is_available, start_time, end_time, break_start, break_end")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (error) {
      console.error("Error fetching doctor schedule:", error);
      return null;
    }

    if (data) {
      return {
        isAvailable: data.is_available,
        startTime: data.start_time || undefined,
        endTime: data.end_time || undefined,
        breakStart: data.break_start || undefined,
        breakEnd: data.break_end || undefined,
      };
    }

    return null;
  } catch (error: any) {
    console.error("Error fetching doctor schedule:", error);
    return null;
  }
};

/**
 * Generate available time slots based on doctor's schedule and leave status
 * @param doctorId - The doctor's ID
 * @param date - The date to get slots for (YYYY-MM-DD format)
 * @returns Array of available time slots
 */
export const getAvailableTimeSlots = async (
  doctorId: string,
  date: string
): Promise<{ value: string; label: string; disabled?: boolean }[]> => {
  try {
    // Check if doctor is on leave
    const leaveInfo = await checkDoctorLeave(doctorId, date);
    
    if (leaveInfo.onLeave && leaveInfo.leaveType === "full_day") {
      return []; // Doctor is on full day leave
    }

    // Get day of week (0=Sunday)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Get doctor's schedule for this day
    const schedule = await getDoctorScheduleForDay(doctorId, dayOfWeek);

    // Generate all 30-minute slots
    const allSlots: { value: string; label: string }[] = [];
    for (let i = 0; i < 48; i++) {
      const hours = Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      const time24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const time12 = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
      allSlots.push({ value: time24, label: time12 });
    }

    // If no schedule is set, return all slots (default behavior)
    if (!schedule) {
      return allSlots;
    }

    // If doctor is marked unavailable for this day
    if (!schedule.isAvailable) {
      return [];
    }

    // Filter slots based on schedule
    const filteredSlots = allSlots.filter(slot => {
      const slotTime = slot.value;

      // Check if within working hours
      if (schedule.startTime && schedule.endTime) {
        if (slotTime < schedule.startTime || slotTime >= schedule.endTime) {
          return false;
        }
      }

      // Check if during break time
      if (schedule.breakStart && schedule.breakEnd) {
        if (slotTime >= schedule.breakStart && slotTime < schedule.breakEnd) {
          return false;
        }
      }

      // Handle half-day leave
      if (leaveInfo.onLeave) {
        if (leaveInfo.leaveType === "half_day_morning") {
          // Exclude morning slots (before 12:00)
          if (slotTime < "12:00") return false;
        } else if (leaveInfo.leaveType === "half_day_evening") {
          // Exclude evening slots (12:00 and after)
          if (slotTime >= "12:00") return false;
        }
      }

      return true;
    });

    return filteredSlots;
  } catch (error: any) {
    console.error("Error generating time slots:", error);
    // Return all slots as fallback
    const allSlots: { value: string; label: string }[] = [];
    for (let i = 0; i < 48; i++) {
      const hours = Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      const time24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const time12 = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
      allSlots.push({ value: time24, label: time12 });
    }
    return allSlots;
  }
};
