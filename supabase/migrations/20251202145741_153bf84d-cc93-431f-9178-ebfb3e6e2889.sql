-- Create clinic_payments table to track monthly payments
CREATE TABLE public.clinic_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  month date NOT NULL, -- First day of the month (e.g., 2024-01-01)
  amount numeric NOT NULL DEFAULT 0,
  doctor_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, month)
);

-- Enable RLS
ALTER TABLE public.clinic_payments ENABLE ROW LEVEL SECURITY;

-- Admin can manage all payments
CREATE POLICY "Admins can manage clinic payments"
ON public.clinic_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Clinics can view their own payments
CREATE POLICY "Clinics can view own payments"
ON public.clinic_payments
FOR SELECT
USING (clinic_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_clinic_payments_updated_at
BEFORE UPDATE ON public.clinic_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();