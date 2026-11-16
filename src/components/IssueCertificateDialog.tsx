import { useEffect, useState } from "react";
import { FileBadge, Loader2, Printer, Ban } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { licLabel } from "@/lib/region";
import { withDrTitle } from "@/lib/doctorName";
import { CERT_TYPES, fillTemplate, leaveDays, printCertificate, type CertType } from "@/lib/certificates";

// Issue a sick-leave / work-leave / fitness certificate from a visit, using the doctor's saved templates.
type Props = {
  appointmentId: string; doctorId: string; visitDate: string;
  patient: { id: string; full_name: string; patient_id: string; date_of_birth?: string | null; gender?: string | null };
};
type Tpl = { id: string; template_name: string; template_content: string; kind: CertType };
type Issued = { id: string; code: string; title: string; body: string; issued_at: string; revoked_at: string | null; start_date: string | null; end_date: string | null };

const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const DEFAULT_BODY: Record<CertType, string> = {
  sick_leave: "[Patient Name], aged [Age], was seen on [Visit Date] and is advised rest from [From] to [To] ([Days] days).",
  work_leave: "[Patient Name], aged [Age], was seen on [Visit Date] and is advised to stay away from work from [From] to [To] ([Days] days).",
  fitness: "[Patient Name], aged [Age], was examined on [Visit Date] and found fit.",
  other: "[Patient Name], aged [Age], was seen on [Visit Date].",
};

