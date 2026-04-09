-- Add delivery_status column to patients table
ALTER TABLE public.patients 
ADD COLUMN delivery_status text DEFAULT 'active' CHECK (delivery_status IN ('active', 'completed'));