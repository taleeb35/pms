-- Add fee tracking fields to appointments table
ALTER TABLE public.appointments
ADD COLUMN consultation_fee numeric DEFAULT 0,
ADD COLUMN other_fee numeric DEFAULT 0,
ADD COLUMN total_fee numeric GENERATED ALWAYS AS (COALESCE(consultation_fee, 0) + COALESCE(other_fee, 0)) STORED;

-- Add index for better query performance on fee calculations
CREATE INDEX idx_appointments_fees ON public.appointments(doctor_id, consultation_fee, other_fee) WHERE status = 'completed';