-- D1/D8: remember which patients were already sent a reminder or a follow-up message,
-- so the front desk sees who is done. Sending itself is one tap to WhatsApp for now.
alter table public.appointments add column if not exists reminder_sent_at timestamptz;
alter table public.visit_records add column if not exists recall_sent_at timestamptz;
