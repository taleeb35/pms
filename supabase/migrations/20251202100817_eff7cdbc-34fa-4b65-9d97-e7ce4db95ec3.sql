-- Ensure INSERT/UPDATE/DELETE policies are also properly scoped

-- Patients: Only doctors can insert/update their own patients, admins can manage all
DROP POLICY IF EXISTS "Staff can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Staff can update patients" ON public.patients;
DROP POLICY IF EXISTS "Staff can delete patients" ON public.patients;

CREATE POLICY "Doctors can insert own patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND created_by = auth.uid()
);

CREATE POLICY "Admins can insert patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can update own patients" 
ON public.patients 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND created_by = auth.uid()
);

CREATE POLICY "Admins can update patients" 
ON public.patients 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can delete own patients" 
ON public.patients 
FOR DELETE 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND created_by = auth.uid()
);

CREATE POLICY "Admins can delete patients" 
ON public.patients 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Medical Records: Only doctors can manage their own patient records
DROP POLICY IF EXISTS "Doctors can create records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can update records" ON public.medical_records;

CREATE POLICY "Doctors can create own patient records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can create medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can update own patient records" 
ON public.medical_records 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can update medical records" 
ON public.medical_records 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Prescriptions: Only doctors can create prescriptions for their patients
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON public.prescriptions;

CREATE POLICY "Doctors can create own patient prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Appointments: Only doctors can manage their own appointments
DROP POLICY IF EXISTS "Staff can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON public.appointments;

CREATE POLICY "Doctors can create own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can update own appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Medical Documents: Only doctors can manage documents for their patients
DROP POLICY IF EXISTS "Staff can upload documents" ON public.medical_documents;
DROP POLICY IF EXISTS "Medical staff can delete medical documents" ON public.medical_documents;

CREATE POLICY "Doctors can upload own patient documents" 
ON public.medical_documents 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = medical_documents.patient_id 
    AND patients.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can upload medical documents" 
ON public.medical_documents 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can delete own patient documents" 
ON public.medical_documents 
FOR DELETE 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = medical_documents.patient_id 
    AND patients.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can delete medical documents" 
ON public.medical_documents 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Visit Records: Only doctors can manage their own visit records
DROP POLICY IF EXISTS "Doctors can create visit records" ON public.visit_records;
DROP POLICY IF EXISTS "Doctors can update visit records" ON public.visit_records;

CREATE POLICY "Doctors can create own visit records" 
ON public.visit_records 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can create visit records" 
ON public.visit_records 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can update own visit records" 
ON public.visit_records 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can update visit records" 
ON public.visit_records 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));