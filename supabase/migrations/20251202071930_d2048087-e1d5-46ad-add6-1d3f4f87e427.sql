-- Add fee_status column to clinics table
ALTER TABLE public.clinics 
ADD COLUMN fee_status text NOT NULL DEFAULT 'unpaid';

-- Add a check constraint to ensure valid values
ALTER TABLE public.clinics 
ADD CONSTRAINT clinics_fee_status_check 
CHECK (fee_status IN ('paid', 'unpaid'));