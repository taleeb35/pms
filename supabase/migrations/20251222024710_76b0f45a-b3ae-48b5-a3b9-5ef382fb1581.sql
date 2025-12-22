-- Add eye vision fields to visit_records table for ophthalmologists
ALTER TABLE public.visit_records 
ADD COLUMN IF NOT EXISTS right_eye_vision TEXT,
ADD COLUMN IF NOT EXISTS left_eye_vision TEXT;