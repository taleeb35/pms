-- Allow doctors to delete their own appointments
CREATE POLICY "Doctors can delete own appointments"
ON public.appointments
FOR DELETE
USING (has_role(auth.uid(), 'doctor'::app_role) AND doctor_id = auth.uid());

-- Allow clinics to delete appointments for their doctors
CREATE POLICY "Clinics can delete their doctors' appointments"
ON public.appointments
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM doctors
  WHERE doctors.id = appointments.doctor_id
  AND doctors.clinic_id = auth.uid()
));