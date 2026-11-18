-- "Ask for a review" now records when it was sent, so appointment lists can tag and filter it.
alter table public.appointments add column if not exists review_requested_at timestamptz;
create index if not exists appointments_review_requested_idx on public.appointments (doctor_id) where review_requested_at is not null;
