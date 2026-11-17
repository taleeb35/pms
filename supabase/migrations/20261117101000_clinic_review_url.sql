-- #11: a clinic-wide review link (e.g. the clinic's Google review page), used when a doctor has none of their own.
alter table public.clinics add column if not exists review_url text;
