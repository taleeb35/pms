-- F4 (first step): a private link to a visit's invoice that the patient can open, save or print.
-- A pay button is added later with Stripe.
alter table public.appointments add column if not exists invoice_token text unique;

-- Staff create (or reuse) the link for a visit they can see.
create or replace function public.share_invoice(p_appointment uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  t text;
  doc uuid;
begin
  select doctor_id, invoice_token into doc, t from public.appointments where id = p_appointment;
  if doc is null or not public.can_work_for_doctor(doc) or not public.mfa_ok() then
    raise exception 'not allowed';
  end if;
  if t is null then
    t := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    update public.appointments set invoice_token = t where id = p_appointment;
  end if;
  return t;
end;
$$;
revoke all on function public.share_invoice(uuid) from public;
grant execute on function public.share_invoice(uuid) to authenticated;

-- Public: the invoice for a link. Only billing details, no medical notes.
create or replace function public.get_shared_invoice(p_token text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select jsonb_build_object(
      'found', true,
      'number', 'INV-' || upper(left(replace(a.id::text, '-', ''), 8)),
      'date', a.appointment_date,
      'status', a.status,
      'consultation_fee', coalesce(a.consultation_fee, 0),
      'procedure_fee', coalesce(a.procedure_fee, 0),
      'procedure_name', pr.name,
      'other_fee', coalesce(a.other_fee, 0),
      'discount', coalesce(a.refund, 0),
      'amount_paid', a.amount_paid,
      'currency', coalesce(cl.currency_code, d.currency_code, 'PKR'),
      'patient', trim(p.full_name),
      'patient_ref', p.patient_id,
      'doctor', prof.full_name,
      'doctor_specialization', d.specialization,
      'clinic', cl.clinic_name,
      'address', coalesce(nullif(trim(cl.address), ''), nullif(trim(d.clinic_address), '')),
      'phone', coalesce(nullif(trim(cl.phone_number), ''), nullif(trim(d.contact_number), '')),
      'city', coalesce(cl.city, d.city)
    )
    from public.appointments a
    join public.patients p on p.id = a.patient_id
    left join public.procedures pr on pr.id = a.procedure_id
    left join public.doctors d on d.id = a.doctor_id
    left join public.profiles prof on prof.id = a.doctor_id
    left join public.clinics cl on cl.id = d.clinic_id
    where a.invoice_token = p_token and length(p_token) = 64
  ), jsonb_build_object('found', false));
$$;
revoke all on function public.get_shared_invoice(text) from public;
grant execute on function public.get_shared_invoice(text) to anon, authenticated;
