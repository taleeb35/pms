-- Add requested_doctors column to clinics table
ALTER TABLE public.clinics 
ADD COLUMN requested_doctors integer DEFAULT 0 NOT NULL;