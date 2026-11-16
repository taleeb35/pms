import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { EyeOff, Eye, Maximize, Minimize, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { withDrTitle } from "@/lib/doctorName";
import { assignTokens, shortName } from "@/lib/queue";

// Waiting-room screen for a TV or tablet: today's queue with token numbers, refreshed every 15 seconds.
// Works for a doctor, a clinic owner, and both kinds of receptionist (it finds which doctors to show).
type Row = { id: string; doctor_id: string; appointment_time: string | null; created_at: string; status: string; patients?: { full_name?: string | null } | null };
type Doc = { id: string; name: string };

const REFRESH_MS = 15000;

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

async function findDoctors(uid: string): Promise<string[]> {
  const [{ data: doc }, { data: clinic }, { data: cr }, { data: dr }] = await Promise.all([
    supabase.from("doctors").select("id, clinic_id").eq("id", uid).maybeSingle(),
    supabase.from("clinics").select("id").eq("id", uid).maybeSingle(),
    supabase.from("clinic_receptionists").select("clinic_id").eq("user_id", uid).maybeSingle(),
    supabase.from("doctor_receptionists").select("doctor_id").eq("user_id", uid).maybeSingle(),
  ]);
  if (doc) return [uid];
  if (dr?.doctor_id) return [dr.doctor_id];
  const clinicId = clinic?.id || cr?.clinic_id;
  if (clinicId) {
    const { data } = await supabase.from("doctors").select("id").eq("clinic_id", clinicId).eq("approved", true);
    return (data || []).map((d) => d.id);
  }
  return [];
}

export default function QueueDisplay() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doc[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const [hideNames, setHideNames] = useState(read("zonoir_queue_hide_names") === "1");
  const [full, setFull] = useState(false);

  const load = useCallback(async (docs: Doc[]) => {
    if (!docs.length) return;
    const { data, error } = await supabase.from("appointments")
      .select("id, doctor_id, appointment_time, created_at, status, patients(full_name)")
      .in("doctor_id", docs.map((d) => d.id))
      .eq("appointment_date", format(new Date(), "yyyy-MM-dd"))
      .limit(1000);
    if (error) { setError(error.message); return; }
    setError("");
    setRows((data || []) as Row[]);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      const ids = await findDoctors(session.user.id);
      const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] as any[] };
      const docs = ids.map((id) => ({ id, name: withDrTitle((profs || []).find((p: any) => p.id === id)?.full_name || "Doctor") }));
      setDoctors(docs);
      await load(docs);
      setLoaded(true);
    })();
  }, [load, navigate]);

  useEffect(() => {
    const t = setInterval(() => { setNow(new Date()); }, 1000);
    const r = setInterval(() => { load(doctors); }, REFRESH_MS);
    return () => { clearInterval(t); clearInterval(r); };
  }, [doctors, load]);

  useEffect(() => { document.title = "Patient queue | Zonoir"; }, []);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const queues = useMemo(() => doctors.map((d) => {
    const mine = assignTokens(rows.filter((r) => r.doctor_id === d.id));
    return {
      doctor: d,
      now: mine.filter((r) => r.status === "start"),
      next: mine.filter((r) => r.status === "scheduled"),
      done: mine.filter((r) => r.status === "completed").length,
    };
  }), [doctors, rows]).filter((q, _i, all) => {
    // In a clinic, hide doctors with nobody today once anyone has patients.
    const busy = all.filter((x) => x.now.length || x.next.length || x.done);
    return !busy.length || busy.includes(q);
  });

  const label = (r: { token: number; patients?: { full_name?: string | null } | null }) =>
    hideNames ? "" : shortName(r.patients?.full_name);

  const toggleNames = () => { const v = !hideNames; setHideNames(v); write("zonoir_queue_hide_names", v ? "1" : "0"); };
  const toggleFull = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); };

  const multi = queues.length > 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {!full && (
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Patient queue</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-semibold tabular-nums">{format(now, "h:mm a")}</div>
            <div className="text-sm text-white/60">{format(now, "EEEE, d MMMM")}</div>
          </div>
          {!full && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => load(doctors)} title="Refresh now" aria-label="Refresh now"><RefreshCw className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={toggleNames} title={hideNames ? "Show first names" : "Show token numbers only"} aria-label={hideNames ? "Show first names" : "Hide names"}>
                {hideNames ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={toggleFull} title="Full screen" aria-label="Full screen"><Maximize className="h-5 w-5" /></Button>
            </div>
          )}
          {full && (
            <Button variant="ghost" size="icon" className="text-white/40 hover:bg-white/10 hover:text-white" onClick={toggleFull} aria-label="Exit full screen"><Minimize className="h-5 w-5" /></Button>
          )}
        </div>
      </header>

      {error && <div className="mx-6 mt-4 rounded-md bg-red-500/20 px-4 py-2 text-sm text-red-200">Could not refresh: {error}. Trying again shortly.</div>}

      <main className={`flex-1 grid gap-4 p-4 md:p-6 ${multi ? "md:grid-cols-2 xl:grid-cols-3" : ""}`}>
        {!loaded && <p className="text-white/60 text-lg">Loading today's queue…</p>}
        {loaded && !queues.length && <p className="text-white/60 text-lg">No doctors found for this account.</p>}
        {queues.map((q) => (
          <section key={q.doctor.id} className="rounded-2xl bg-white/5 border border-white/10 p-5 md:p-6 flex flex-col gap-5">
            {multi && <h2 className="text-xl md:text-2xl font-semibold text-white/90">{q.doctor.name}</h2>}
            <div>
              <div className="text-sm uppercase tracking-widest text-emerald-300/80 mb-2">Now seeing</div>
              {q.now.length ? q.now.map((r) => (
                <div key={r.id} className="flex items-baseline gap-4">
                  <span className={`${multi ? "text-6xl" : "text-8xl md:text-9xl"} font-bold tabular-nums text-emerald-300`}>{r.token}</span>
                  <span className={`${multi ? "text-2xl" : "text-4xl"} font-medium`}>{label(r)}</span>
                </div>
              )) : <div className="text-3xl text-white/40">—</div>}
            </div>
            <div className="flex-1">
              <div className="text-sm uppercase tracking-widest text-sky-300/80 mb-2">Next</div>
              {q.next.length ? (
                <ol className="space-y-2">
                  {q.next.slice(0, multi ? 5 : 8).map((r, i) => (
                    <li key={r.id} className={`flex items-baseline gap-4 rounded-lg px-3 py-2 ${i === 0 ? "bg-sky-400/15" : ""}`}>
                      <span className={`${multi ? "text-3xl" : "text-5xl"} font-bold tabular-nums w-20 text-sky-200`}>{r.token}</span>
                      <span className={`${multi ? "text-xl" : "text-3xl"} text-white/90`}>{label(r)}</span>
                    </li>
                  ))}
                </ol>
              ) : <div className="text-2xl text-white/40">No one waiting</div>}
              {q.next.length > (multi ? 5 : 8) && <div className="mt-2 text-white/50">+{q.next.length - (multi ? 5 : 8)} more waiting</div>}
            </div>
            <div className="text-sm text-white/50">{q.next.length} waiting · {q.done} seen today</div>
          </section>
        ))}
      </main>
    </div>
  );
}
