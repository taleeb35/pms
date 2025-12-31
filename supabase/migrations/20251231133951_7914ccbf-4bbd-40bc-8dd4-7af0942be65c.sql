-- Allow doctors to read activity logs that are explicitly tagged to them via details.doctorId
-- (This is needed when a clinic owner/receptionist performs an action that affects a doctor.)

CREATE POLICY "Doctors can view logs tagged to them (details.doctorId)"
ON public.activity_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'doctor'::app_role)
  AND (coalesce(details->>'doctorId', '') = auth.uid()::text)
);

-- Backfill actorName into existing logs so UI doesn't show "Unknown User"
-- when profile joins are blocked by access rules.
UPDATE public.activity_logs al
SET details = (
  COALESCE(al.details, '{}'::jsonb)
  || jsonb_build_object(
    'actorName',
    COALESCE(p.full_name, p.email, 'Unknown User')
  )
)
FROM public.profiles p
WHERE p.id = al.user_id
  AND (
    al.details IS NULL
    OR NOT ((al.details)::jsonb ? 'actorName')
    OR COALESCE(((al.details)::jsonb ->> 'actorName'), '') = ''
  );
