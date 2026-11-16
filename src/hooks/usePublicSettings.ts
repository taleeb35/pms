import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Public, non-secret settings (support contact, published fee, feature switches), fetched once per page load.
let cache: Promise<Record<string, string>> | null = null;
export const loadPublicSettings = () => {
  if (!cache) {
    cache = Promise.resolve(supabase.rpc("get_public_settings" as any))
      .then(({ data }: any) => (data as Record<string, string>) || {})
      .catch(() => ({}));
  }
  return cache;
};

export function usePublicSettings() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  useEffect(() => { let alive = true; loadPublicSettings().then((s) => alive && setSettings(s)); return () => { alive = false; }; }, []);
  return settings;
}

/** AI tools stay hidden until an AI key is configured and the "ai_enabled" setting is turned on. */
export function useAiEnabled(): boolean {
  const s = usePublicSettings();
  return s?.ai_enabled === "true";
}
