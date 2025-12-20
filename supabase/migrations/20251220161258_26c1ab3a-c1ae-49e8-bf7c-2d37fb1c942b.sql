-- Allow clinics to insert, update, delete their doctors' leaves (view already exists)
CREATE POLICY "Clinics can insert their doctors leaves" 
ON public.doctor_leaves 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM doctors d
  WHERE d.id = doctor_leaves.doctor_id 
  AND d.clinic_id = auth.uid()
));

CREATE POLICY "Clinics can update their doctors leaves" 
ON public.doctor_leaves 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM doctors d
  WHERE d.id = doctor_leaves.doctor_id 
  AND d.clinic_id = auth.uid()
));

CREATE POLICY "Clinics can delete their doctors leaves" 
ON public.doctor_leaves 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors d
  WHERE d.id = doctor_leaves.doctor_id 
  AND d.clinic_id = auth.uid()
));