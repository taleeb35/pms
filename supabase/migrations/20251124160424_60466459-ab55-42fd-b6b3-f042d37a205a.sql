-- Add pregnancy start date field to patients table for gynecologist tracking
ALTER TABLE public.patients
ADD COLUMN pregnancy_start_date date;