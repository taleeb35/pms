-- Add admin_email to system_settings if it doesn't exist
INSERT INTO public.system_settings (key, value)
VALUES ('admin_email', 'admin@myclinichq.com')
ON CONFLICT (key) DO NOTHING;