export default function IssueCertificateDialog({ appointmentId, doctorId, visitDate, patient }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [issued, setIssued] = useState<Issued[]>([]);
  const [type, setType] = useState<CertType>("sick_leave");
  const [tplId, setTplId] = useState("");
  const [from, setFrom] = useState(visitDate);
  const [to, setTo] = useState(visitDate);
  const [title, setTitle] = useState(CERT_TYPES[0].label);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [doctor, setDoctor] = useState<{ name: string; qualification?: string; specialization?: string; licence?: string; clinicName?: string; clinicAddress?: string; clinicPhone?: string } | null>(null);

  const fill = (text: string, d = doctor) => fillTemplate(text, {
    patientName: patient.full_name, patientId: patient.patient_id, dob: patient.date_of_birth, gender: patient.gender,
    doctorName: d?.name || "", visitDate, from, to,
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [sick, work, list, doc] = await Promise.all([
        supabase.from("doctor_sick_leave_templates").select("id, template_name, template_content").eq("doctor_id", doctorId),
        supabase.from("doctor_work_leave_templates").select("id, template_name, template_content").eq("doctor_id", doctorId),
        (supabase as any).from("medical_certificates").select("id, code, title, body, issued_at, revoked_at, start_date, end_date").eq("appointment_id", appointmentId).order("issued_at", { ascending: false }),
        supabase.from("doctors").select("specialization, qualification, pmdc_number, clinic_id, clinic_address, contact_number, profiles(full_name)").eq("id", doctorId).maybeSingle(),
      ]);
      setTemplates([
        ...((sick.data || []) as any[]).map((t) => ({ ...t, kind: "sick_leave" as CertType })),
        ...((work.data || []) as any[]).map((t) => ({ ...t, kind: "work_leave" as CertType })),
      ]);
      setIssued((list.data || []) as Issued[]);
      const d: any = doc.data;
      let clinic: any = null;
      if (d?.clinic_id) clinic = (await supabase.from("clinics").select("clinic_name, address, phone_number").eq("id", d.clinic_id).maybeSingle()).data;
      const info = {
        name: withDrTitle(d?.profiles?.full_name || ""),
        qualification: d?.qualification || "", specialization: d?.specialization || "",
        licence: d?.pmdc_number ? `${licLabel()}: ${d.pmdc_number}` : "",
        clinicName: clinic?.clinic_name || "", clinicAddress: clinic?.address || d?.clinic_address || "",
        clinicPhone: clinic?.phone_number || d?.contact_number || "",
      };
      setDoctor(info);
      setBody((b) => b || fillTemplate(DEFAULT_BODY.sick_leave, { patientName: patient.full_name, dob: patient.date_of_birth, doctorName: info.name, visitDate, from: visitDate, to: visitDate }));
    })();
  }, [open, appointmentId, doctorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickType = (t: CertType) => {
    setType(t); setTplId("");
    setTitle(CERT_TYPES.find((c) => c.value === t)!.label);
    setBody(fill(DEFAULT_BODY[t]));
  };
  const pickTemplate = (id: string) => {
    setTplId(id);
    const t = templates.find((x) => x.id === id);
    if (t) { setType(t.kind); setTitle(CERT_TYPES.find((c) => c.value === t.kind)!.label); setBody(fill(t.template_content)); }
  };
  // Re-fill dates in the text when they change (only placeholders that were already replaced from the old dates stay as typed).
  const refill = () => {
    const t = templates.find((x) => x.id === tplId);
    setBody(fill(t ? t.template_content : DEFAULT_BODY[type]));
  };

  const datesNeeded = type === "sick_leave" || type === "work_leave";
  const badDates = datesNeeded && (!from || !to || to < from);

  const issue = async () => {
    if (!doctor || badDates || !body.trim()) return;
    setBusy(true);
    const { data, error } = await (supabase as any).from("medical_certificates").insert({
      doctor_id: doctorId, patient_id: patient.id, appointment_id: appointmentId, cert_type: type,
      title: title.trim() || "Medical certificate", body: body.trim(),
      start_date: datesNeeded ? from : null, end_date: datesNeeded ? to : null,
    }).select("id, code, title, body, issued_at, revoked_at, start_date, end_date").single();
    setBusy(false);
    if (error) { toast({ title: "Could not issue the certificate", description: error.message, variant: "destructive" }); return; }
    setIssued((l) => [data as Issued, ...l]);
    await print(data as Issued);
  };

  const print = async (c: Issued) => {
    if (!doctor) return;
    try {
      await printCertificate({ code: c.code, title: c.title, body: c.body, issuedAt: c.issued_at, doctorName: doctor.name,
        qualification: doctor.qualification, specialization: doctor.specialization, licence: doctor.licence,
        clinicName: doctor.clinicName, clinicAddress: doctor.clinicAddress, clinicPhone: doctor.clinicPhone });
    } catch (e: any) { toast({ title: "Could not print", description: e?.message || String(e), variant: "destructive" }); }
  };

  const revoke = async (c: Issued) => {
    if (!window.confirm(`Cancel certificate ${c.code}? Anyone who scans it will see it was cancelled.`)) return;
    const { error } = await (supabase as any).from("medical_certificates").update({ revoked_at: new Date().toISOString() }).eq("id", c.id);
    if (error) { toast({ title: "Could not cancel", description: error.message, variant: "destructive" }); return; }
    setIssued((l) => l.map((x) => (x.id === c.id ? { ...x, revoked_at: new Date().toISOString() } : x)));
    toast({ title: "Certificate cancelled", description: c.code });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FileBadge className="h-4 w-4 mr-2" /> Certificate
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate for {patient.full_name}</DialogTitle>
            <DialogDescription>Prints with a QR code. Anyone who scans it can check that it's real and whether it was cancelled.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cert-type">Type</Label>
                <select id="cert-type" className={selectCls} value={type} onChange={(e) => pickType(e.target.value as CertType)}>
                  {CERT_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cert-tpl">Your template</Label>
                <select id="cert-tpl" className={selectCls} value={tplId} onChange={(e) => pickTemplate(e.target.value)}>
                  <option value="">{templates.length ? "Basic text" : "None saved (Templates page)"}</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.kind === "sick_leave" ? "Sick" : "Work"}: {t.template_name}</option>)}
                </select>
              </div>
            </div>
            {datesNeeded && (
              <div className="grid gap-3 sm:grid-cols-3 items-end">
                <div className="space-y-1.5"><Label htmlFor="cert-from">From</Label><Input id="cert-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} onBlur={refill} /></div>
                <div className="space-y-1.5"><Label htmlFor="cert-to">To</Label><Input id="cert-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} onBlur={refill} /></div>
                <p className="text-sm text-muted-foreground pb-2">{badDates ? "End date is before the start." : `${leaveDays(from, to)} day(s)`}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="cert-title">Heading</Label>
              <Input id="cert-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cert-body">Text</Label>
              <Textarea id="cert-body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
              <p className="text-xs text-muted-foreground">You can edit the text. Placeholders like [Patient Name], [Age], [From], [To] and [Days] are filled in for you.</p>
            </div>

            {issued.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Issued for this visit</p>
                {issued.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{c.title}</span> <span className="text-muted-foreground">· {c.code} · {format(new Date(c.issued_at), "d MMM yyyy")}</span>
                      {c.revoked_at && <span className="ml-2 text-destructive">Cancelled</span>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => print(c)}><Printer className="h-4 w-4" /></Button>
                      {!c.revoked_at && <Button variant="ghost" size="sm" onClick={() => revoke(c)} title="Cancel certificate"><Ban className="h-4 w-4 text-destructive" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={issue} disabled={busy || !doctor || badDates || !body.trim()} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} Issue and print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
