-- Add visit_records table for comprehensive patient visits
CREATE TABLE IF NOT EXISTS public.visit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Vitals
  blood_pressure TEXT,
  temperature TEXT,
  pulse TEXT,
  weight TEXT,
  height TEXT,
  
  -- Medical Information
  chief_complaint TEXT,
  patient_history TEXT,
  current_prescription TEXT,
  test_reports TEXT,
  
  -- Follow-up
  next_visit_date DATE,
  next_visit_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visit_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view their visit records"
  ON public.visit_records FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Doctors can create visit records"
  ON public.visit_records FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Doctors can update visit records"
  ON public.visit_records FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR doctor_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_visit_records_updated_at
  BEFORE UPDATE ON public.visit_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_visit_records_patient ON public.visit_records(patient_id);
CREATE INDEX idx_visit_records_doctor ON public.visit_records(doctor_id);
CREATE INDEX idx_visit_records_appointment ON public.visit_records(appointment_id);

COMMENT ON TABLE public.visit_records IS 'Comprehensive patient visit records with vitals, prescriptions, and follow-up information';