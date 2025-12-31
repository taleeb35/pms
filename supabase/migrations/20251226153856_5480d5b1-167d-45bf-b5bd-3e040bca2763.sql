-- Recompute trial_end_date based on registration (created_at)
-- This fixes cases where trial_end_date was previously initialized for all rows using CURRENT_DATE + 14.

UPDATE public.clinics
SET trial_end_date = (created_at::date + INTERVAL '14 days')::date,
    updated_at = now()
WHERE trial_end_date IS NULL
   OR trial_end_date = (CURRENT_DATE + INTERVAL '14 days')::date;

UPDATE public.doctors
SET trial_end_date = (created_at::date + INTERVAL '14 days')::date,
    updated_at = now()
WHERE clinic_id IS NULL
  AND (trial_end_date IS NULL OR trial_end_date = (CURRENT_DATE + INTERVAL '14 days')::date);
