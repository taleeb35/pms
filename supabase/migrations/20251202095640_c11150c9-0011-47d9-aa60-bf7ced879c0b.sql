-- Add CNIC field to patients table
ALTER TABLE public.patients
ADD COLUMN cnic text;