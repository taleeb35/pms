import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Copy, Loader2, MessageCircle, Printer, Ban, Plus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { whatsappLink } from "@/lib/phoneLinks";
import { friendlyDate, friendlyTime } from "@/lib/datetime";
import { DEFAULT_CONSENT, INTAKE_QUESTIONS, intakeUrl, newAllergies, visitDay } from "@/lib/intake";

// Pre-visit intake form for one appointment: send the link, see the answers and signed consent.
type Props = {
  appointmentId: string;
  doctorId: string;
  appointmentDate?: string;
  appointmentTime?: string;
  patient: { id: string; full_name: string; phone?: string | null; allergies?: string | null };
};
type Form = {
  id: string; token: string; status: "sent" | "completed" | "cancelled"; answers: Record<string, string> | null;
  consent_text: string | null; signed_name: string | null; signature: string | null; signed_at: string | null;
  expires_at: string; created_at: string;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export default function IntakeFormCard({ appointmentId, doctorId, appointmentDate, appointmentTime, patient }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [allergies, setAllergies] = useState<string | null | undefined>(patient.allergies);

  const load = useCallback(async () => {
    const { data } = await (supabase as any).from("intake_forms")
      .select("id, token, status, answers, consent_text, signed_name, signature, signed_at, expires_at, created_at")
      .eq("appointment_id", appointmentId).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1);
    setForm(((data || [])[0] as Form) || null);
    setLoading(false);
  }, [appointmentId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setAllergies(patient.allergies); }, [patient.allergies]);

  const create = async () => {
    setBusy(true);
    const { data: doc } = await supabase.from("doctors").select("intake_consent_text").eq("id", doctorId).maybeSingle();
    const consent = ((doc as any)?.intake_consent_text || "").trim() || DEFAULT_CONSENT;
    const { error } = await (supabase as any).from("intake_forms").insert({
      doctor_id: doctorId, patient_id: patient.id, appointment_id: appointmentId, consent_text: consent,
    });
    setBusy(false);
    if (error) { toast({ title: "Could not create the form", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Intake form ready", description: "Copy the link or send it on WhatsApp." });
    void load();
  };

  const cancel = async () => {
    if (!form || !confirm("Cancel this intake form? The link will stop working.")) return;
    const { error } = await (supabase as any).from("intake_forms").update({ status: "cancelled" }).eq("id", form.id);
    if (error) { toast({ title: "Could not cancel", description: error.message, variant: "destructive" }); return; }
    void load();
  };

  const copy = async () => {
    if (!form) return;
    try { await navigator.clipboard.writeText(intakeUrl(form.token)); toast({ title: "Link copied" }); }
    catch { toast({ title: "Could not copy", description: intakeUrl(form.token) }); }
  };

  const addAllergies = async () => {
    const add = newAllergies(form?.answers?.allergies, allergies);
    if (!add) return;
    const next = allergies?.trim() ? `${allergies.trim()}, ${add}` : add;
    const { error } = await supabase.from("patients").update({ allergies: next }).eq("id", patient.id);
    if (error) { toast({ title: "Could not update allergies", description: error.message, variant: "destructive" }); return; }
    setAllergies(next);
    toast({ title: "Allergies added to the patient record", description: add });
  };

  const print = () => {
    if (!form || form.status !== "completed") return;
    const w = window.open("", "_blank");
    if (!w) { toast({ title: "Allow pop-ups to print", variant: "destructive" }); return; }
    const rows = INTAKE_QUESTIONS.map((q) => `<tr><th>${esc(q.label)}</th><td>${esc(form.answers?.[q.key] || "-")}</td></tr>`).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Intake form - ${esc(patient.full_name)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:32px;max-width:760px}h1{font-size:20px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ccc;padding:8px;text-align:left;vertical-align:top}th{width:35%;background:#f5f5f5}
.c{margin-top:20px;font-size:14px;border:1px solid #ccc;padding:12px}.s img{max-height:90px;margin-top:8px}@media print{body{margin:16mm}}</style></head><body>
<h1>Intake form: ${esc(patient.full_name)}</h1>
<p>${appointmentDate ? `Visit ${esc(friendlyDate(appointmentDate))}${appointmentTime ? ` at ${esc(friendlyTime(appointmentTime))}` : ""}` : ""}</p>
<table>${rows}</table>
<div class="c"><b>Consent</b><p>${esc(form.consent_text || "")}</p>
<div class="s">Signed by ${esc(form.signed_name || "")} on ${esc(format(new Date(form.signed_at!), "d MMM yyyy, h:mm a"))}${form.signature ? `<br><img src="${form.signature}" alt="Signature">` : ""}</div></div>
<script>window.onload=function(){window.print()}</script></body></html>`);
    w.document.close();
  };

  const first = patient.full_name.split(" ")[0];
  const wa = form && form.status === "sent"
    ? whatsappLink(patient.phone, `Hello ${first}, please fill in this form before your visit${appointmentDate ? ` on ${visitDay(appointmentDate)}` : ""}: ${intakeUrl(form.token)}`)
    : null;
  const expired = form && form.status === "sent" && new Date(form.expires_at) < new Date();
  const allergyAdd = form?.status === "completed" ? newAllergies(form.answers?.allergies, allergies) : "";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Intake form</span>
          {form?.status === "completed" && <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Signed</Badge>}
          {form?.status === "sent" && !expired && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Waiting</Badge>}
          {expired && <Badge variant="outline">Link expired</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : !form ? (
          <>
            <p className="text-xs text-muted-foreground">Send the patient a link to fill in their history and sign consent before the visit.</p>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={create} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1.5 h-4 w-4" /> Create intake form</>}
            </Button>
          </>
        ) : form.status === "sent" ? (
          <>
            <p className="text-xs text-muted-foreground">
              {expired ? "The link has expired. Cancel it and create a new one." : `The patient has not filled it in yet. The link works until ${friendlyDate(form.expires_at.slice(0, 10))}.`}
            </p>
            {!expired && (
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copy}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy link</Button>
                {wa ? (
                  <Button type="button" variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400" asChild>
                    <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp</a>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled title="Add a valid phone number to the patient">WhatsApp</Button>
                )}
              </div>
            )}
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={cancel}><Ban className="mr-1 h-3.5 w-3.5" /> Cancel form</Button>
          </>
        ) : (
          <>
            <dl className="space-y-2 text-sm">
              {INTAKE_QUESTIONS.filter((q) => form.answers?.[q.key]).map((q) => (
                <div key={q.key}>
                  <dt className="text-xs text-muted-foreground">{q.label}</dt>
                  <dd className="whitespace-pre-wrap">{form.answers![q.key]}</dd>
                </div>
              ))}
              {!INTAKE_QUESTIONS.some((q) => form.answers?.[q.key]) && <p className="text-xs text-muted-foreground">The patient left all questions empty.</p>}
            </dl>
            <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              Consent signed by <span className="font-medium text-foreground">{form.signed_name}</span> on {format(new Date(form.signed_at!), "d MMM yyyy, h:mm a")}.
            </p>
            {form.signature && <img src={form.signature} alt="Patient signature" className="h-14 rounded border bg-white p-1" />}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={print}><Printer className="mr-1.5 h-3.5 w-3.5" /> Print</Button>
              {allergyAdd && (
                <Button type="button" variant="outline" size="sm" onClick={addAllergies} title={allergyAdd}>Add allergies to record</Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
