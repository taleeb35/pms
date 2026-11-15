import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// H1: two-factor login with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password...).
type Factor = { id: string; friendly_name?: string | null; status: string; created_at: string };

const TwoFactorCard = () => {
  const { toast } = useToast();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(((data?.totp as Factor[]) || []).filter((f) => f.status === "verified"));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const start = async () => {
    setBusy(true);
    // Remove any half-finished setup first.
    const { data: all } = await supabase.auth.mfa.listFactors();
    for (const f of (all?.all || []).filter((f: any) => f.status !== "verified")) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toLocaleDateString()}` });
    setBusy(false);
    if (error || !data) { toast({ title: "Could not start setup", description: error?.message, variant: "destructive" }); return; }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setCode("");
  };

  const confirm = async () => {
    if (!enrolling) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrolling.id, code: code.trim() });
    setBusy(false);
    if (error) { toast({ title: "Code not accepted", description: "Check the 6-digit code in your app and try again.", variant: "destructive" }); return; }
    toast({ title: "Two-factor login is on", description: "You'll be asked for a code from your app when you sign in." });
    setEnrolling(null); setCode(""); load();
  };

  const remove = async (id: string) => {
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) { toast({ title: "Could not turn off", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Two-factor login is off" });
    load();
  };

  const on = factors.length > 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Two-factor login</CardTitle>
        <CardDescription>
          {on ? "On. Signing in needs your password and a code from your authenticator app."
              : "Add a code from an authenticator app to your sign-in, so a stolen password is not enough."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : enrolling ? (
          <div className="space-y-3">
            <p className="text-sm">1. Scan this QR code with your authenticator app.</p>
            <img src={enrolling.qr} alt="QR code for your authenticator app" className="h-44 w-44 rounded-md border bg-white p-2" />
            <p className="text-xs text-muted-foreground break-all">Can't scan? Enter this key: <span className="font-mono">{enrolling.secret}</span></p>
            <div className="space-y-2">
              <Label htmlFor="mfa-code">2. Enter the 6-digit code from the app</Label>
              <Input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="w-40 font-mono tracking-widest" />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirm} disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Turn on"}</Button>
              <Button variant="outline" onClick={() => { if (enrolling) supabase.auth.mfa.unenroll({ factorId: enrolling.id }); setEnrolling(null); }}>Cancel</Button>
            </div>
          </div>
        ) : on ? (
          <div className="space-y-2">
            {factors.map((f) => (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                <span>{f.friendly_name || "Authenticator app"} · added {new Date(f.created_at).toLocaleDateString()}</span>
                <Button variant="outline" size="sm" onClick={() => remove(f.id)} disabled={busy}>Turn off</Button>
              </div>
            ))}
          </div>
        ) : (
          <Button onClick={start} disabled={busy}>{busy ? "Starting…" : "Set up two-factor login"}</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorCard;
