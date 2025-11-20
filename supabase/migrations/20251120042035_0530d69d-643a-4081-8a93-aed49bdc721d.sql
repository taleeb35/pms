-- Add marital_status field to patients table
ALTER TABLE public.patients
ADD COLUMN marital_status TEXT;