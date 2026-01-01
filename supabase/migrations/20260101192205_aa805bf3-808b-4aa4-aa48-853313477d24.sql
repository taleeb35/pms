-- Add status column to referral_commissions for tracking payment to partners
ALTER TABLE public.referral_commissions 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add payment_date column to track when commission was paid
ALTER TABLE public.referral_commissions 
ADD COLUMN paid_at timestamp with time zone;