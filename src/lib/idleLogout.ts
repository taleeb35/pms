import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// H2: optional automatic sign-out after inactivity, chosen per device (off by default,
// because the app also runs as an installed app where staying signed in is expected).
export const IDLE_LOGOUT_MINUTES = 30;
const KEY = "zonoir.idleLogout";
const LAST = "zonoir.lastActivity";

export const getIdleLogoutEnabled = (): boolean => {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
};
export const setIdleLogoutEnabled = (on: boolean) => {
  try { on ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); localStorage.setItem(LAST, String(Date.now())); } catch { /* storage blocked */ }
};

/** Mount once in the app. Shared across tabs through localStorage. */
export function useIdleLogout() {
  useEffect(() => {
    const touch = () => { try { localStorage.setItem(LAST, String(Date.now())); } catch { /* ignore */ } };
    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    let lastWrite = 0;
    const onActivity = () => { const now = Date.now(); if (now - lastWrite > 15000) { lastWrite = now; touch(); } };
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    touch();
    const timer = window.setInterval(async () => {
      if (!getIdleLogoutEnabled()) return;
      let last = Date.now();
      try { last = Number(localStorage.getItem(LAST)) || Date.now(); } catch { /* ignore */ }
      if (Date.now() - last < IDLE_LOGOUT_MINUTES * 60 * 1000) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await supabase.auth.signOut({ scope: "local" });
      window.location.href = "/login?reason=idle";
    }, 60 * 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(timer);
    };
  }, []);
}

/** Mount once inside the router. */
export const IdleLogoutWatcher = () => { useIdleLogout(); return null; };
