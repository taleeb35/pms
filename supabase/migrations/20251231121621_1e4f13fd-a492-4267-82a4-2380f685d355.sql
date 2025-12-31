-- Add RLS policies for activity_logs table

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Clinic owners can view logs for their doctors' activities
CREATE POLICY "Clinics can view their doctors activity logs"
ON public.activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.clinic_id = auth.uid()
    AND d.id = activity_logs.user_id
  )
  OR user_id = auth.uid()
);

-- Doctors can view their own activity logs and their receptionists' logs
CREATE POLICY "Doctors can view own and receptionist activity logs"
ON public.activity_logs
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM doctor_receptionists dr
    WHERE dr.doctor_id = auth.uid()
    AND dr.user_id = activity_logs.user_id
    AND dr.status = 'active'
  )
);

-- Clinic receptionists can view logs for their clinic
CREATE POLICY "Clinic receptionists can view clinic activity logs"
ON public.activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clinic_receptionists cr
    JOIN doctors d ON d.clinic_id = cr.clinic_id
    WHERE cr.user_id = auth.uid()
    AND cr.status = 'active'
    AND (activity_logs.user_id = d.id OR activity_logs.user_id = cr.user_id)
  )
);

-- Anyone can insert their own activity logs
CREATE POLICY "Users can insert own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));