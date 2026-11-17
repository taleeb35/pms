import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle, HelpCircle, Loader2, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Public page opened by scanning a certificate's QR code. Shows what is printed on the certificate,
// so the reader can compare it line by line, plus who issued it and how to contact them.
type Result = {
  found: boolean; valid?: boolean; revoked_at?: string | null; code?: string; title?: string; cert_type?: string; body?: string;
  start_date?: string | null; end_date?: string | null; days?: number | null; issued_at?: string; visit_date?: string | null;
  patient?: string; patient_ref?: string | null; patient_gender?: string | null; patient_age?: number | null;
  doctor?: string | null; doctor_specialization?: string | null; doctor_qualification?: string | null; doctor_licence?: string | null;
  clinic?: string | null; clinic_address?: string | null; clinic_phone?: string | null; clinic_city?: string | null;
};
const d = (v?: string | null) => (v ? format(parseISO(v), "d MMM yyyy") : "");
const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (<><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></>);
}

export default function VerifyCertificate() {
  const { code = "" } = useParams();
  const [r, setR] = useState<Result | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    document.title = "Check a certificate | Zonoir";
    (async () => {
      const { data, error } = await (supabase as any).rpc("verify_certificate", { p_code: code });
      if (error) setErr(error.message); else setR(data as Result);
    })();
  }, [code]);

  const checkedAt = format(new Date(), "d MMM yyyy, h:mm a");

  return (
    <div className="min-h-screen bg-muted/40 flex items-start sm:items-center justify-center p-4 py-8">
      <Card className="w-full max-w-xl">
        <CardContent className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground">Certificate no. <span className="font-mono font-semibold text-foreground">{code.toUpperCase()}</span></p>
          {!r && !err && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</div>}
          {err && <p className="text-destructive">Could not check right now. Please try again.</p>}
          {r && !r.found && (
            <div className="flex items-start gap-3"><HelpCircle className="h-7 w-7 text-amber-500 shrink-0" />
              <div><p className="text-lg font-semibold">Not found</p><p className="text-sm text-muted-foreground">No certificate has this number. Check the number, or contact the doctor who issued it.</p></div></div>
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

              <section className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Certificate</h2>
                <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  <Row label="Type" value={r.title} />
                  <Row label="Issued" value={r.issued_at ? format(new Date(r.issued_at), "d MMM yyyy, h:mm a") : ""} />
                  <Row label="Visit date" value={d(r.visit_date)} />
                  <Row label="Period" value={r.start_date ? `${d(r.start_date)}${r.end_date && r.end_date !== r.start_date ? ` to ${d(r.end_date)}` : ""}` : ""} />
                  <Row label="Days" value={r.days ? String(r.days) : ""} />
                </dl>
                {r.body && (
                  <div className="rounded-md border bg-background p-3 text-sm whitespace-pre-wrap">{r.body}</div>
                )}
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

              <section className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Issued by</h2>
                <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  <Row label="Doctor" value={r.doctor} />
                  <Row label="Qualification" value={r.doctor_qualification} />
                  <Row label="Specialty" value={r.doctor_specialization} />
                  <Row label="Licence no." value={r.doctor_licence} />
                  <Row label="Clinic" value={r.clinic} />
                  <Row label="Address" value={[r.clinic_address, r.clinic_city].filter(Boolean).join(", ")} />
                  <Row label="Phone" value={r.clinic_phone ? <a className="text-primary underline" href={`tel:${r.clinic_phone}`}>{r.clinic_phone}</a> : ""} />
                </dl>
              </section>

              <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1">
                <p>How to check: the certificate number, patient name, dates and text above should match the paper exactly. If anything differs, or the paper has no QR code, contact the clinic using the phone number above.</p>
                <p>Checked {checkedAt}.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden"><Printer className="mr-2 h-4 w-4" /> Print this check</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
