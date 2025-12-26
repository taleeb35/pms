-- Create referral partners table
CREATE TABLE public.referral_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC NOT NULL DEFAULT 20,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_partners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can signup as referral partner"
ON public.referral_partners
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all referral partners"
ON public.referral_partners
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update referral partners"
ON public.referral_partners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete referral partners"
ON public.referral_partners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add referral_code column to clinics table to track who referred them
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate a unique 8-character code
  new_code := UPPER(SUBSTRING(MD5(NEW.email || NOW()::TEXT) FROM 1 FOR 8));
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate referral code
CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON public.referral_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();