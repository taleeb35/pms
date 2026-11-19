-- Remember whether a saved Stripe customer/subscription belongs to test or live mode,
-- so switching between a test key and a live key never mixes their records.
alter table public.billing_accounts add column if not exists stripe_mode text check (stripe_mode in ('test', 'live'));
