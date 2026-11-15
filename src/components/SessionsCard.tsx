import { useEffect, useState } from "react";
import { MonitorSmartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getIdleLogoutEnabled, setIdleLogoutEnabled, IDLE_LOGOUT_MINUTES } from "@/lib/idleLogout";

// H2: signed-in devices, sign out of one or all, and optional sign-out after inactivity (this device).
type Session = { id: string; created_at: string; last_active: string | null; user_agent: string | null; ip: string | null; is_current: boolean };

const describeDevice = (ua?: string | null) => {
  if (!ua) return "Unknown device";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iOS/.test(ua) ? "iPhone / iPad"
    : /Mac OS X|Macintosh/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari" : "App";
  return `${browser} on ${os}`;
};

const SessionsCard = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [idle, setIdle] = useState(getIdleLogoutEnabled());

  const load = async () => {
    const { data } = await supabase.rpc("get_my_sessions" as any);
    setSessions((data as Session[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const endSession = async (id: string) => {
    const { error } = await supabase.rpc("revoke_my_session" as any, { p_session_id: id });
    if (error) { toast({ title: "Could not sign out that device", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Device signed out", description: "It will be logged out within the hour." });
    load();
  };

  const signOutOthers = async () => {
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) { toast({ title: "Could not sign out other devices", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Signed out everywhere else" });
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MonitorSmartphone className="h-5 w-5" /> Signed-in devices</CardTitle>
        <CardDescription>Devices where your account is signed in. Sign out any you don't recognise.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-2">
            {sessions.length === 0 && <p className="text-sm text-muted-foreground">No other sessions found.</p>}
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{describeDevice(s.user_agent)}{s.is_current && <span className="ml-2 text-xs text-primary">This device</span>}</p>
                  <p className="text-xs text-muted-foreground">
                    Last active {s.last_active ? new Date(s.last_active).toLocaleString() : "unknown"}{s.ip ? ` · IP ${s.ip}` : ""}
                  </p>
                </div>
                {!s.is_current && <Button variant="outline" size="sm" onClick={() => endSession(s.id)}>Sign out</Button>}
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={signOutOthers} disabled={sessions.filter((s) => !s.is_current).length === 0}>
          Sign out all other devices
        </Button>
        <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-3">
          <Label htmlFor="idle-logout" className="text-sm font-normal">
            Sign me out on this device after {IDLE_LOGOUT_MINUTES} minutes without activity
          </Label>
          <Switch id="idle-logout" checked={idle} onCheckedChange={(v) => { setIdle(v); setIdleLogoutEnabled(v); }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsCard;
