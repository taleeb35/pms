-- Create ticket messages table for threaded conversations
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('doctor', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Doctors can view messages for their tickets
CREATE POLICY "Doctors can view messages for their tickets"
ON public.ticket_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = ticket_messages.ticket_id
    AND support_tickets.doctor_id = auth.uid()
  )
);

-- Doctors can create messages for their tickets
CREATE POLICY "Doctors can create messages for their tickets"
ON public.ticket_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_role = 'doctor' AND
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = ticket_messages.ticket_id
    AND support_tickets.doctor_id = auth.uid()
  )
);

-- Admins can view all ticket messages
CREATE POLICY "Admins can view all ticket messages"
ON public.ticket_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create messages on any ticket
CREATE POLICY "Admins can create messages on any ticket"
ON public.ticket_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_role = 'admin' AND
  has_role(auth.uid(), 'admin'::app_role)
);