import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun, HelpCircle, CalendarClock, UserPlus, LifeBuoy, AlertTriangle, UserCheck, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { zonedNow } from "@/lib/region";
import { friendlyTime } from "@/lib/datetime";

// Header tools: dark mode switch, help link to the matching knowledge-base area, notification bell.
const ROLE_BASES = ["/doctor-receptionist", "/receptionist", "/doctor", "/clinic"];
const useBase = () => {
  const { pathname } = useLocation();
  return useMemo(() => {
    const b = ROLE_BASES.find((x) => pathname === x || pathname.startsWith(x + "/"));
    if (b) return b;
    if (pathname.startsWith("/admin") || ["/dashboard", "/patients", "/appointments", "/doctors", "/pending-doctors", "/support-tickets"].includes(pathname)) return "/admin";
    return null;
  }, [pathname]);
};

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <Button variant="ghost" size="icon" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

// The guide that matches the page you are on (first matching path part wins).
const PAGE_GUIDE: [string, string, string][] = [
  ["/appointments/", "visit-records", "Help: writing a visit"],
  ["/appointments", "book-appointments", "Help: booking appointments"],
  ["/calendar", "appointment-calendar", "Help: the calendar"],
  ["/walk-in", "walk-ins", "Help: walk-in patients"],
  ["/patients/", "visit-timeline", "Help: the patient timeline"],
  ["/patients", "add-patients", "Help: adding patients"],
  ["/schedule", "doctor-schedule", "Help: your schedule"],
  ["/schedules", "weekly-availability", "Help: doctor schedules"],
  ["/templates", "prescription-templates", "Help: prescription templates"],
  ["/medicines", "clinical-catalogs", "Help: medicine list"],
  ["/diseases", "clinical-catalogs", "Help: clinical lists"],
  ["/allergies", "clinical-catalogs", "Help: clinical lists"],
  ["/procedures", "clinical-catalogs", "Help: clinical lists"],
  ["/icd-codes", "clinical-catalogs", "Help: clinical lists"],
  ["/finance", "payment-tracking", "Help: finance"],
  ["/expenses", "expenses", "Help: expenses"],
  ["/reports", "financial-reports", "Help: reports"],
  ["/receptionists", "manage-receptionists", "Help: receptionists"],
  ["/doctors", "add-doctors", "Help: adding doctors"],
  ["/add-doctor", "add-doctors", "Help: adding doctors"],
  ["/specializations", "specializations", "Help: specializations"],
  ["/subscription", "subscription", "Help: subscription"],
  ["/activity-logs", "activity-logs", "Help: activity logs"],
  ["/profile", "clinic-profile", "Help: profile and settings"],
  ["/dashboard", "dashboard-overview", "Help: the dashboard"],
];

export const HelpLink = () => {
  const base = useBase();
  const { pathname } = useLocation();
  const kb = base === "/clinic" || base === "/receptionist" ? "/clinic/knowledge-base" : base === "/doctor" || base === "/doctor-receptionist" ? "/doctor/knowledge-base" : "/knowledge-base";
  const rest = base && base !== "/admin" ? pathname.slice(base.length) : "";
  const hit = rest && !rest.startsWith("/knowledge-base") ? PAGE_GUIDE.find(([p]) => (p.endsWith("/") ? rest.startsWith(p) : rest === p || rest.startsWith(p + "/"))) : undefined;
  const to = hit ? `${kb}/${hit[1]}` : kb;
  const label = hit ? hit[2] : "Help and guides";
  return (
    <Button variant="ghost" size="icon" asChild aria-label={label} title={label}>
      <Link to={to}><HelpCircle className="h-5 w-5" /></Link>
    </Button>
  );
};

type Note = { key: string; icon: typeof Bell; text: string; to: string; tone?: "warn" };

export const NotificationBell = () => {
  const base = useBase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const seenKey = "zonoir.notifications.seen";
  const [seen, setSeen] = useState<string>(() => { try { return localStorage.getItem(seenKey) || ""; } catch { return ""; } });

  const load = useCallback(async () => {
    if (!base) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { ymd, hm } = zonedNow();
    const head = { count: "exact" as const, head: true };
    const out: Note[] = [];
    if (base === "/admin") {
      const [docs, tickets, unpaid] = await Promise.all([
        supabase.from("doctors").select("id", head).eq("approved", false),
        supabase.from("support_tickets").select("id", head).eq("status", "open"),
        supabase.from("clinic_payments").select("id", head).eq("status", "pending"),
      ]);
      if (docs.count) out.push({ key: `docs${docs.count}`, icon: UserCheck, text: `${docs.count} doctor${docs.count > 1 ? "s" : ""} waiting for approval`, to: "/pending-doctors", tone: "warn" });
      if (tickets.count) out.push({ key: `tk${tickets.count}`, icon: LifeBuoy, text: `${tickets.count} open support ticket${tickets.count > 1 ? "s" : ""}`, to: "/support-tickets" });
      if (unpaid.count) out.push({ key: `up${unpaid.count}`, icon: Receipt, text: `${unpaid.count} unpaid subscription bill${unpaid.count > 1 ? "s" : ""}`, to: "/admin/finance" });
    } else {
      let q = supabase.from("appointments").select("id, appointment_time, patients(full_name)").eq("appointment_date", ymd).eq("status", "scheduled").gte("appointment_time", hm).order("appointment_time").limit(3);
      if (base === "/doctor") q = q.eq("doctor_id", user.id);
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const [next, leads, stale] = await Promise.all([
        q,
        supabase.from("leads").select("id", head).gte("created_at", since),
        supabase.from("appointments").select("id", head).in("status", ["scheduled", "start"]).lt("appointment_date", ymd),
      ]);
      ((next.data as any[]) || []).forEach((a) => out.push({ key: `ap${a.id}`, icon: CalendarClock, text: `${friendlyTime(a.appointment_time)} · ${a.patients?.full_name || "Patient"}`, to: `${base}/appointments/${a.id}` }));
      if (leads.count && base !== "/doctor-receptionist") out.push({ key: `ld${leads.count}`, icon: UserPlus, text: `${leads.count} new lead${leads.count > 1 ? "s" : ""} this week`, to: `${base === "/receptionist" ? "/receptionist" : base}/leads` });
      if (stale.count) out.push({ key: `st${stale.count}`, icon: AlertTriangle, text: `${stale.count} past appointment${stale.count > 1 ? "s" : ""} need a status update`, to: `${base}/appointments?status=needs_update`, tone: "warn" });
    }
    setNotes(out);
  }, [base]);

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  if (!base) return null;

  const signature = notes.map((n) => n.key).join("|");
  const unread = notes.length > 0 && signature !== seen;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) { setSeen(signature); try { localStorage.setItem(seenKey, signature); } catch { /* ignore */ } } }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications${notes.length ? `, ${notes.length}` : ""}`} className="relative">
          <Bell className="h-5 w-5" />
          {unread && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b px-4 py-2.5 text-sm font-semibold">Notifications</p>
        {notes.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {notes.map((n) => (
              <li key={n.key}>
                <Link to={n.to} onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-muted">
                  <n.icon className={`mt-0.5 h-4 w-4 shrink-0 ${n.tone === "warn" ? "text-amber-600" : "text-primary"}`} />
                  <span>{n.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};
