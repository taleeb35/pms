-- Automatic appointment reminders by email: the day before, from 9 AM in the doctor's time zone,
-- to patients who have an email address. On by default; the clinic owner (for clinic doctors) or
-- the single doctor can switch it off on the Reminders page.
alter table public.doctors add column if not exists auto_email_reminders boolean not null default true;
alter table public.clinics add column if not exists auto_email_reminders boolean not null default true;

create or replace function public.due_email_reminders()
returns table (
  appointment_id uuid, patient_email text, patient_name text, appointment_date date, appointment_time time,
  doctor_name text, practice_name text, practice_phone text, location_name text, location_address text, timezone text
) language sql stable security definer set search_path = public as $$
  select a.id, p.email, p.full_name, a.appointment_date, a.appointment_time,
         pr.full_name, coalesce(c.clinic_name, pr.full_name), coalesce(nullif(l.phone, ''), c.phone_number, d.contact_number),
         l.name, coalesce(nullif(l.address, ''), d.clinic_address, c.address), coalesce(d.timezone, 'Asia/Karachi')
    from public.appointments a
    join public.patients p on p.id = a.patient_id
    join public.doctors d on d.id = a.doctor_id
    left join public.profiles pr on pr.id = d.id
    left join public.clinics c on c.id = d.clinic_id
    left join public.doctor_locations l on l.id = a.location_id
   where a.status = 'scheduled'
     and a.reminder_sent_at is null
     and p.email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
     and (case when d.clinic_id is not null then coalesce(c.auto_email_reminders, true) else d.auto_email_reminders end)
     and a.appointment_date = ((now() at time zone coalesce(d.timezone, 'Asia/Karachi'))::date + 1)
     and extract(hour from (now() at time zone coalesce(d.timezone, 'Asia/Karachi'))) >= 9
   limit 500;
$$;
revoke execute on function public.due_email_reminders() from anon, authenticated, public;
grant execute on function public.due_email_reminders() to service_role;
