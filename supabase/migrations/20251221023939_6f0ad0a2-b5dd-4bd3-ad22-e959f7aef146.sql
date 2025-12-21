-- Create clinic expenses table
CREATE TABLE public.clinic_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for clinic owners
CREATE POLICY "Clinics can view own expenses"
ON public.clinic_expenses
FOR SELECT
USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can insert own expenses"
ON public.clinic_expenses
FOR INSERT
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Clinics can update own expenses"
ON public.clinic_expenses
FOR UPDATE
USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can delete own expenses"
ON public.clinic_expenses
FOR DELETE
USING (clinic_id = auth.uid());

-- RLS policies for receptionists
CREATE POLICY "Receptionists can view clinic expenses"
ON public.clinic_expenses
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_expenses.clinic_id
));

CREATE POLICY "Receptionists can insert clinic expenses"
ON public.clinic_expenses
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_expenses.clinic_id
));

CREATE POLICY "Receptionists can update clinic expenses"
ON public.clinic_expenses
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_expenses.clinic_id
));

CREATE POLICY "Receptionists can delete clinic expenses"
ON public.clinic_expenses
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() AND cr.clinic_id = clinic_expenses.clinic_id
));

-- Create trigger for updated_at
CREATE TRIGGER update_clinic_expenses_updated_at
BEFORE UPDATE ON public.clinic_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();