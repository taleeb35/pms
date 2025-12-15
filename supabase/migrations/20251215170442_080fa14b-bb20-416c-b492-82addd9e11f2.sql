-- Add RLS policies for receptionists to manage clinic_allergies
CREATE POLICY "Receptionists can insert clinic allergies" 
ON public.clinic_allergies 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_allergies.clinic_id
));

CREATE POLICY "Receptionists can update clinic allergies" 
ON public.clinic_allergies 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_allergies.clinic_id
));

CREATE POLICY "Receptionists can delete clinic allergies" 
ON public.clinic_allergies 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_allergies.clinic_id
));

-- Add RLS policies for receptionists to manage clinic_diseases
CREATE POLICY "Receptionists can insert clinic diseases" 
ON public.clinic_diseases 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_diseases.clinic_id
));

CREATE POLICY "Receptionists can update clinic diseases" 
ON public.clinic_diseases 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_diseases.clinic_id
));

CREATE POLICY "Receptionists can delete clinic diseases" 
ON public.clinic_diseases 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_diseases.clinic_id
));