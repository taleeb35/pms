-- Create specializations table for clinic-managed doctor specializations
CREATE TABLE public.specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, name)
);

-- Enable RLS
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;

-- Clinic owners can manage their own specializations
CREATE POLICY "Clinics can view own specializations"
ON public.specializations
FOR SELECT
USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can insert own specializations"
ON public.specializations
FOR INSERT
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Clinics can update own specializations"
ON public.specializations
FOR UPDATE
USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can delete own specializations"
ON public.specializations
FOR DELETE
USING (clinic_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_specializations_updated_at
BEFORE UPDATE ON public.specializations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();