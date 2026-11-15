-- C2: record what the AI suggested and what the doctor did with it.
create table if not exists public.ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feature text not null,          -- prescription | visit_summary | patient_insights | chatbot | revenue_forecast
  action text not null,           -- suggested | applied | copied | dismissed
  input_summary text,             -- short description of what was asked (no free-text patient notes)
  suggestion text,
  created_at timestamptz not null default now()
);
alter table public.ai_audit_log enable row level security;
create index if not exists ai_audit_log_user_created on public.ai_audit_log (user_id, created_at desc);

create policy "Users add their own AI log entries" on public.ai_audit_log
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users see their own AI log entries" on public.ai_audit_log
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role));
create policy "Two-factor required" on public.ai_audit_log as restrictive for all to authenticated
  using ((select public.mfa_ok())) with check ((select public.mfa_ok()));

grant select, insert on public.ai_audit_log to authenticated;
