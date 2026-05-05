CREATE TABLE public.doctor_calendar_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  due_time TIME,
  priority TEXT NOT NULL DEFAULT 'medium',
  color TEXT NOT NULL DEFAULT 'blue',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_calendar_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own calendar tasks"
ON public.doctor_calendar_tasks
FOR ALL
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE INDEX idx_doctor_calendar_tasks_doctor_date ON public.doctor_calendar_tasks(doctor_id, due_date);

CREATE TRIGGER trg_doctor_calendar_tasks_updated_at
BEFORE UPDATE ON public.doctor_calendar_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();