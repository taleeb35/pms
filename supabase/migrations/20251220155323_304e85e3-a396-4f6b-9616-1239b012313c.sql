-- Create table for doctor weekly schedules
CREATE TABLE public.doctor_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  is_available BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, day_of_week)
);

-- Create table for doctor leaves (specific dates off)
CREATE TABLE public.doctor_leaves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  leave_date DATE NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'full_day', -- full_day, half_day_morning, half_day_evening
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, leave_date)
);

-- Enable RLS
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_leaves ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctor_schedules
CREATE POLICY "Doctors can manage own schedules"
  ON public.doctor_schedules
  FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Clinics can view their doctors schedules"
  ON public.doctor_schedules
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.id = doctor_schedules.doctor_id
    AND d.clinic_id = auth.uid()
  ));

CREATE POLICY "Receptionists can view clinic doctors schedules"
  ON public.doctor_schedules
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clinic_receptionists cr
    JOIN doctors d ON d.clinic_id = cr.clinic_id
    WHERE cr.user_id = auth.uid()
    AND d.id = doctor_schedules.doctor_id
  ));

-- RLS policies for doctor_leaves
CREATE POLICY "Doctors can manage own leaves"
  ON public.doctor_leaves
  FOR ALL
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Clinics can view their doctors leaves"
  ON public.doctor_leaves
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.id = doctor_leaves.doctor_id
    AND d.clinic_id = auth.uid()
  ));

CREATE POLICY "Receptionists can view clinic doctors leaves"
  ON public.doctor_leaves
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clinic_receptionists cr
    JOIN doctors d ON d.clinic_id = cr.clinic_id
    WHERE cr.user_id = auth.uid()
    AND d.id = doctor_leaves.doctor_id
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_doctor_schedules_updated_at
  BEFORE UPDATE ON public.doctor_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_leaves_updated_at
  BEFORE UPDATE ON public.doctor_leaves
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();