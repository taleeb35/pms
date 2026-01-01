-- Create referral_commissions table to track monthly earnings per referred entity
CREATE TABLE public.referral_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_partner_id UUID NOT NULL REFERENCES public.referral_partners(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  month DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  clinic_name TEXT,
  clinic_email TEXT,
  doctor_name TEXT,
  doctor_email TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('clinic', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referral_partner_id, clinic_id, month),
  UNIQUE(referral_partner_id, doctor_id, month)
);

-- Enable RLS
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all commissions
CREATE POLICY "Admins can manage all commissions"
ON public.referral_commissions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Referral partners can view their own commissions (need public select for dashboard)
CREATE POLICY "Anyone can view commissions"
ON public.referral_commissions
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_referral_commissions_updated_at
BEFORE UPDATE ON public.referral_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();