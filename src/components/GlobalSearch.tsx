import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, User, LayoutDashboard, CalendarDays, Users, Wallet, BarChart3, UserCircle, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";

// Search from anywhere: Ctrl+K (Cmd+K on Mac) or the search button in the top bar.
// Finds patients by name, phone or patient ID (access rules limit results to the user's own patients)
// and jumps to common pages for the current role.
type Hit = { id: string; full_name: string; phone: string | null; patient_id: string | null };

const ROLE_BASES = ["/doctor-receptionist", "/receptionist", "/doctor", "/clinic"];

const PAGES: { label: string; path: string; icon: typeof Search; roles: string[] }[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["/doctor", "/clinic", "/receptionist", "/doctor-receptionist"] },
  { label: "Appointments", path: "/appointments", icon: CalendarDays, roles: ["/doctor", "/clinic", "/receptionist", "/doctor-receptionist"] },
  { label: "Patients", path: "/patients", icon: Users, roles: ["/doctor", "/clinic", "/receptionist", "/doctor-receptionist"] },
  { label: "Walk-in patient", path: "/walk-in", icon: UserPlus, roles: ["/doctor", "/clinic", "/receptionist", "/doctor-receptionist"] },
  { label: "Finance", path: "/finance", icon: Wallet, roles: ["/doctor", "/clinic", "/receptionist"] },
  { label: "Reports", path: "/reports", icon: BarChart3, roles: ["/doctor", "/clinic"] },
  { label: "Profile and settings", path: "/profile", icon: UserCircle, roles: ["/doctor", "/clinic"] },
];

// Recently opened patients (this device), shown when the search box opens with nothing typed.
const RECENT_KEY = "zonoir.recentPatients";
type Recent = { id: string; full_name: string; base: string };
const readRecent = (): Recent[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } };
const pushRecent = (r: Recent) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify([r, ...readRecent().filter((x) => x.id !== r.id)].slice(0, 6))); } catch { /* ignore */ } };

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = useMemo(() => ROLE_BASES.find((b) => pathname === b || pathname.startsWith(b + "/")) || null, [pathname]);
  const seq = useRef(0);
  const [recent, setRecent] = useState<Recent[]>(readRecent);

  // Remember patients as they are opened.
  useEffect(() => {
    const m = pathname.match(new RegExp("^(/(?:doctor-receptionist|receptionist|doctor|clinic))/patients/([0-9a-f-]{36})$"));
    if (!m) return;
    const [, b, id] = m;
    supabase.from("patients").select("full_name").eq("id", id).maybeSingle().then(({ data }) => {
      if (data?.full_name) { pushRecent({ id, full_name: data.full_name, base: b }); setRecent(readRecent()); }
    });
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    const my = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const safe = term.replace(/[%,()]/g, " ");
      const { data } = await supabase
        .from("patients")
        .select("id, full_name, phone, patient_id")
        .or(`full_name.ilike.%${safe}%,phone.ilike.%${safe}%,patient_id.ilike.%${safe}%`)
        .order("updated_at", { ascending: false })
        .limit(8);
      if (my === seq.current) { setHits((data as Hit[]) || []); setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  if (!base) return null;

  const go = (path: string) => { setOpen(false); setQ(""); navigate(path); };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}
        className="h-9 gap-2 text-muted-foreground font-normal w-9 px-0 justify-center lg:w-56 lg:px-3 lg:justify-start" aria-label="Search patients and pages">
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">Search patients…</span>
        <kbd className="ml-auto hidden lg:inline rounded border bg-muted px-1.5 text-[10px] font-medium">Ctrl K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a patient name, phone or ID, or a page…" value={q} onValueChange={setQ} />
        <CommandList>
          <CommandEmpty>{loading ? "Searching…" : q.trim().length < 2 ? "Type at least 2 letters." : "No patients or pages found."}</CommandEmpty>
          {hits.length > 0 && (
            <CommandGroup heading="Patients">
              {hits.map((h) => (
                <CommandItem key={h.id} value={`patient ${h.full_name} ${h.phone ?? ""} ${h.patient_id ?? ""} ${h.id}`}
                  onSelect={() => go(`${base}/patients/${h.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span className="truncate">{h.full_name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{h.phone || h.patient_id}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {q.trim().length < 2 && recent.filter((r) => r.base === base).length > 0 && (
            <CommandGroup heading="Recent patients">
              {recent.filter((r) => r.base === base).map((r) => (
                <CommandItem key={r.id} value={`recent ${r.full_name} ${r.id}`} onSelect={() => go(`${base}/patients/${r.id}`)}>
                  <User className="mr-2 h-4 w-4" />{r.full_name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandSeparator />
          <CommandGroup heading="Go to">
            {PAGES.filter((p) => p.roles.includes(base)).map((p) => (
              <CommandItem key={p.path} value={`page ${p.label}`} onSelect={() => go(`${base}${p.path}`)}>
                <p.icon className="mr-2 h-4 w-4" />
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
