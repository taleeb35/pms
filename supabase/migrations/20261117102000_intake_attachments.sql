-- D4 follow-up: patients can attach reports (photos or PDFs) to the intake form.
-- Files go to the patient's documents; this column lists them on the form.
alter table public.intake_forms add column if not exists attachments jsonb not null default '[]'::jsonb;
