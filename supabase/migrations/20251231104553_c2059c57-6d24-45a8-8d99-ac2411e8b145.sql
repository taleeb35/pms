-- Add function to check if user is a receptionist for a specific doctor
CREATE OR REPLACE FUNCTION public.is_doctor_receptionist(_user_id uuid, _doctor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.doctor_receptionists
    WHERE user_id = _user_id
      AND doctor_id = _doctor_id
      AND status = 'active'
  )
$$;

-- Add RLS policies for doctor's receptionists to manage patients

-- Patients: Doctor's receptionists can view patients created by their doctor
CREATE POLICY "Doctor receptionists can view doctor patients"
ON public.patients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = patients.created_by
      AND dr.status = 'active'
  )
);

-- Patients: Doctor's receptionists can insert patients for their doctor
CREATE POLICY "Doctor receptionists can insert doctor patients"
ON public.patients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = patients.created_by
      AND dr.status = 'active'
  )
);

-- Patients: Doctor's receptionists can update patients for their doctor
CREATE POLICY "Doctor receptionists can update doctor patients"
ON public.patients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = patients.created_by
      AND dr.status = 'active'
  )
);

-- Appointments: Doctor's receptionists can view appointments
CREATE POLICY "Doctor receptionists can view doctor appointments"
ON public.appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = appointments.doctor_id
      AND dr.status = 'active'
  )
);

-- Appointments: Doctor's receptionists can create appointments
CREATE POLICY "Doctor receptionists can create doctor appointments"
ON public.appointments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = appointments.doctor_id
      AND dr.status = 'active'
  )
);

-- Appointments: Doctor's receptionists can update appointments
CREATE POLICY "Doctor receptionists can update doctor appointments"
ON public.appointments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = appointments.doctor_id
      AND dr.status = 'active'
  )
);

-- Appointments: Doctor's receptionists can delete appointments
CREATE POLICY "Doctor receptionists can delete doctor appointments"
ON public.appointments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = appointments.doctor_id
      AND dr.status = 'active'
  )
);

-- Visit records: Doctor's receptionists can view
CREATE POLICY "Doctor receptionists can view doctor visit records"
ON public.visit_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = visit_records.doctor_id
      AND dr.status = 'active'
  )
);

-- Visit records: Doctor's receptionists can create
CREATE POLICY "Doctor receptionists can create doctor visit records"
ON public.visit_records
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = visit_records.doctor_id
      AND dr.status = 'active'
  )
);

-- Visit records: Doctor's receptionists can update
CREATE POLICY "Doctor receptionists can update doctor visit records"
ON public.visit_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = visit_records.doctor_id
      AND dr.status = 'active'
  )
);

-- Wait list: Doctor's receptionists can manage
CREATE POLICY "Doctor receptionists can view doctor wait list"
ON public.wait_list
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = wait_list.doctor_id
      AND dr.status = 'active'
  )
);

CREATE POLICY "Doctor receptionists can insert doctor wait list"
ON public.wait_list
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = wait_list.doctor_id
      AND dr.status = 'active'
  )
);

CREATE POLICY "Doctor receptionists can update doctor wait list"
ON public.wait_list
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = wait_list.doctor_id
      AND dr.status = 'active'
  )
);

CREATE POLICY "Doctor receptionists can delete doctor wait list"
ON public.wait_list
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = wait_list.doctor_id
      AND dr.status = 'active'
  )
);

-- Doctor schedules: Doctor's receptionists can view
CREATE POLICY "Doctor receptionists can view doctor schedules"
ON public.doctor_schedules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = doctor_schedules.doctor_id
      AND dr.status = 'active'
  )
);

-- Medical documents: Doctor's receptionists can view
CREATE POLICY "Doctor receptionists can view doctor patient documents"
ON public.medical_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    JOIN public.patients p ON p.created_by = dr.doctor_id
    WHERE dr.user_id = auth.uid()
      AND p.id = medical_documents.patient_id
      AND dr.status = 'active'
  )
);

-- Medical documents: Doctor's receptionists can insert
CREATE POLICY "Doctor receptionists can insert doctor patient documents"
ON public.medical_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    JOIN public.patients p ON p.created_by = dr.doctor_id
    WHERE dr.user_id = auth.uid()
      AND p.id = medical_documents.patient_id
      AND dr.status = 'active'
  )
);

-- Doctor allergies: Doctor's receptionists can view
CREATE POLICY "Doctor receptionists can view doctor allergies"
ON public.doctor_allergies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = doctor_allergies.doctor_id
      AND dr.status = 'active'
  )
);

-- Doctor diseases: Doctor's receptionists can view
CREATE POLICY "Doctor receptionists can view doctor diseases"
ON public.doctor_diseases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = doctor_diseases.doctor_id
      AND dr.status = 'active'
  )
);

-- Doctor ICD codes: Doctor's receptionists can view
CREATE POLICY "Doctor receptionists can view doctor icd codes"
ON public.doctor_icd_codes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = doctor_icd_codes.doctor_id
      AND dr.status = 'active'
  )
);

-- Procedures: Doctor's receptionists can view
CREATE POLICY "Doctor receptionists can view doctor procedures"
ON public.procedures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = procedures.doctor_id
      AND dr.status = 'active'
  )
);

-- Doctors table: Doctor's receptionists can view their doctor
CREATE POLICY "Doctor receptionists can view their doctor"
ON public.doctors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.doctor_id = doctors.id
      AND dr.status = 'active'
  )
);

-- Profiles: Doctor's receptionists can view patient profiles
CREATE POLICY "Doctor receptionists can view profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = auth.uid()
      AND dr.status = 'active'
  )
);