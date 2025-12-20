-- Add PMDC number field to doctors table
ALTER TABLE public.doctors 
ADD COLUMN pmdc_number text;