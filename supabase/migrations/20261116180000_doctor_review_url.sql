-- Link where patients can leave a review (Google, Facebook, ...). Used by "Ask for a review" after a visit.
alter table public.doctors add column if not exists review_url text;
