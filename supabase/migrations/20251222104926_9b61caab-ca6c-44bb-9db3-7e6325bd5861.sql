-- Create a table for single doctor payments (doctors without clinic)
CREATE TABLE public.doctor_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  month DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, month)
);

-- Add foreign key constraint
ALTER TABLE public.doctor_payments 
  ADD CONSTRAINT doctor_payments_doctor_id_fkey 
  FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.doctor_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins
CREATE POLICY "Admins can view all doctor payments" 
ON public.doctor_payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert doctor payments" 
ON public.doctor_payments 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update doctor payments" 
ON public.doctor_payments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete doctor payments" 
ON public.doctor_payments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Doctors can view their own payments
CREATE POLICY "Doctors can view own payments" 
ON public.doctor_payments 
FOR SELECT 
USING (doctor_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_doctor_payments_updated_at
BEFORE UPDATE ON public.doctor_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();