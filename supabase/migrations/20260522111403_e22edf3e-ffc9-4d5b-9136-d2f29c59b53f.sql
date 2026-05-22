
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS billing_cycle_day smallint;

ALTER TABLE public.clinics
  DROP CONSTRAINT IF EXISTS clinics_billing_cycle_day_check;
ALTER TABLE public.clinics
  ADD CONSTRAINT clinics_billing_cycle_day_check
  CHECK (billing_cycle_day IS NULL OR (billing_cycle_day BETWEEN 1 AND 28));

-- Helper: required paid month for a clinic given today's date and its billing cycle day
CREATE OR REPLACE FUNCTION public.clinic_required_paid_month(_clinic_id uuid)
RETURNS date
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN c.billing_cycle_day IS NULL THEN NULL
    WHEN EXTRACT(DAY FROM CURRENT_DATE)::int <= c.billing_cycle_day
      THEN date_trunc('month', CURRENT_DATE)::date
    ELSE (date_trunc('month', CURRENT_DATE) + interval '1 month')::date
  END
  FROM public.clinics c
  WHERE c.id = _clinic_id
$$;

-- Update is_clinic_active to also enforce payment when a billing cycle is set
CREATE OR REPLACE FUNCTION public.is_clinic_active(_clinic_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _clinic record;
  _required_month date;
  _paid boolean;
BEGIN
  SELECT id, status, billing_cycle_day
  INTO _clinic
  FROM public.clinics
  WHERE id = _clinic_id;

  IF NOT FOUND THEN RETURN false; END IF;
  IF _clinic.status <> 'active' THEN RETURN false; END IF;

  IF _clinic.billing_cycle_day IS NULL THEN
    RETURN true;
  END IF;

  _required_month := CASE
    WHEN EXTRACT(DAY FROM CURRENT_DATE)::int <= _clinic.billing_cycle_day
      THEN date_trunc('month', CURRENT_DATE)::date
    ELSE (date_trunc('month', CURRENT_DATE) + interval '1 month')::date
  END;

  SELECT EXISTS (
    SELECT 1 FROM public.clinic_payments
    WHERE clinic_id = _clinic_id
      AND month = _required_month
      AND status = 'paid'
  ) INTO _paid;

  RETURN _paid;
END;
$$;

-- Set this clinic's billing cycle
UPDATE public.clinics
SET billing_cycle_day = 22
WHERE id = 'f5dd2188-418f-4980-8e85-b4c81f89a801';
