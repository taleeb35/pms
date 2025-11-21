-- Add city column to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS city text;