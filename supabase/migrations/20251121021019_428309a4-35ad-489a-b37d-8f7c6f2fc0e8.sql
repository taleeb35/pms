-- Add major_diseases column to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS major_diseases TEXT;

-- Add comment
COMMENT ON COLUMN public.patients.major_diseases IS 'Major diseases or chronic conditions of the patient';