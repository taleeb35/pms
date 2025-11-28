-- Create clinics table
CREATE TABLE public.clinics (
  id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  clinic_name text NOT NULL,
  city text NOT NULL,
  phone_number text NOT NULL,
  address text NOT NULL,
  no_of_doctors integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on clinics table
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Clinics can view their own profile
CREATE POLICY "Clinics can view own profile"
ON public.clinics
FOR SELECT
USING (id = auth.uid());

-- Clinics can update their own profile
CREATE POLICY "Clinics can update own profile"
ON public.clinics
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Clinics can insert their own profile
CREATE POLICY "Clinics can insert own profile"
ON public.clinics
FOR INSERT
WITH CHECK (id = auth.uid());

-- Admins can manage all clinics
CREATE POLICY "Admins can manage clinics"
ON public.clinics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add clinic_id to doctors table to link doctors to clinics
ALTER TABLE public.doctors
ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL;

-- Update app_role enum to include clinic
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'clinic';

-- Create trigger for updated_at
CREATE TRIGGER update_clinics_updated_at
BEFORE UPDATE ON public.clinics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();