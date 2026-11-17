import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle, HelpCircle, Loader2, Printer, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Public certificate check. Opened by scanning the QR code, or at /verify by typing the number printed
// on the certificate. Shows the certificate as it was issued (to compare with the paper) and who issued it.
type Result = {
  found: boolean; valid?: boolean; revoked_at?: string | null; code?: string; title?: string; cert_type?: string; body?: string;
  start_date?: string | null; end_date?: string | null; days?: number | null; issued_at?: string; visit_date?: string | null;
  patient?: string; patient_ref?: string | null; patient_gender?: string | null; patient_age?: number | null;
  doctor?: string | null; doctor_specialization?: string | null; doctor_qualification?: string | null; doctor_licence?: string | null;
  clinic?: string | null; clinic_address?: string | null; clinic_phone?: string | null; clinic_city?: string | null;
};
const d = (v?: string | null) => (v ? format(parseISO(v), "d MMM yyyy") : "");
const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const cleanCode = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (<><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></>);
}

function CodeForm({ initial = "", compact = false }: { initial?: string; compact?: boolean }) {
  const navigate = useNavigate();
  const [v, setV] = useState(initial);
  const ok = cleanCode(v).length === 10;
  return (
    <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (ok) navigate(`/verify/${cleanCode(v)}`); }}>
      {!compact && <Label htmlFor="cert-code">Certificate number</Label>}
      <div className="flex gap-2">
        <Input id="cert-code" value={v} onChange={(e) => setV(cleanCode(e.target.value))} placeholder="10 letters and numbers, e.g. 25F102EE47"
          className="font-mono uppercase" autoComplete="off" inputMode="text" aria-label="Certificate number" />
        <Button type="submit" disabled={!ok}><Search className="mr-1.5 h-4 w-4" /> Check</Button>
      </div>
      <p className="text-xs text-muted-foreground">The number is printed on the certificate, next to the QR code.</p>
    </form>
  );
}

