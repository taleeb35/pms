
CREATE OR REPLACE FUNCTION public.check_password_reset_eligibility(_email text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _clinic record;
  _doctor record;
BEGIN
  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;

  SELECT id INTO _user_id FROM public.profiles WHERE lower(email) = lower(trim(_email)) LIMIT 1;

  IF _user_id IS NULL THEN
    -- Don't leak existence; let Supabase handle it
    RETURN jsonb_build_object('allowed', true);
  END IF;

  -- Check clinic
  SELECT status INTO _clinic FROM public.clinics WHERE id = _user_id LIMIT 1;
  IF FOUND THEN
    IF _clinic.status <> 'active' THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'clinic_not_active',
        'message', 'Your clinic account is not active yet. Please wait for admin approval before resetting your password.');
    END IF;
    RETURN jsonb_build_object('allowed', true);
  END IF;

  -- Check doctor
  SELECT d.approved, d.clinic_id, c.status AS clinic_status
  INTO _doctor
  FROM public.doctors d
  LEFT JOIN public.clinics c ON c.id = d.clinic_id
  WHERE d.id = _user_id
  LIMIT 1;

  IF FOUND THEN
    IF NOT _doctor.approved THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'doctor_not_approved',
        'message', 'Your doctor account is not approved yet. Please wait for approval before resetting your password.');
    END IF;
    IF _doctor.clinic_id IS NOT NULL AND _doctor.clinic_status <> 'active' THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'clinic_not_active',
        'message', 'Your clinic is not active. Please contact your clinic administrator.');
    END IF;
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_password_reset_eligibility(text) TO anon, authenticated;
