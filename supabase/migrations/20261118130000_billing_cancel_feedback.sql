-- Reasons given when a clinic or single doctor cancels their Stripe subscription.
-- Written by the stripe-billing function (service role); only admins can read.
create table if not exists public.billing_cancel_feedback (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  kind text not null,
  user_id uuid not null,
  reason text not null,
  comment text,
  ends_at timestamptz,
  undone_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.billing_cancel_feedback enable row level security;
revoke all on public.billing_cancel_feedback from anon;
grant select on public.billing_cancel_feedback to authenticated;
drop policy if exists "Admins read cancel feedback" on public.billing_cancel_feedback;
create policy "Admins read cancel feedback" on public.billing_cancel_feedback for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role));
