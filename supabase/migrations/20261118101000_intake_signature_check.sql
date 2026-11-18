-- Security review: the signature must be exactly a base64 PNG image (it is printed into a page later).
create or replace function public.submit_intake_form(p_token text, p_answers jsonb, p_signed_name text, p_signature text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  f public.intake_forms;
begin
  select * into f from public.intake_forms where token = p_token and length(p_token) = 64 for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if f.status <> 'sent' then return jsonb_build_object('ok', false, 'error', 'already_done'); end if;
  if f.expires_at < now() then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or length(p_answers::text) > 20000 then
    return jsonb_build_object('ok', false, 'error', 'bad_answers');
  end if;
  if length(trim(coalesce(p_signed_name, ''))) < 2 or length(p_signed_name) > 120 then
    return jsonb_build_object('ok', false, 'error', 'name_required');
  end if;
  if p_signature is not null and (length(p_signature) > 300000 or p_signature !~ '^data:image/png;base64,[A-Za-z0-9+/]+=*$') then
    return jsonb_build_object('ok', false, 'error', 'bad_signature');
  end if;
  update public.intake_forms
     set status = 'completed', answers = p_answers, signed_name = trim(p_signed_name), signature = p_signature, signed_at = now()
   where id = f.id;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.submit_intake_form(text, jsonb, text, text) from public;
grant execute on function public.submit_intake_form(text, jsonb, text, text) to anon, authenticated;
-- Any stored signature that is not a clean PNG is removed.
update public.intake_forms set signature = null where signature is not null and signature !~ '^data:image/png;base64,[A-Za-z0-9+/]+=*$';
