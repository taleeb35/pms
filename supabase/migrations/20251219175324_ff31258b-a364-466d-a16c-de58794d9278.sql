-- Add refund column to appointments table
ALTER TABLE public.appointments ADD COLUMN refund numeric DEFAULT 0;