ALTER TABLE public.doctors 
  ADD COLUMN IF NOT EXISTS clinic_address text,
  ADD COLUMN IF NOT EXISTS clinic_map_location text;