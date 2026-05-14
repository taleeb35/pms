
-- Membership status enum
DO $$ BEGIN
  CREATE TYPE public.membership_status AS ENUM ('active','expired','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- clinic_membership_plans
-- =========================
CREATE TABLE IF NOT EXISTS public.clinic_membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  name text NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  duration_months integer NOT NULL DEFAULT 12 CHECK (duration_months > 0),
  consultation_discount_pct numeric(5,2) NOT NULL DEFAULT 0 CHECK (consultation_discount_pct BETWEEN 0 AND 100),
  procedure_discount_pct numeric(5,2) NOT NULL DEFAULT 0 CHECK (procedure_discount_pct BETWEEN 0 AND 100),
  pharmacy_discount_pct numeric(5,2) NOT NULL DEFAULT 0 CHECK (pharmacy_discount_pct BETWEEN 0 AND 100),
  color text NOT NULL DEFAULT '#6366f1',
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_clinic ON public.clinic_membership_plans(clinic_id);

ALTER TABLE public.clinic_membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff manage their plans"
  ON public.clinic_membership_plans
  FOR ALL
  USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));

CREATE POLICY "Doctors of clinic can view plans"
  ON public.clinic_membership_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = auth.uid()
        AND d.clinic_id = clinic_membership_plans.clinic_id
        AND d.approved = true
    )
  );

CREATE TRIGGER update_membership_plans_updated_at
BEFORE UPDATE ON public.clinic_membership_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- patient_memberships
-- =========================
CREATE TABLE IF NOT EXISTS public.patient_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.clinic_membership_plans(id) ON DELETE RESTRICT,
  card_number text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status public.membership_status NOT NULL DEFAULT 'active',
  amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  cancelled_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_memberships_card_number_clinic_unique UNIQUE (clinic_id, card_number)
);

CREATE INDEX IF NOT EXISTS idx_patient_memberships_clinic ON public.patient_memberships(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_memberships_patient ON public.patient_memberships(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_memberships_status ON public.patient_memberships(status);

ALTER TABLE public.patient_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff manage patient memberships"
  ON public.patient_memberships
  FOR ALL
  USING (public.can_manage_clinic_inventory(clinic_id))
  WITH CHECK (public.can_manage_clinic_inventory(clinic_id));

CREATE POLICY "Doctors of clinic view patient memberships"
  ON public.patient_memberships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = auth.uid()
        AND d.clinic_id = patient_memberships.clinic_id
        AND d.approved = true
    )
  );

CREATE TRIGGER update_patient_memberships_updated_at
BEFORE UPDATE ON public.patient_memberships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Card number generator
-- =========================
CREATE OR REPLACE FUNCTION public.generate_membership_card_number(_clinic_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _next int;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(card_number, '\D', '', 'g'), '')::int), 0) + 1
    INTO _next
  FROM public.patient_memberships
  WHERE clinic_id = _clinic_id;
  RETURN 'MBR-' || LPAD(_next::text, 4, '0');
END;
$$;

-- =========================
-- Enroll patient
-- =========================
CREATE OR REPLACE FUNCTION public.enroll_patient_membership(
  _clinic_id uuid,
  _patient_id uuid,
  _plan_id uuid,
  _start_date date DEFAULT NULL,
  _amount_paid numeric DEFAULT NULL,
  _notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan RECORD;
  _start date;
  _end date;
  _card text;
  _id uuid;
BEGIN
  IF NOT public.can_manage_clinic_inventory(_clinic_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO _plan FROM public.clinic_membership_plans
    WHERE id = _plan_id AND clinic_id = _clinic_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan not found'; END IF;
  IF NOT _plan.is_active THEN RAISE EXCEPTION 'Plan is not active'; END IF;

  -- Auto-cancel any existing active memberships for this patient at this clinic
  UPDATE public.patient_memberships
    SET status = 'cancelled', cancelled_at = now()
    WHERE patient_id = _patient_id
      AND clinic_id = _clinic_id
      AND status = 'active';

  _start := COALESCE(_start_date, CURRENT_DATE);
  _end := (_start + (_plan.duration_months || ' months')::interval)::date;
  _card := public.generate_membership_card_number(_clinic_id);

  INSERT INTO public.patient_memberships (
    clinic_id, patient_id, plan_id, card_number, start_date, end_date,
    status, amount_paid, notes, created_by
  ) VALUES (
    _clinic_id, _patient_id, _plan_id, _card, _start, _end,
    'active', COALESCE(_amount_paid, _plan.price), _notes, auth.uid()
  ) RETURNING id INTO _id;

  RETURN _id;
END;
$$;

-- =========================
-- Get active membership (with discount %s)
-- =========================
CREATE OR REPLACE FUNCTION public.get_active_patient_membership(_patient_id uuid)
RETURNS TABLE(
  membership_id uuid,
  clinic_id uuid,
  plan_id uuid,
  plan_name text,
  card_number text,
  start_date date,
  end_date date,
  color text,
  consultation_discount_pct numeric,
  procedure_discount_pct numeric,
  pharmacy_discount_pct numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pm.id, pm.clinic_id, p.id, p.name, pm.card_number,
         pm.start_date, pm.end_date, p.color,
         p.consultation_discount_pct, p.procedure_discount_pct, p.pharmacy_discount_pct
  FROM public.patient_memberships pm
  JOIN public.clinic_membership_plans p ON p.id = pm.plan_id
  WHERE pm.patient_id = _patient_id
    AND pm.status = 'active'
    AND pm.end_date >= CURRENT_DATE
  ORDER BY pm.created_at DESC
  LIMIT 1;
$$;

-- Add membership_discount_pct to invoice items for audit
ALTER TABLE public.inventory_invoice_items
  ADD COLUMN IF NOT EXISTS membership_discount_pct numeric(5,2) DEFAULT 0;
