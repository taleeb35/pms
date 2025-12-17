-- Add status column to clinic_receptionists table
ALTER TABLE public.clinic_receptionists 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add constraint to ensure valid status values
ALTER TABLE public.clinic_receptionists 
ADD CONSTRAINT clinic_receptionists_status_check 
CHECK (status IN ('active', 'draft'));