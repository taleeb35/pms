-- Allow doctors to insert allergies for their clinic
CREATE POLICY "Doctors can insert allergies for their clinic" ON public.clinic_allergies
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_allergies.clinic_id
  ));

-- Allow doctors to update allergies for their clinic
CREATE POLICY "Doctors can update allergies for their clinic" ON public.clinic_allergies
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_allergies.clinic_id
  ));

-- Allow doctors to delete allergies for their clinic
CREATE POLICY "Doctors can delete allergies for their clinic" ON public.clinic_allergies
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_allergies.clinic_id
  ));

-- Allow doctors to insert diseases for their clinic
CREATE POLICY "Doctors can insert diseases for their clinic" ON public.clinic_diseases
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_diseases.clinic_id
  ));

-- Allow doctors to update diseases for their clinic
CREATE POLICY "Doctors can update diseases for their clinic" ON public.clinic_diseases
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_diseases.clinic_id
  ));

-- Allow doctors to delete diseases for their clinic
CREATE POLICY "Doctors can delete diseases for their clinic" ON public.clinic_diseases
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_diseases.clinic_id
  ));