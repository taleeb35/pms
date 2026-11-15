-- B8: appointments can be marked as no-show.
alter type public.appointment_status add value if not exists 'no_show';
