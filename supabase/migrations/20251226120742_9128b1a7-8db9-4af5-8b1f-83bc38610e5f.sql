-- Add referred_by column to doctors table to track referrals
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS referred_by TEXT;