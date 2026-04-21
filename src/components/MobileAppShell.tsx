import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Calendar, Users, BarChart3, Bell } from "lucide-react";
import clinicLogo from "@/assets/main-logo.webp";

interface MobileAppShellProps {
  children: ReactNode;
  title?: string;
}

type Role = "doctor" | "clinic" | "receptionist" | "doctor_receptionist" | "admin" | null;

const tabsByRole: Record<string, { path: string; icon: any; label: string }[]> = {
  doctor: [
    { path: "/app", icon: LayoutDashboard, label: "Home" },
    { path: "/app/appointments", icon: Calendar, label: "Appts" },
    { path: "/app/patients", icon: Users, label: "Patients" },
    { path: "/app/reports", icon: BarChart3, label: "Reports" },
  ],
  clinic: [
    { path: "/app", icon: LayoutDashboard, label: "Home" },
    { path: "/app/appointments", icon: Calendar, label: "Appts" },
    { path: "/app/patients", icon: Users, label: "Patients" },
    { path: "/app/reports", icon: BarChart3, label: "Reports" },
  ],
};

const MobileAppShell = ({ children, title }: MobileAppShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<Role>(null);
  const [name, setName] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      const userId = session.user.id;
      const [clinicRes, doctorRes, profileRes] = await Promise.all([
        supabase.from("clinics").select("id").eq("id", userId).maybeSingle(),
        supabase.from("doctors").select("id").eq("id", userId).maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      ]);
      if (!active) return;
      if (clinicRes.data) setRole("clinic");
      else if (doctorRes.data) setRole("doctor");
      else setRole("doctor"); // fallback
      setName(profileRes.data?.full_name ?? "");
      setReady(true);
    };
    init();
    return () => { active = false; };
  }, [navigate]);

  if (!ready || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  const tabs = tabsByRole[role] ?? tabsByRole.doctor;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Native-style top bar */}
      <header
        className="sticky top-0 z-40 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={clinicLogo} alt="Zonoir" className="h-8 w-auto" />
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
        {title && (
          <div className="px-4 pb-3">
            <h1 className="text-lg font-semibold">{title}</h1>
            {name && <p className="text-xs text-primary-foreground/80">Hi, Dr. {name}</p>}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.path === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors active:scale-95 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileAppShell;
