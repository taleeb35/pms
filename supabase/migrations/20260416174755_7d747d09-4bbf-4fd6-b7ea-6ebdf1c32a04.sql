
-- Create chatbot_leads table to capture user info from the doctor finder chat
CREATE TABLE public.chatbot_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'doctor_finder_chat',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous public visitors) can insert leads
CREATE POLICY "Anyone can submit chatbot leads"
ON public.chatbot_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read leads
CREATE POLICY "Admins can view all chatbot leads"
ON public.chatbot_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete leads
CREATE POLICY "Admins can delete chatbot leads"
ON public.chatbot_leads
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_chatbot_leads_created_at ON public.chatbot_leads(created_at DESC);
CREATE INDEX idx_chatbot_leads_phone ON public.chatbot_leads(phone);
