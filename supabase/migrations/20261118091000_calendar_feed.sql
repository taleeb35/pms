-- E2 (first step): a private calendar link per doctor that Google Calendar, Outlook or Apple Calendar
-- can subscribe to. Read-only; the token in the link is the only permission and can be replaced.
alter table public.doctors add column if not exists calendar_token text unique;
alter table public.doctors add column if not exists calendar_show_names boolean not null default false;
