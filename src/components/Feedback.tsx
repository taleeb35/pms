import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, MessageSquareHeart, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// In-app feedback. Answers go to the app_feedback table; admins see them under Admin → Feedback.
const portalOf = (path: string) => ["/doctor-receptionist", "/receptionist", "/doctor", "/clinic"].find((b) => path.startsWith(b + "/")) || "";
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

async function send(row: { kind: string; score?: number | null; message?: string | null; page: string }) {
  return (supabase as any).from("app_feedback").insert({ ...row, portal: portalOf(row.page) || null });
}

// Asked on the dashboard once an account is 14+ days old, at most every 90 days. "Not now" hides it for 30 days.
const SNOOZE = "zonoir_nps_snooze_until";
export function NpsPrompt() {
  const { toast } = useToast();
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const until = Number(read(SNOOZE) || 0);
      if (until > Date.now()) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.created_at || Date.now() - new Date(user.created_at).getTime() < 14 * 864e5) return;
      const since = new Date(Date.now() - 90 * 864e5).toISOString();
      const { data, error } = await (supabase as any).from("app_feedback").select("id").eq("user_id", user.id).eq("kind", "nps").gte("created_at", since).limit(1);
      if (!error && !(data || []).length) setShow(true);
    })();
  }, []);

  if (!show) return null;
  const snooze = () => { write(SNOOZE, String(Date.now() + 30 * 864e5)); setShow(false); };
  const submit = async () => {
    if (score === null) return;
    setBusy(true);
    const { error } = await send({ kind: "nps", score, message: msg.trim() || null, page: pathname });
    setBusy(false);
    if (error) { toast({ title: "Could not send", description: error.message, variant: "destructive" }); return; }
    write(SNOOZE, String(Date.now() + 90 * 864e5));
    setDone(true);
    setTimeout(() => setShow(false), 2500);
  };

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        {done ? <p className="text-sm font-medium">Thank you, your answer was sent.</p> : (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">How likely are you to recommend Zonoir to another doctor?</p>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={snooze} aria-label="Not now"><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Score from 0 to 10">
              {Array.from({ length: 11 }, (_, n) => (
                <button key={n} type="button" role="radio" aria-checked={score === n} onClick={() => setScore(n)}
                  className={`h-9 w-9 rounded-md border text-sm font-medium tabular-nums transition-colors ${score === n ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>{n}</button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground max-w-[27rem]"><span>Not likely</span><span>Very likely</span></div>
            {score !== null && (
              <>
                <Textarea rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={4000}
                  placeholder={score >= 9 ? "What do you like most? (optional)" : "What would make it better? (optional)"} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}</Button>
                  <Button size="sm" variant="ghost" onClick={snooze}>Not now</Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// "Send feedback": an idea, a problem, or anything else. Opened from the What's new panel.
export function FeedbackDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const { pathname } = useLocation();
  const [kind, setKind] = useState<"idea" | "problem" | "other">("idea");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    const { error } = await send({ kind, message: msg.trim(), page: pathname });
    setBusy(false);
    if (error) { toast({ title: "Could not send", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Thank you", description: "Your feedback was sent to the Zonoir team." });
    setMsg(""); onOpenChange(false);
  };
  const kinds: [typeof kind, string][] = [["idea", "Idea or request"], ["problem", "Something's wrong"], ["other", "Other"]];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageSquareHeart className="h-5 w-5" /> Send feedback</DialogTitle>
          <DialogDescription>Tell the Zonoir team what you'd like added or what isn't working. For urgent help, use Support.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {kinds.map(([k, l]) => (
            <Button key={k} type="button" size="sm" variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>{l}</Button>
          ))}
        </div>
        <Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={4000} placeholder="Write here…" aria-label="Feedback" />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !msg.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
