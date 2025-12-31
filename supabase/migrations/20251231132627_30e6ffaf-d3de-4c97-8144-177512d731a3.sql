-- Backfill actorName into activity_logs.details so viewers can see who did the action
-- (needed because profiles table is protected by RLS for doctors, so embedded profiles can be null)

UPDATE public.activity_logs al
SET details = jsonb_set(
  COALESCE(al.details, '{}'::jsonb),
  '{actorName}',
  to_jsonb(p.full_name),
  true
)
FROM public.profiles p
WHERE al.user_id = p.id
  AND (al.details IS NULL OR (al.details->>'actorName') IS NULL);
