-- CRITICAL SECURITY FIX: Restrict profile visibility
-- Remove public profile viewing policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Restrict role visibility
-- Remove public role viewing policy
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

-- Users can only view their own roles
CREATE POLICY "Users can view own roles only" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Restrict patient data to clinic boundaries
-- Remove overly permissive staff policy
DROP POLICY IF EXISTS "Staff can view all patients" ON public.patients;

-- Doctors can only see their own patients
CREATE POLICY "Doctors can view own patients" 
ON public.patients 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND created_by = auth.uid()
);

-- Admins can view all patients
CREATE POLICY "Admins can view all patients" 
ON public.patients 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Restrict medical records to doctor's own patients
-- Remove overly permissive medical staff policy
DROP POLICY IF EXISTS "Medical staff can view records" ON public.medical_records;

-- Doctors can only view records for their own patients
CREATE POLICY "Doctors can view own patient records" 
ON public.medical_records 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

-- Admins can view all medical records
CREATE POLICY "Admins can view all medical records" 
ON public.medical_records 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Restrict prescriptions to doctor's own patients
-- Remove overly permissive medical staff policy
DROP POLICY IF EXISTS "Medical staff can view prescriptions" ON public.prescriptions;

-- Doctors can only view prescriptions for their own patients
CREATE POLICY "Doctors can view own patient prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

-- Admins can view all prescriptions
CREATE POLICY "Admins can view all prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Restrict appointments to doctor's own appointments
-- Keep existing staff policies but ensure they're not overly permissive
-- Verify doctors can only see their own appointments
DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;

CREATE POLICY "Doctors can view own appointments" 
ON public.appointments 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

CREATE POLICY "Admins can view all appointments" 
ON public.appointments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Restrict medical documents to doctor's own patients
-- Remove overly permissive staff policy
DROP POLICY IF EXISTS "Staff can view documents" ON public.medical_documents;

-- Doctors can only view documents for their own patients
CREATE POLICY "Doctors can view own patient documents" 
ON public.medical_documents 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = medical_documents.patient_id 
    AND patients.created_by = auth.uid()
  )
);

-- Admins can view all documents
CREATE POLICY "Admins can view all medical documents" 
ON public.medical_documents 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL SECURITY FIX: Restrict visit records to doctor's own visits
-- Remove overly permissive policy
DROP POLICY IF EXISTS "Doctors can view their visit records" ON public.visit_records;

-- Doctors can only view their own visit records
CREATE POLICY "Doctors can view own visit records only" 
ON public.visit_records 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  AND doctor_id = auth.uid()
);

-- Admins can view all visit records
CREATE POLICY "Admins can view all visit records" 
ON public.visit_records 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));