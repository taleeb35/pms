-- Create a table to link receptionists to clinics
CREATE TABLE public.clinic_receptionists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.clinic_receptionists ENABLE ROW LEVEL SECURITY;

-- Clinic owners can manage their own receptionists
CREATE POLICY "Clinics can view own receptionists"
ON public.clinic_receptionists FOR SELECT
USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can insert own receptionists"
ON public.clinic_receptionists FOR INSERT
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Clinics can delete own receptionists"
ON public.clinic_receptionists FOR DELETE
USING (clinic_id = auth.uid());

-- Receptionists can view their own record
CREATE POLICY "Receptionists can view own record"
ON public.clinic_receptionists FOR SELECT
USING (user_id = auth.uid());

-- Admins can manage all receptionists
CREATE POLICY "Admins can manage receptionists"
ON public.clinic_receptionists FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for patients to allow receptionists
CREATE POLICY "Receptionists can view clinic patients"
ON public.patients FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = patients.created_by
));

CREATE POLICY "Receptionists can insert clinic patients"
ON public.patients FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = patients.created_by
));

CREATE POLICY "Receptionists can update clinic patients"
ON public.patients FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = patients.created_by
));

-- Update RLS policies for appointments to allow receptionists
CREATE POLICY "Receptionists can view clinic appointments"
ON public.appointments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = appointments.doctor_id
));

CREATE POLICY "Receptionists can create clinic appointments"
ON public.appointments FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = appointments.doctor_id
));

CREATE POLICY "Receptionists can update clinic appointments"
ON public.appointments FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = appointments.doctor_id
));

CREATE POLICY "Receptionists can delete clinic appointments"
ON public.appointments FOR DELETE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = appointments.doctor_id
));

-- Update RLS policies for visit_records to allow receptionists
CREATE POLICY "Receptionists can view clinic visit records"
ON public.visit_records FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = visit_records.doctor_id
));

CREATE POLICY "Receptionists can create clinic visit records"
ON public.visit_records FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = visit_records.doctor_id
));

CREATE POLICY "Receptionists can update clinic visit records"
ON public.visit_records FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = visit_records.doctor_id
));

-- Receptionists can view doctors in their clinic
CREATE POLICY "Receptionists can view clinic doctors"
ON public.doctors FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = doctors.clinic_id
));

-- Receptionists can view their clinic info
CREATE POLICY "Receptionists can view own clinic"
ON public.clinics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinics.id
));

-- Receptionists can view profiles of doctors in their clinic
CREATE POLICY "Receptionists can view clinic doctors profiles"
ON public.profiles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = profiles.id
));

-- Receptionists can view clinic allergies
CREATE POLICY "Receptionists can view clinic allergies"
ON public.clinic_allergies FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_allergies.clinic_id
));

-- Receptionists can view clinic diseases  
CREATE POLICY "Receptionists can view clinic diseases"
ON public.clinic_diseases FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_diseases.clinic_id
));

-- Receptionists can view procedures for doctors in their clinic
CREATE POLICY "Receptionists can view clinic procedures"
ON public.procedures FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = procedures.doctor_id
));