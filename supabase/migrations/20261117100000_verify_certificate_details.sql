-- #10: the public certificate check shows enough to match the paper certificate:
-- the full certificate text, patient name/age/gender and record number (last 4),
-- visit date, leave period, issue time, and the doctor's and clinic's details.
-- It is reached only with the 10-character code printed on the certificate.
create or replace function public.verify_certificate(p_code text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select jsonb_build_object(
      'found', true,
      'valid', c.revoked_at is null,
      'revoked_at', c.revoked_at,
      'code', c.code,
      'title', c.title,
      'cert_type', c.cert_type,
      'body', c.body,
      'start_date', c.start_date,
      'end_date', c.end_date,
      'days', case when c.start_date is not null and c.end_date is not null then (c.end_date - c.start_date) + 1 end,
      'issued_at', c.issued_at,
      'visit_date', a.appointment_date,
      'patient', trim(p.full_name),
      'patient_ref', right(p.patient_id, 4),
      'patient_gender', p.gender,
      'patient_age', case when p.date_of_birth is not null then extract(year from age(c.issued_at::date, p.date_of_birth))::int end,
      'doctor', pr.full_name,
      'doctor_specialization', d.specialization,
      'doctor_qualification', d.qualification,
      'doctor_licence', coalesce(nullif(trim(d.license_number), ''), nullif(trim(d.pmdc_number), '')),
      'clinic', coalesce(cl.clinic_name, null),
      'clinic_address', coalesce(nullif(trim(cl.address), ''), nullif(trim(d.clinic_address), '')),
      'clinic_phone', coalesce(nullif(trim(cl.phone_number), ''), nullif(trim(d.contact_number), '')),
      'clinic_city', coalesce(cl.city, d.city)
    )
    from public.medical_certificates c
    join public.patients p on p.id = c.patient_id
    left join public.appointments a on a.id = c.appointment_id
    left join public.profiles pr on pr.id = c.doctor_id
    left join public.doctors d on d.id = c.doctor_id
    left join public.clinics cl on cl.id = d.clinic_id
    where c.code = upper(trim(p_code))
  ), jsonb_build_object('found', false));
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;
