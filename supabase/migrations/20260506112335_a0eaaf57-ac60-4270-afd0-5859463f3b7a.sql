
CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android','ios','web')),
  device_info JSONB,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user ON public.device_push_tokens(user_id);

ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own device tokens"
  ON public.device_push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own device tokens"
  ON public.device_push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own device tokens"
  ON public.device_push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own device tokens"
  ON public.device_push_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_device_push_tokens_updated_at
  BEFORE UPDATE ON public.device_push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
