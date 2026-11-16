import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

// Public page opened by scanning a certificate's QR code. Shows only what's needed to trust it.
type Result = { found: boolean; valid?: boolean; title?: string; start_date?: string | null; end_date?: string | null; issued_at?: string; patient?: string; doctor?: string; clinic?: string | null };
const d = (v?: string | null) => (v ? format(parseISO(v), "d MMM yyyy") : "");

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

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Certificate no. <span className="font-mono">{code.toUpperCase()}</span></p>
          {!r && !err && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</div>}
          {err && <p className="text-destructive">Could not check right now. Please try again.</p>}
          {r && !r.found && (
            <div className="flex items-start gap-3"><HelpCircle className="h-7 w-7 text-amber-500 shrink-0" />
              <div><p className="text-lg font-semibold">Not found</p><p className="text-sm text-muted-foreground">No certificate has this number. Check the number, or contact the doctor who issued it.</p></div></div>
          )}
          {r && r.found && (
            <>
              <div className="flex items-start gap-3">
                {r.valid ? <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" /> : <XCircle className="h-7 w-7 text-destructive shrink-0" />}
                <div>
                  <p className="text-lg font-semibold">{r.valid ? "Valid certificate" : "Cancelled by the doctor"}</p>
                  <p className="text-sm text-muted-foreground">{r.title}</p>
                </div>
              </div>
              <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Patient</dt><dd>{r.patient}</dd>
                {r.start_date && <><dt className="text-muted-foreground">Dates</dt><dd>{d(r.start_date)}{r.end_date && r.end_date !== r.start_date ? ` to ${d(r.end_date)}` : ""}</dd></>}
                <dt className="text-muted-foreground">Issued</dt><dd>{r.issued_at ? format(new Date(r.issued_at), "d MMM yyyy") : ""}</dd>
                <dt className="text-muted-foreground">Doctor</dt><dd>{r.doctor}</dd>
                {r.clinic && <><dt className="text-muted-foreground">Clinic</dt><dd>{r.clinic}</dd></>}
              </dl>
              <p className="text-xs text-muted-foreground">Compare these details with the paper certificate.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
