-- Allow clinic owners to view appointments for their doctors
CREATE POLICY "Clinics can view their doctors' appointments"
ON public.appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = appointments.doctor_id
      AND doctors.clinic_id = auth.uid()
  )
);

-- Allow clinic owners to create appointments for their doctors
CREATE POLICY "Clinics can create appointments for their doctors"
ON public.appointments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = appointments.doctor_id
      AND doctors.clinic_id = auth.uid()
  )
);

-- Allow clinic owners to update appointments for their doctors
CREATE POLICY "Clinics can update their doctors' appointments"
ON public.appointments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = appointments.doctor_id
      AND doctors.clinic_id = auth.uid()
  )
);

-- Allow clinic owners to view visit records for their doctors' patients
CREATE POLICY "Clinics can view their doctors' visit records"
ON public.visit_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = visit_records.doctor_id
      AND doctors.clinic_id = auth.uid()
  )
);

-- Allow clinic owners to create visit records for their doctors' patients
CREATE POLICY "Clinics can create visit records for their doctors"
ON public.visit_records
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = visit_records.doctor_id
      AND doctors.clinic_id = auth.uid()
  )
);

-- Allow clinic owners to update visit records for their doctors' patients
CREATE POLICY "Clinics can update their doctors' visit records"
ON public.visit_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = visit_records.doctor_id
      AND doctors.clinic_id = auth.uid()
  )
);