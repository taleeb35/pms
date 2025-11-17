-- Add introduction field to doctors table
ALTER TABLE public.doctors 
ADD COLUMN introduction text;