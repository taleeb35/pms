
-- Public booking function: allows anonymous patients to book an appointment with an approved doctor.
-- Creates a patient record + appointment row. Bypasses RLS via SECURITY DEFINER but is tightly scoped.

CREATE OR REPLACE FUNCTION public.public_book_appointment(
  _doctor_id uuid,
  _full_name text,
  _phone text,
  _appointment_date date,
  _appointment_time time,
  _reason text DEFAULT NULL,
  _gender text DEFAULT 'other'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _doctor_exists boolean;
  _patient_uuid uuid;
  _patient_code text;
  _next_num int;
  _appointment_id uuid;
  _slot_taken boolean;
BEGIN
  -- Validate inputs
  IF _full_name IS NULL OR length(trim(_full_name)) < 2 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF _phone IS NULL OR length(trim(_phone)) < 7 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  IF _appointment_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Appointment date must be today or in the future';
  END IF;

  -- Doctor must be approved
  SELECT EXISTS (
    SELECT 1 FROM public.doctors WHERE id = _doctor_id AND approved = true
  ) INTO _doctor_exists;

  IF NOT _doctor_exists THEN
    RAISE EXCEPTION 'Doctor not available for booking';
  END IF;

  -- Slot conflict check (ignore cancelled/completed)
  SELECT EXISTS (
    SELECT 1 FROM public.appointments
    WHERE doctor_id = _doctor_id
      AND appointment_date = _appointment_date
      AND appointment_time = _appointment_time
      AND status NOT IN ('cancelled','completed')
  ) INTO _slot_taken;

  IF _slot_taken THEN
    RAISE EXCEPTION 'This time slot is already booked. Please choose another time.';
  END IF;

  -- Generate patient_id (PAT00001 pattern)
  SELECT COALESCE(MAX((regexp_replace(patient_id, '\D', '', 'g'))::int), 0) + 1
  INTO _next_num
  FROM public.patients
  WHERE patient_id ~ '^PAT[0-9]+$';

  _patient_code := 'PAT' || lpad(_next_num::text, 5, '0');

  INSERT INTO public.patients (
    patient_id, full_name, phone, gender, date_of_birth, created_by
  ) VALUES (
    _patient_code,
    trim(_full_name),
    trim(_phone),
    COALESCE(NULLIF(_gender,''), 'other')::gender_type,
    -- Placeholder DOB (required NOT NULL); patient/clinic can update later
    DATE '1900-01-01',
    _doctor_id
  )
  RETURNING id INTO _patient_uuid;

  INSERT INTO public.appointments (
    patient_id, doctor_id, appointment_date, appointment_time,
    appointment_type, status, reason, created_by
  ) VALUES (
    _patient_uuid, _doctor_id, _appointment_date, _appointment_time,
    'new', 'scheduled', NULLIF(trim(COALESCE(_reason,'')), ''), _doctor_id
  )
  RETURNING id INTO _appointment_id;

  RETURN _appointment_id;
END;
$$;

-- Allow anonymous + authenticated callers to invoke
GRANT EXECUTE ON FUNCTION public.public_book_appointment(uuid, text, text, date, time, text, text) TO anon, authenticated;
