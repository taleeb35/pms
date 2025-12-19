-- Add pain_scale column to visit_records table
ALTER TABLE public.visit_records 
ADD COLUMN pain_scale integer DEFAULT NULL CHECK (pain_scale >= 1 AND pain_scale <= 10);