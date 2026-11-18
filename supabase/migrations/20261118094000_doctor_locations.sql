-- E4: doctors who work at more than one place. Each weekday in the schedule can point to a location,
-- and new appointments take the location of their weekday (or the doctor's main location).
create table if not exists public.doctor_locations (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  address text,
  phone text,
  map_url text,
  is_default boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists doctor_locations_doctor_idx on public.doctor_locations (doctor_id);
create unique index if not exists doctor_locations_one_default on public.doctor_locations (doctor_id) where is_default;

alter table public.doctor_locations enable row level security;
drop policy if exists "Care team manages doctor locations" on public.doctor_locations;
create policy "Care team manages doctor locations" on public.doctor_locations
  for all to authenticated
  using (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok()))
  with check (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok()));
grant select, insert, update, delete on public.doctor_locations to authenticated;

alter table public.doctor_schedules add column if not exists location_id uuid references public.doctor_locations(id) on delete set null;
alter table public.appointments add column if not exists location_id uuid references public.doctor_locations(id) on delete set null;
create index if not exists appointments_location_idx on public.appointments (location_id);

-- New appointments without a location get the weekday's location, else the main location.
create or replace function public.set_appointment_location()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.location_id is null and new.appointment_date is not null then
    select s.location_id into new.location_id
      from public.doctor_schedules s
     where s.doctor_id = new.doctor_id and s.day_of_week = extract(dow from new.appointment_date)::int and s.location_id is not null
     limit 1;
    if new.location_id is null then
      select l.id into new.location_id from public.doctor_locations l
       where l.doctor_id = new.doctor_id and l.is_default and l.active limit 1;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_set_appointment_location on public.appointments;
create trigger trg_set_appointment_location before insert on public.appointments
  for each row execute function public.set_appointment_location();
