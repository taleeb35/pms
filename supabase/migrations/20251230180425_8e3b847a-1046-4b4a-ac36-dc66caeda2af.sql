-- Add payment_plan column to clinics table
ALTER TABLE public.clinics 
ADD COLUMN payment_plan text NOT NULL DEFAULT 'monthly' 
CHECK (payment_plan IN ('monthly', 'yearly'));

-- Add payment_plan column to doctors table
ALTER TABLE public.doctors 
ADD COLUMN payment_plan text NOT NULL DEFAULT 'monthly' 
CHECK (payment_plan IN ('monthly', 'yearly'));

-- Add comment for documentation
COMMENT ON COLUMN public.clinics.payment_plan IS 'Billing preference: monthly or yearly (17% discount)';
COMMENT ON COLUMN public.doctors.payment_plan IS 'Billing preference: monthly or yearly (17% discount)';