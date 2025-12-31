-- Allow doctors to see clinic/admin activity logs that are explicitly about them
-- (e.g., clinic owner updating that doctor's schedule or leaves)

CREATE POLICY "Doctors can view logs about themselves (schedule/leave)"
ON public.activity_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'doctor'::app_role)
  AND entity_id = auth.uid()
  AND action IN ('schedule_updated', 'leave_added', 'leave_deleted')
);
