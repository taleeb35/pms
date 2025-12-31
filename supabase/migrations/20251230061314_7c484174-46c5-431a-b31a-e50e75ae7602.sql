-- Allow clinics to delete their doctors
CREATE POLICY "Clinics can delete their own doctors" 
ON public.doctors 
FOR DELETE 
USING (clinic_id = auth.uid());

-- Allow clinics to delete patients created by their doctors
CREATE POLICY "Clinics can delete their doctors' patients" 
ON public.patients 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = patients.created_by 
  AND doctors.clinic_id = auth.uid()
));

-- Allow clinics to delete visit records of their doctors
CREATE POLICY "Clinics can delete their doctors' visit records" 
ON public.visit_records 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = visit_records.doctor_id 
  AND doctors.clinic_id = auth.uid()
));

-- Allow clinics to delete doctor schedules
CREATE POLICY "Clinics can delete their doctors' schedules" 
ON public.doctor_schedules 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = doctor_schedules.doctor_id 
  AND d.clinic_id = auth.uid()
));

-- Allow clinics to delete doctor leaves
CREATE POLICY "Clinics can delete their doctors' leaves" 
ON public.doctor_leaves 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = doctor_leaves.doctor_id 
  AND d.clinic_id = auth.uid()
));

-- Allow clinics to delete procedures
CREATE POLICY "Clinics can delete their doctors' procedures" 
ON public.procedures 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = procedures.doctor_id 
  AND d.clinic_id = auth.uid()
));

-- Allow clinics to delete wait list entries
CREATE POLICY "Clinics can delete their doctors' wait list" 
ON public.wait_list 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = wait_list.doctor_id 
  AND d.clinic_id = auth.uid()
));

-- Allow clinics to delete user roles for their doctors
CREATE POLICY "Clinics can delete their doctors' user roles" 
ON public.user_roles 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = user_roles.user_id 
  AND d.clinic_id = auth.uid()
));

-- Allow clinics to manage their doctors' medical records
CREATE POLICY "Clinics can delete their doctors' medical records" 
ON public.medical_records 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = medical_records.doctor_id 
  AND doctors.clinic_id = auth.uid()
));

-- Allow clinics to delete prescriptions for their doctors
CREATE POLICY "Clinics can delete their doctors' prescriptions" 
ON public.prescriptions 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = prescriptions.doctor_id 
  AND doctors.clinic_id = auth.uid()
));

-- Allow clinics to delete medical documents for patients created by their doctors
CREATE POLICY "Clinics can delete their doctors' medical documents" 
ON public.medical_documents 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM patients p
  JOIN doctors d ON d.id = p.created_by
  WHERE p.id = medical_documents.patient_id
  AND d.clinic_id = auth.uid()
));