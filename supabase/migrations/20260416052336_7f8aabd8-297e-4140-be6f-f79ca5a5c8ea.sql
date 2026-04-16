
-- Create video consultations table
CREATE TABLE public.video_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  room_name TEXT NOT NULL,
  room_url TEXT NOT NULL,
  patient_join_url TEXT,
  doctor_token TEXT,
  patient_token TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.video_consultations ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own video consultations
CREATE POLICY "Doctors can view own video consultations"
ON public.video_consultations
FOR SELECT
USING (
  auth.uid() = doctor_id
  OR public.is_doctor_receptionist(auth.uid(), doctor_id)
  OR public.is_receptionist_of_clinic(auth.uid(), public.get_doctor_clinic_id(doctor_id))
);

-- Doctors can update their own video consultations
CREATE POLICY "Doctors can update own video consultations"
ON public.video_consultations
FOR UPDATE
USING (
  auth.uid() = doctor_id
  OR public.is_doctor_receptionist(auth.uid(), doctor_id)
  OR public.is_receptionist_of_clinic(auth.uid(), public.get_doctor_clinic_id(doctor_id))
);

-- Authenticated users can create video consultations
CREATE POLICY "Authenticated users can create video consultations"
ON public.video_consultations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_video_consultations_updated_at
BEFORE UPDATE ON public.video_consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_video_consultations_appointment_id ON public.video_consultations(appointment_id);
CREATE INDEX idx_video_consultations_doctor_id ON public.video_consultations(doctor_id);
CREATE INDEX idx_video_consultations_status ON public.video_consultations(status);
