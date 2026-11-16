-- What the patient actually paid for a visit. Empty means paid in full (all older visits), so balances only
-- appear when someone records a part payment. Balance due = fees - refund - amount_paid.
alter table public.appointments add column if not exists amount_paid numeric(12,2) check (amount_paid is null or amount_paid >= 0);
