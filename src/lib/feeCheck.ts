import { supabase } from "@/integrations/supabase/client";

// B3: ask for confirmation when a consultation fee is far above the doctor's usual fee.
// Usual fee = the doctor's configured consultation fee, or else the median of their recent fees.
const FACTOR = 3;

async function usualFee(doctorId: string): Promise<number> {
  const { data: doc } = await supabase.from("doctors").select("consultation_fee").eq("id", doctorId).maybeSingle();
  if (doc?.consultation_fee && Number(doc.consultation_fee) > 0) return Number(doc.consultation_fee);
  const { data: recent } = await supabase
    .from("appointments")
    .select("consultation_fee")
    .eq("doctor_id", doctorId)
    .gt("consultation_fee", 0)
    .order("appointment_date", { ascending: false })
    .limit(30);
  const fees = (recent || []).map((r: any) => Number(r.consultation_fee)).filter((n) => n > 0).sort((a, b) => a - b);
  if (fees.length < 5) return 0;
  return fees[Math.floor(fees.length / 2)];
}

/** Returns true when it is fine to save (normal fee, or the user confirmed). */
export async function confirmUnusualFee(feeInput: string | number | null | undefined, doctorId?: string | null): Promise<boolean> {
  const fee = Number(feeInput || 0);
  if (!doctorId || !(fee > 0)) return true;
  try {
    const usual = await usualFee(doctorId);
    if (usual > 0 && fee > usual * FACTOR) {
      return window.confirm(
        `This consultation fee (${fee.toLocaleString()}) is more than ${FACTOR} times the usual fee (${usual.toLocaleString()}).\n\nSave it anyway?`
      );
    }
  } catch (e) {
    console.error("Fee check failed", e);
  }
  return true;
}
