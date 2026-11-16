import { useEffect, useState } from "react";
import { GitMerge, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Merge a duplicate record into this patient. The patient whose page you're on is kept;
// the other one's appointments, visits, prescriptions, documents and invoices move here and it is deleted.
type P = { id: string; patient_id: string; full_name: string; phone: string | null; cnic?: string | null; date_of_birth?: string | null };
const COLS = "id, patient_id, full_name, phone, cnic, date_of_birth";
const norm = (v?: string | null) => (v || "").replace(/[\s-]/g, "");

export default function MergePatientDialog({ patient, scope, onMerged }: { patient: P; scope: "doctor" | "clinic"; onMerged: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [owners, setOwners] = useState<string[]>([]);
  const [suggested, setSuggested] = useState<P[]>([]);
  const [results, setResults] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<P | null>(null);
  const [busy, setBusy] = useState(false);

  // Whose patients may be merged: the doctor's own, or every doctor's in the clinic.
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      let ids = [user.id];
      if (scope === "clinic") {
        const { data } = await supabase.from("doctors").select("id").eq("clinic_id", user.id);
        ids = (data || []).map((d) => d.id);
      }
      setOwners(ids);
      // Likely duplicates: same phone, same ID number, or same name.
      const ors = [`full_name.ilike.${patient.full_name.replace(/[,()%]/g, " ").trim()}`];
      if (norm(patient.phone)) ors.push(`phone.eq.${norm(patient.phone)}`);
      if (norm(patient.cnic)) ors.push(`cnic.eq.${norm(patient.cnic)}`);
      const { data } = await supabase.from("patients").select(COLS).in("created_by", ids).or(ors.join(",")).neq("id", patient.id).limit(10);
      setSuggested((data || []) as P[]);
    })();
  }, [open, scope, patient]);

  useEffect(() => {
    const term = q.trim().replace(/[,()%]/g, " ");
    if (term.length < 2 || !owners.length) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from("patients").select(COLS).in("created_by", owners)
        .or(`full_name.ilike.%${term}%,phone.ilike.%${norm(term)}%,patient_id.ilike.%${term}%`).neq("id", patient.id).limit(10);
      setResults((data || []) as P[]);
    }, 250);
    return () => clearTimeout(t);
  }, [q, owners, patient.id]);

  const merge = async () => {
    if (!pick) return;
    setBusy(true);
    const { data, error } = await (supabase as any).rpc("merge_patients", { p_keep: patient.id, p_dup: pick.id });
    setBusy(false);
    if (error) { toast({ title: "Could not merge", description: error.message, variant: "destructive" }); return; }
    const m = (data || {}) as Record<string, number>;
    toast({ title: "Patients merged", description: `${pick.full_name} (${pick.patient_id}) merged in: ${m.appointments || 0} appointments and ${m.visit_records || 0} visits moved.` });
    setOpen(false); setPick(null); setQ("");
    onMerged();
  };

  const row = (p: P) => (
    <button key={p.id} type="button" onClick={() => setPick(p)}
      className={`w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted ${pick?.id === p.id ? "border-primary bg-primary/5" : ""}`}>
      <div className="font-medium">{p.full_name} <span className="text-muted-foreground font-normal">· {p.patient_id}</span></div>
      <div className="text-xs text-muted-foreground">{[p.phone, p.cnic, p.date_of_birth].filter(Boolean).join(" · ") || "No phone or ID"}</div>
    </button>
  );

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <GitMerge className="h-4 w-4" /> Merge duplicate
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setPick(null); setQ(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Merge a duplicate into {patient.full_name}</DialogTitle>
            <DialogDescription>
              Pick the duplicate record. Its appointments, visits, prescriptions, documents and invoices move to {patient.full_name} ({patient.patient_id}), empty details are filled in from it, and the duplicate is deleted.
            </DialogDescription>
          </DialogHeader>

          {!pick ? (
            <div className="space-y-3">
              {suggested.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Possible duplicates (same name, phone or ID)</p>
                  {suggested.map(row)}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name, phone or patient ID" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">{results.map(row)}</div>
              {q.trim().length >= 2 && results.length === 0 && <p className="text-sm text-muted-foreground">No other patient matches.</p>}
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Keep</div>
                <div className="font-medium">{patient.full_name} · {patient.patient_id}</div>
              </div>
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                <div className="text-xs text-muted-foreground">Merge in and delete</div>
                <div className="font-medium">{pick.full_name} · {pick.patient_id}</div>
              </div>
              <p className="text-muted-foreground">This can't be undone.</p>
            </div>
          )}

          <DialogFooter>
            {pick ? (
              <>
                <Button variant="ghost" onClick={() => setPick(null)} disabled={busy}>Back</Button>
                <Button variant="destructive" onClick={merge} disabled={busy} className="gap-2">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />} Merge
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
