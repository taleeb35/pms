import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, HelpCircle, Loader2, Eraser } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { friendlyTime } from "@/lib/datetime";
import { INTAKE_QUESTIONS, cleanAnswers, visitDay, whoLabel } from "@/lib/intake";

// Public page the patient opens from the link: answer a few questions and sign consent. No sign-in.
type Info = {
  found: boolean; status?: string; expired?: boolean; patient?: string; doctor?: string | null; clinic?: string | null;
  appointment_date?: string | null; appointment_time?: string | null; consent_text?: string | null;
};

const ERRORS: Record<string, string> = {
  already_done: "This form has already been filled in.",
  expired: "This link has expired. Please ask the clinic for a new one.",
  not_found: "This link is not valid. Please ask the clinic for a new one.",
  name_required: "Please type your full name to sign.",
};

export default function IntakeForm() {
  const { token = "" } = useParams();
  const [info, setInfo] = useState<Info | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    document.title = "Before your visit | Zonoir";
    (async () => {
      const { data, error } = await (supabase as any).rpc("get_intake_form", { p_token: token });
      if (error) setLoadErr(true); else setInfo(data as Info);
    })();
  }, [token]);

  // Size the signature pad to its box (sharp on phones).
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr); ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#111";
  }, [info]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext("2d")!; const p = pos(e);
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d")!; const p = pos(e);
    ctx.lineTo(p.x, p.y); ctx.stroke(); setSigned(true);
  };
  const up = () => { drawing.current = false; };
  const clearSig = () => {
    const c = canvas.current; if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height); setSigned(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!agree) { setErr("Please tick the box to agree."); return; }
    if (name.trim().length < 2) { setErr(ERRORS.name_required); return; }
    setBusy(true);
    const signature = signed && canvas.current ? canvas.current.toDataURL("image/png") : null;
    const { data, error } = await (supabase as any).rpc("submit_intake_form", {
      p_token: token, p_answers: cleanAnswers(answers), p_signed_name: name.trim(), p_signature: signature,
    });
    setBusy(false);
    if (error) { setErr("Could not send right now. Please try again."); return; }
    if (!data?.ok) { setErr(ERRORS[data?.error] || "Could not send. Please check the form and try again."); return; }
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  const who = whoLabel(info?.doctor, info?.clinic);

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-6 sm:py-10">
      <Card className="mx-auto w-full max-w-xl">
        <CardContent className="space-y-5 p-5 sm:p-7">
          {!info && !loadErr && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
          {loadErr && <p className="text-destructive">Could not load the form right now. Please try again.</p>}

          {info && (!info.found || info.status === "cancelled") && (
            <div className="flex items-start gap-3"><HelpCircle className="h-7 w-7 shrink-0 text-amber-500" />
              <div><p className="text-lg font-semibold">Link not valid</p><p className="text-sm text-muted-foreground">{ERRORS.not_found}</p></div></div>
          )}

          {info?.found && info.status !== "cancelled" && (done || info.status === "completed") && (
            <div className="flex items-start gap-3"><CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
              <div>
                <p className="text-lg font-semibold">{done ? "Thank you" : "Already filled in"}</p>
                <p className="text-sm text-muted-foreground">{done ? `Your answers have been sent${who ? ` to ${who}` : ""}.` : ERRORS.already_done}</p>
              </div></div>
          )}

          {info?.found && info.status === "sent" && !done && info.expired && (
            <div className="flex items-start gap-3"><HelpCircle className="h-7 w-7 shrink-0 text-amber-500" />
              <div><p className="text-lg font-semibold">Link expired</p><p className="text-sm text-muted-foreground">{ERRORS.expired}</p></div></div>
          )}

          {info?.found && info.status === "sent" && !done && !info.expired && (
            <form className="space-y-5" onSubmit={submit}>
              <div>
                <h1 className="text-xl font-semibold">Hello {info.patient}</h1>
                <p className="text-sm text-muted-foreground">
                  Please fill in this form before your visit{who ? ` with ${who}` : ""}
                  {info.appointment_date ? ` on ${visitDay(info.appointment_date)}${info.appointment_time ? ` at ${friendlyTime(info.appointment_time)}` : ""}` : ""}.
                  Leave out anything that does not apply.
                </p>
              </div>

              {INTAKE_QUESTIONS.map((q) => (
                <div key={q.key} className="space-y-1.5">
                  <Label htmlFor={`q-${q.key}`}>{q.label}</Label>
                  <Textarea id={`q-${q.key}`} rows={q.rows} maxLength={2000} value={answers[q.key] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })} />
                </div>
              ))}

              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">Consent</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{info.consent_text}</p>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                  <span>I have read this and I agree.</span>
                </label>
                <div className="space-y-1.5">
                  <Label htmlFor="sig-name">Your full name</Label>
                  <Input id="sig-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Sign here (optional)</Label>
                    {signed && <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearSig}><Eraser className="mr-1 h-3.5 w-3.5" /> Clear</Button>}
                  </div>
                  <canvas ref={canvas} className="h-32 w-full touch-none rounded-md border bg-white"
                    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} aria-label="Signature pad" />
                </div>
              </div>

              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
