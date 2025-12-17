-- Add confidential notes field for doctors only
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS confidential_notes text;