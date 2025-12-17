-- Create ICD codes table for clinics
CREATE TABLE public.clinic_icd_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_icd_codes ENABLE ROW LEVEL SECURITY;

-- Clinics can manage own ICD codes
CREATE POLICY "Clinics can view own ICD codes"
ON public.clinic_icd_codes FOR SELECT
USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can insert own ICD codes"
ON public.clinic_icd_codes FOR INSERT
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Clinics can update own ICD codes"
ON public.clinic_icd_codes FOR UPDATE
USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can delete own ICD codes"
ON public.clinic_icd_codes FOR DELETE
USING (clinic_id = auth.uid());

-- Doctors can manage ICD codes for their clinic
CREATE POLICY "Doctors can view their clinic ICD codes"
ON public.clinic_icd_codes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM doctors
  WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_icd_codes.clinic_id
));

CREATE POLICY "Doctors can insert ICD codes for their clinic"
ON public.clinic_icd_codes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM doctors
  WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_icd_codes.clinic_id
));

CREATE POLICY "Doctors can update ICD codes for their clinic"
ON public.clinic_icd_codes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM doctors
  WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_icd_codes.clinic_id
));

CREATE POLICY "Doctors can delete ICD codes for their clinic"
ON public.clinic_icd_codes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM doctors
  WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_icd_codes.clinic_id
));

-- Receptionists can manage ICD codes for their clinic
CREATE POLICY "Receptionists can view clinic ICD codes"
ON public.clinic_icd_codes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_icd_codes.clinic_id
));

CREATE POLICY "Receptionists can insert clinic ICD codes"
ON public.clinic_icd_codes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_icd_codes.clinic_id
));

CREATE POLICY "Receptionists can update clinic ICD codes"
ON public.clinic_icd_codes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_icd_codes.clinic_id
));

CREATE POLICY "Receptionists can delete clinic ICD codes"
ON public.clinic_icd_codes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_icd_codes.clinic_id
));

-- Add ICD code column to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS icd_code_id uuid REFERENCES public.clinic_icd_codes(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_clinic_icd_codes_clinic_id ON public.clinic_icd_codes(clinic_id);