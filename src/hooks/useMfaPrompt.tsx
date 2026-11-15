import { useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// H1: after a password sign-in, ask for the authenticator code when the account has two-factor login on.
// Returns [ensureMfa, dialog]. ensureMfa() resolves true when no code is needed or the code was accepted.
export function useMfaPrompt(): [() => Promise<boolean>, ReactNode] {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const ensureMfa = async (): Promise<boolean> => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!data || data.nextLevel !== "aal2" || data.currentLevel === "aal2") return true;
    const { data: f } = await supabase.auth.mfa.listFactors();
    const factor = (f?.totp || []).find((x: any) => x.status === "verified");
    if (!factor) return true;
    setCode(""); setError(""); setFactorId(factor.id);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  };

  const finish = (ok: boolean) => {
    setFactorId(null);
    resolver.current?.(ok);
    resolver.current = null;
  };

  const verify = async () => {
    if (!factorId) return;
    setBusy(true);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    setBusy(false);
    if (err) { setError("That code didn't work. Enter the current 6-digit code from your app."); return; }
    finish(true);
  };

  const dialog = (
    <Dialog open={!!factorId} onOpenChange={(open) => { if (!open) finish(false); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your login code</DialogTitle>
          <DialogDescription>Open your authenticator app and enter the 6-digit code for Zonoir.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); verify(); }} className="space-y-3">
          <Input id="mfa-login-code" autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="font-mono tracking-widest text-lg" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => finish(false)}>Cancel</Button>
            <Button type="submit" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Verify"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return [ensureMfa, dialog];
}
