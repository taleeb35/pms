-- Add clinic_percentage column to doctors table
-- This stores the percentage of earnings that goes to the clinic
ALTER TABLE public.doctors
ADD COLUMN clinic_percentage numeric DEFAULT 0 CHECK (clinic_percentage >= 0 AND clinic_percentage <= 100);