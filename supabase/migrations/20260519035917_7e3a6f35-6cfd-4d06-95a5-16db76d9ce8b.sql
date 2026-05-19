-- Add confidential_notes to patients (doctor/staff-only field)
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS confidential_notes text;

-- Backfill from existing appointments: for each patient, concatenate non-empty
-- appointment confidential_notes (oldest first) into the patient record so no data is lost.
WITH agg AS (
  SELECT
    a.patient_id,
    string_agg(
      '[' || to_char(a.appointment_date, 'YYYY-MM-DD') || '] ' || a.confidential_notes,
      E'\n\n'
      ORDER BY a.appointment_date, a.created_at
    ) AS notes
  FROM public.appointments a
  WHERE a.confidential_notes IS NOT NULL
    AND length(trim(a.confidential_notes)) > 0
  GROUP BY a.patient_id
)
UPDATE public.patients p
SET confidential_notes = agg.notes
FROM agg
WHERE p.id = agg.patient_id
  AND (p.confidential_notes IS NULL OR length(trim(p.confidential_notes)) = 0);