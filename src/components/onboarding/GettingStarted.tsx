import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ChevronRight, X, Rocket, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Onboarding: a welcome screen on the first visit and a checklist on the dashboard
// that ticks itself off from real data. Hidden once complete or dismissed.
type Role = "doctor" | "clinic";
type Step = { key: string; title: string; hint: string; to: string; done: boolean; optional?: boolean };

const count = async (q: any) => { const { count: c } = await q; return c || 0; };
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

async function loadSteps(role: Role, uid: string): Promise<Step[]> {
  const head = { count: "exact" as const, head: true };
  if (role === "doctor") {
    const [{ data: doc }, schedules, patients, appts, receps, factors] = await Promise.all([
      supabase.from("doctors").select("consultation_fee, specialization").eq("id", uid).maybeSingle(),
      count(supabase.from("doctor_schedules").select("id", head).eq("doctor_id", uid).eq("is_available", true)),
      count(supabase.from("patients").select("id", head)),
      count(supabase.from("appointments").select("id", head).eq("doctor_id", uid)),
      count(supabase.from("doctor_receptionists").select("id", head).eq("doctor_id", uid)),
      supabase.auth.mfa.listFactors().then(({ data }) => (data?.totp || []).filter((f: any) => f.status === "verified").length),
    ]);
    return [
      { key: "profile", title: "Complete your profile and fee", hint: "Specialization, consultation fee, country and currency.", to: "/doctor/profile", done: !!(doc?.specialization && Number(doc?.consultation_fee) > 0) },
      { key: "schedule", title: "Set your weekly schedule", hint: "Days and hours you see patients, so booking only offers free slots.", to: "/doctor/schedule", done: schedules > 0 },
      { key: "patient", title: "Add your first patient", hint: "Only name, phone, date of birth and gender are needed.", to: "/doctor/patients", done: patients > 0 },
      { key: "appointment", title: "Book your first appointment", hint: "Pick a patient and a time slot.", to: "/doctor/appointments", done: appts > 0 },
      { key: "receptionist", title: "Add a receptionist", hint: "Let your front desk book and check in patients. Staff accounts are free.", to: "/doctor/receptionists", done: receps > 0, optional: true },
      { key: "security", title: "Turn on two-factor login", hint: "Protect patient records with a code from your phone.", to: "/doctor/profile", done: factors > 0, optional: true },
    ];
  }
  const { data: docs } = await supabase.from("doctors").select("id").eq("clinic_id", uid);
  const ids = (docs || []).map((d: any) => d.id);
  const [schedules, receps, patients, appts, { data: clinic }] = await Promise.all([
    ids.length ? count(supabase.from("doctor_schedules").select("id", head).in("doctor_id", ids).eq("is_available", true)) : Promise.resolve(0),
    count(supabase.from("clinic_receptionists").select("id", head).eq("clinic_id", uid)),
    count(supabase.from("patients").select("id", head)),
    ids.length ? count(supabase.from("appointments").select("id", head).in("doctor_id", ids)) : Promise.resolve(0),
    supabase.from("clinics").select("phone_number, address").eq("id", uid).maybeSingle(),
  ]);
  return [
    { key: "doctors", title: "Add your doctors", hint: "Each doctor gets their own login, schedule and fee.", to: "/clinic/add-doctor", done: ids.length > 0 },
    { key: "schedules", title: "Set doctor schedules", hint: "Working days and hours for each doctor.", to: "/clinic/schedules", done: schedules > 0 },
    { key: "receptionist", title: "Add a receptionist", hint: "Your front desk can book, check in and bill. Staff accounts are free.", to: "/clinic/receptionists", done: receps > 0 },
    { key: "patient", title: "Add your first patient", hint: "Only name, phone, date of birth and gender are needed.", to: "/clinic/patients", done: patients > 0 },
    { key: "appointment", title: "Book your first appointment", hint: "Choose a doctor, a patient and a time slot.", to: "/clinic/appointments", done: appts > 0 },
    { key: "profile", title: "Check clinic details, country and currency", hint: "Phone, address, currency and timezone used across your account.", to: "/clinic/profile", done: !!(clinic?.phone_number && clinic?.address), optional: true },
  ];
}

export const GettingStarted = ({ role }: { role: Role }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id; if (!id || !alive) return;
      setUid(id);
      setDismissed(store.get(`zonoir.onboarding.hidden.${id}`) === "1");
      const s = await loadSteps(role, id).catch(() => null);
      if (!alive || !s) return;
      setSteps(s);
      const required = s.filter((x) => !x.optional);
      if (store.get(`zonoir.onboarding.welcomed.${id}`) !== "1" && required.filter((x) => x.done).length <= 1) setWelcomeOpen(true);
    });
    return () => { alive = false; };
  }, [role]);

  const required = useMemo(() => (steps || []).filter((s) => !s.optional), [steps]);
  const doneCount = (steps || []).filter((s) => s.done).length;
  const allRequiredDone = required.length > 0 && required.every((s) => s.done);
  const next = (steps || []).find((s) => !s.done);

  const closeWelcome = () => { if (uid) store.set(`zonoir.onboarding.welcomed.${uid}`, "1"); setWelcomeOpen(false); };
  const hide = () => { if (uid) store.set(`zonoir.onboarding.hidden.${uid}`, "1"); setDismissed(true); };

  if (!steps) return null;

  return (
    <>
      <Dialog open={welcomeOpen} onOpenChange={(o) => { if (!o) closeWelcome(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Welcome to Zonoir</DialogTitle>
            <DialogDescription>Here's how to get your {role === "clinic" ? "clinic" : "practice"} running. It takes about 10 minutes.</DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            {required.map((s, i) => (
              <li key={s.key} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                <div><p className="text-sm font-medium">{s.title}</p><p className="text-xs text-muted-foreground">{s.hint}</p></div>
              </li>
            ))}
          </ol>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={closeWelcome}>I'll explore first</Button>
            {next && <Button asChild onClick={closeWelcome}><Link to={next.to}>Start: {next.title}</Link></Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!dismissed && !(allRequiredDone && steps.every((s) => s.done)) && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {allRequiredDone ? <PartyPopper className="h-5 w-5 text-primary" /> : <Rocket className="h-5 w-5 text-primary" />}
                  {allRequiredDone ? "You're all set up" : "Get started with Zonoir"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {allRequiredDone ? "The essentials are done. A couple of optional steps remain." : `${doneCount} of ${steps.length} steps done`}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Hide getting started checklist" onClick={hide}><X className="h-4 w-4" /></Button>
            </div>
            <Progress value={(doneCount / steps.length) * 100} className="h-2" />
            <ul className="grid gap-2 sm:grid-cols-2">
              {steps.map((s) => (
                <li key={s.key}>
                  <Link to={s.to} className={`group flex items-start gap-3 rounded-lg border bg-background/60 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5 ${s.done ? "opacity-70" : ""}`}>
                    {s.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-medium ${s.done ? "line-through" : ""}`}>{s.title}{s.optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}</span>
                      <span className="block text-xs text-muted-foreground">{s.hint}</span>
                    </span>
                    {!s.done && <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default GettingStarted;
