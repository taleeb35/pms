-- A9: medicines can carry a generic name next to the (brand or generic) name.
alter table public.doctor_medicines add column if not exists generic_name text;
alter table public.clinic_medicines add column if not exists generic_name text;
