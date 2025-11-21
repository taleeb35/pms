-- Add father_name column to patients table
ALTER TABLE public.patients 
ADD COLUMN father_name TEXT;