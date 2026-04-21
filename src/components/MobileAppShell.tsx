import { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Wallet, Menu, Bell } from "lucide-react";
import clinicLogo from "@/assets/main-logo.webp";
import { useMobileRole } from "@/hooks/useMobileRole";

interface MobileAppShellProps {
  children: ReactNode;
  title?: string;
}

const tabs = [
  { path: "/app", icon: LayoutDashboard, label: "Home", exact: true },
  { path: "/app/appointments", icon: Calendar, label: "Appts" },
  { path: "/app/patients", icon: Users, label: "Patients" },
  { path: "/app/finance", icon: Wallet, label: "Finance" },
  { path: "/app/more", icon: Menu, label: "More" },
];

const MobileAppShell = ({ children, title }: MobileAppShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, name, loading } = useMobileRole();

  useEffect(() => {
    if (!loading && !role) navigate("/login");
  }, [loading, role, navigate]);

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header
        className="sticky top-0 z-40 bg-gradient-to-br from-primary via-primary to-primary/85 text-primary-foreground shadow-lg"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center p-1.5">
              <img src={clinicLogo} alt="Zonoir" className="h-full w-full object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Zonoir</span>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-white" />
          </button>
        </div>
        {title && (
          <div className="px-4 pb-4 pt-1">
            <h1 className="text-2xl font-bold leading-tight text-white">{title}</h1>
            {name && (
              <p className="text-sm text-white/90 mt-0.5 font-medium">
                {role === "clinic" ? `Hi, ${name}` : `Hi, Dr. ${name}`}
              </p>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.exact
              ? location.pathname === tab.path
              : location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors active:scale-95 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {active && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileAppShell;
