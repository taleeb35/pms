CREATE OR REPLACE FUNCTION public.public_book_appointment(_doctor_id uuid, _full_name text, _phone text, _appointment_date date, _appointment_time time without time zone, _reason text DEFAULT NULL::text, _gender text DEFAULT 'other'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _doctor_exists boolean;
  _patient_uuid uuid;
  _patient_code text;
  _next_num int;
  _appointment_id uuid;
  _slot_taken boolean;
  _day_of_week integer;
  _schedule_record RECORD;
  _leave_record RECORD;
  _has_leave boolean := false;
BEGIN
  IF _full_name IS NULL OR length(trim(_full_name)) < 2 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF _phone IS NULL OR length(trim(_phone)) < 7 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  IF _appointment_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Appointment date must be today or in the future';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.doctors WHERE id = _doctor_id AND approved = true
  ) INTO _doctor_exists;

  IF NOT _doctor_exists THEN
    RAISE EXCEPTION 'Doctor not available for booking';
  END IF;

  SELECT leave_type, reason
  INTO _leave_record
  FROM public.doctor_leaves
  WHERE doctor_id = _doctor_id
    AND leave_date = _appointment_date
  LIMIT 1;

  _has_leave := FOUND;

  IF _has_leave AND _leave_record.leave_type = 'full_day' THEN
    RAISE EXCEPTION '%', COALESCE(NULLIF(trim(_leave_record.reason), ''), 'Doctor is on leave for this date');
  END IF;

  _day_of_week := EXTRACT(DOW FROM _appointment_date);

  SELECT is_available, start_time, end_time, break_start, break_end
  INTO _schedule_record
  FROM public.doctor_schedules
  WHERE doctor_id = _doctor_id
    AND day_of_week = _day_of_week
  LIMIT 1;

  IF NOT FOUND OR COALESCE(_schedule_record.is_available, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Doctor is not available on this day';
  END IF;

  IF _schedule_record.start_time IS NULL
     OR _schedule_record.end_time IS NULL
     OR _appointment_time < _schedule_record.start_time
     OR _appointment_time >= _schedule_record.end_time THEN
    RAISE EXCEPTION 'Appointment time is outside the doctor schedule';
  END IF;

  IF _schedule_record.break_start IS NOT NULL
     AND _schedule_record.break_end IS NOT NULL
     AND _appointment_time >= _schedule_record.break_start
     AND _appointment_time < _schedule_record.break_end THEN
    RAISE EXCEPTION 'Appointment time is during the doctor break';
  END IF;

  IF _has_leave AND _leave_record.leave_type = 'half_day_morning' AND _appointment_time < time '12:00' THEN
    RAISE EXCEPTION 'Doctor is not available in the morning on this date';
  END IF;

  IF _has_leave AND _leave_record.leave_type = 'half_day_evening' AND _appointment_time >= time '12:00' THEN
    RAISE EXCEPTION 'Doctor is not available in the evening on this date';
  END IF;

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
    COALESCE(NULLIF(_gender,''), 'other')::public.gender,
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
$function$;