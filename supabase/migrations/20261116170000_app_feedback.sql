-- In-app feedback: "How likely are you to recommend Zonoir?" (0-10) and free-text ideas or problems.
create table if not exists public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('nps', 'idea', 'problem', 'other')),
  score int check (score between 0 and 10),
  message text check (char_length(message) <= 4000),
  page text,
  portal text,
  created_at timestamptz not null default now(),
  check (kind <> 'nps' or score is not null)
);
create index if not exists app_feedback_created_idx on public.app_feedback (created_at desc);
create index if not exists app_feedback_user_idx on public.app_feedback (user_id, kind, created_at desc);
alter table public.app_feedback enable row level security;

drop policy if exists "Users add own feedback" on public.app_feedback;
create policy "Users add own feedback" on public.app_feedback for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users read own feedback" on public.app_feedback;
create policy "Users read own feedback" on public.app_feedback for select to authenticated using (user_id = auth.uid());
drop policy if exists "Admins read feedback" on public.app_feedback;
create policy "Admins read feedback" on public.app_feedback for select to authenticated using (public.has_role(auth.uid(), 'admin'::app_role));

grant select, insert on public.app_feedback to authenticated;
