-- Add status column to clinics table
ALTER TABLE public.clinics 
ADD COLUMN status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended'));

-- Create index for faster queries
CREATE INDEX idx_clinics_status ON public.clinics(status);

-- Update RLS policies to restrict draft clinics
DROP POLICY IF EXISTS "Clinics can view own profile" ON public.clinics;
CREATE POLICY "Active clinics can view own profile" 
ON public.clinics 
FOR SELECT 
USING (id = auth.uid() AND status = 'active');

-- Update insert policy to set draft status
DROP POLICY IF EXISTS "Clinics can insert own profile" ON public.clinics;
CREATE POLICY "Clinics can insert own profile" 
ON public.clinics 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Admins can view all clinics
CREATE POLICY "Admins can view all clinics" 
ON public.clinics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update clinic status
DROP POLICY IF EXISTS "Admins can manage clinics" ON public.clinics;
CREATE POLICY "Admins can update clinics" 
ON public.clinics 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to check if clinic is active
CREATE OR REPLACE FUNCTION public.is_clinic_active(_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinics
    WHERE id = _clinic_id
      AND status = 'active'
  )
$$;

-- Update doctors table RLS to only allow active clinics to add doctors
DROP POLICY IF EXISTS "Users can create own doctor profile" ON public.doctors;
CREATE POLICY "Users can create own doctor profile" 
ON public.doctors 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  (clinic_id IS NOT NULL AND is_clinic_active(clinic_id))
);