export default function VerifyCertificate() {
  const { code = "" } = useParams();
  const [r, setR] = useState<Result | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    document.title = "Check a certificate | Zonoir";
    setR(null); setErr("");
    if (!code) return;
    (async () => {
      const { data, error } = await (supabase as any).rpc("verify_certificate", { p_code: code });
      if (error) setErr(error.message); else setR(data as Result);
    })();
  }, [code]);

  const checkedAt = format(new Date(), "d MMM yyyy, h:mm a");

  return (
    <div className="min-h-screen bg-muted/40 flex items-start sm:items-center justify-center p-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-5">
          {!code && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold">Check a medical certificate</h1>
                <p className="text-sm text-muted-foreground">Scan the QR code on the certificate, or type the certificate number below.</p>
              </div>
              <CodeForm />
            </div>
          )}

          {code && <p className="text-sm text-muted-foreground">Certificate no. <span className="font-mono font-semibold text-foreground">{code.toUpperCase()}</span></p>}
          {code && !r && !err && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</div>}
          {err && <p className="text-destructive">Could not check right now. Please try again.</p>}
          {r && !r.found && (
            <div className="space-y-4">
              <div className="flex items-start gap-3"><HelpCircle className="h-7 w-7 text-amber-500 shrink-0" />
                <div><p className="text-lg font-semibold">Not found</p><p className="text-sm text-muted-foreground">No certificate has this number. Check the number on the paper and try again, or contact the doctor who issued it.</p></div></div>
              <CodeForm initial={code.toUpperCase()} compact />
            </div>
          )}

          {r && r.found && (
            <>
              <div className={`flex items-start gap-3 rounded-lg border p-4 ${r.valid ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40" : "border-destructive/30 bg-destructive/5"}`}>
                {r.valid ? <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" /> : <XCircle className="h-8 w-8 text-destructive shrink-0" />}
                <div>
                  <p className="text-lg font-semibold">{r.valid ? "Valid certificate" : "Cancelled by the doctor"}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.valid ? `Issued by ${r.doctor || "the doctor"} through Zonoir and not cancelled.` : `Cancelled on ${r.revoked_at ? format(new Date(r.revoked_at), "d MMM yyyy") : ""}. Do not accept it.`}
                  </p>
                </div>
              </div>

              {/* The certificate laid out like the printed paper, to compare side by side. */}
              <section className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Certificate as issued</h2>
                <div className="relative overflow-hidden rounded-md border bg-white p-5 text-neutral-900 shadow-sm">
                  {!r.valid && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="-rotate-12 rounded border-4 border-red-600 px-4 py-1 text-3xl font-bold text-red-600/70">CANCELLED</span></div>}
                  <div className="border-b-2 border-neutral-900 pb-2">
                    <p className="text-lg font-bold">{r.doctor}</p>
                    {[r.doctor_qualification, r.doctor_specialization].filter(Boolean).length > 0 && <p className="text-xs text-neutral-600">{[r.doctor_qualification, r.doctor_specialization].filter(Boolean).join(" · ")}</p>}
                    {r.doctor_licence && <p className="text-xs text-neutral-600">{r.doctor_licence}</p>}
                    {r.clinic && <p className="text-xs font-medium">{r.clinic}</p>}
                    {(r.clinic_address || r.clinic_phone) && <p className="text-xs text-neutral-600">{[r.clinic_address, r.clinic_city, r.clinic_phone].filter(Boolean).join(" · ")}</p>}
                  </div>
                  <p className="mt-4 text-center text-base font-bold uppercase tracking-wide">{r.title}</p>
                  {r.body && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{r.body}</p>}
                  <div className="mt-6 flex items-end justify-between gap-4 text-xs text-neutral-600">
                    <span>Issued {r.issued_at ? format(new Date(r.issued_at), "d MMM yyyy") : ""} · Certificate no. <span className="font-mono font-semibold text-neutral-900">{r.code}</span></span>
                    <span className="text-right">{r.doctor}<br />Signature and stamp</span>
                  </div>
                </div>
              </section>

              <div className="grid gap-5 sm:grid-cols-2">
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Details</h2>
                  <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                    <Row label="Issued" value={r.issued_at ? format(new Date(r.issued_at), "d MMM yyyy, h:mm a") : ""} />
                    <Row label="Visit date" value={d(r.visit_date)} />
                    <Row label="Period" value={r.start_date ? `${d(r.start_date)}${r.end_date && r.end_date !== r.start_date ? ` to ${d(r.end_date)}` : ""}` : ""} />
                    <Row label="Days" value={r.days ? String(r.days) : ""} />
                  </dl>
                </section>
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Patient</h2>
                  <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                    <Row label="Name" value={r.patient} />
                    <Row label="Age" value={r.patient_age != null ? `${r.patient_age} years` : ""} />
                    <Row label="Gender" value={cap(r.patient_gender)} />
                    <Row label="Record no. ends" value={r.patient_ref ? `…${r.patient_ref}` : ""} />
                  </dl>
                </section>
              </div>

              <section className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact the issuer</h2>
                <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  <Row label="Doctor" value={r.doctor} />
                  <Row label="Licence no." value={r.doctor_licence} />
                  <Row label="Clinic" value={r.clinic} />
                  <Row label="Address" value={[r.clinic_address, r.clinic_city].filter(Boolean).join(", ")} />
                  <Row label="Phone" value={r.clinic_phone ? <a className="text-primary underline" href={`tel:${r.clinic_phone}`}>{r.clinic_phone}</a> : ""} />
                </dl>
              </section>

              <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">How to check</p>
                <ol className="list-decimal space-y-0.5 pl-4">
                  <li>The certificate number on the paper is the same as above.</li>
                  <li>The patient's name, the dates and the text match the paper exactly.</li>
                  <li>The status says "Valid certificate".</li>
                </ol>
                <p>If anything differs, or the paper has no QR code or number, call the clinic on the number above.</p>
                <p>Checked {checkedAt}.</p>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print this check</Button>
              </div>
              <div className="border-t pt-4 print:hidden">
                <p className="mb-2 text-sm font-medium">Check another certificate</p>
                <CodeForm compact />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
