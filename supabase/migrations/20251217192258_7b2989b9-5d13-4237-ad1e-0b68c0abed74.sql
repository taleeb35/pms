-- Add appointment_type column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN appointment_type text DEFAULT 'new';

-- Add a comment for documentation
COMMENT ON COLUMN public.appointments.appointment_type IS 'Type of appointment: new, follow_up, report_check';