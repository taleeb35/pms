import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { useMobileRole } from "@/hooks/useMobileRole";
import {
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileText,
  Pill,
  Stethoscope,
  Tag,
  AlertCircle,
  Activity,
  UserCog,
  CreditCard,
  HelpCircle,
  User,
  Building2,
  Briefcase,
  Receipt,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";

interface ModuleItem {
  label: string;
  icon: typeof CalendarDays;
  path: string;
  color: string;
}

const doctorModules: { group: string; items: ModuleItem[] }[] = [
  {
    group: "Clinical",
    items: [
      { label: "Walk-in", icon: ClipboardList, path: "/app/walk-in", color: "bg-info/10 text-info" },
      { label: "Schedule", icon: CalendarClock, path: "/app/schedule", color: "bg-primary/10 text-primary" },
      { label: "Templates", icon: FileText, path: "/app/templates", color: "bg-warning/10 text-warning" },
      { label: "Procedures", icon: Stethoscope, path: "/app/procedures", color: "bg-success/10 text-success" },
    ],
  },
  {
    group: "Reference data",
    items: [
      { label: "Allergies", icon: AlertCircle, path: "/app/allergies", color: "bg-destructive/10 text-destructive" },
      { label: "Diseases", icon: Pill, path: "/app/diseases", color: "bg-primary/10 text-primary" },
      { label: "ICD Codes", icon: Tag, path: "/app/icd-codes", color: "bg-info/10 text-info" },
    ],
  },
  {
    group: "Team & insights",
    items: [
      { label: "Receptionists", icon: UserCog, path: "/app/receptionists", color: "bg-warning/10 text-warning" },
      { label: "Activity Logs", icon: Activity, path: "/app/activity-logs", color: "bg-muted text-foreground" },
      { label: "Reports", icon: Sparkles, path: "/app/reports", color: "bg-primary/10 text-primary" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Profile", icon: User, path: "/app/profile", color: "bg-primary/10 text-primary" },
      { label: "Subscription", icon: CreditCard, path: "/app/subscription", color: "bg-success/10 text-success" },
      { label: "Support", icon: HelpCircle, path: "/app/support", color: "bg-info/10 text-info" },
    ],
  },
];

const clinicModules: { group: string; items: ModuleItem[] }[] = [
  {
    group: "Clinical operations",
    items: [
      { label: "Doctors", icon: Stethoscope, path: "/app/doctors", color: "bg-primary/10 text-primary" },
      { label: "Walk-in", icon: ClipboardList, path: "/app/walk-in", color: "bg-info/10 text-info" },
      { label: "Schedules", icon: CalendarClock, path: "/app/doctor-schedules", color: "bg-warning/10 text-warning" },
      { label: "Templates", icon: FileText, path: "/app/templates", color: "bg-success/10 text-success" },
    ],
  },
  {
    group: "Finance",
    items: [
      { label: "Expenses", icon: Receipt, path: "/app/expenses", color: "bg-destructive/10 text-destructive" },
      { label: "Reports", icon: Sparkles, path: "/app/reports", color: "bg-primary/10 text-primary" },
    ],
  },
  {
    group: "Reference data",
    items: [
      { label: "Specializations", icon: Briefcase, path: "/app/specializations", color: "bg-info/10 text-info" },
      { label: "Procedures", icon: Stethoscope, path: "/app/procedures", color: "bg-success/10 text-success" },
      { label: "Allergies", icon: AlertCircle, path: "/app/allergies", color: "bg-destructive/10 text-destructive" },
      { label: "Diseases", icon: Pill, path: "/app/diseases", color: "bg-primary/10 text-primary" },
      { label: "ICD Codes", icon: Tag, path: "/app/icd-codes", color: "bg-info/10 text-info" },
    ],
  },
  {
    group: "Team & insights",
    items: [
      { label: "Receptionists", icon: UserCog, path: "/app/receptionists", color: "bg-warning/10 text-warning" },
      { label: "Activity Logs", icon: Activity, path: "/app/activity-logs", color: "bg-muted text-foreground" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Clinic Profile", icon: Building2, path: "/app/profile", color: "bg-primary/10 text-primary" },
      { label: "Subscription", icon: CreditCard, path: "/app/subscription", color: "bg-success/10 text-success" },
      { label: "Support", icon: HelpCircle, path: "/app/support", color: "bg-info/10 text-info" },
    ],
  },
];

const MobileMore = () => {
  const navigate = useNavigate();
  const { role, name } = useMobileRole();
  const groups = role === "clinic" ? clinicModules : doctorModules;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <MobileAppShell title="More">
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.group}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {group.group}
            </h2>
            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 active:bg-muted/60 transition-colors ${
                      idx > 0 ? "border-t border-border/60" : ""
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-destructive/10 text-destructive font-medium active:scale-[0.98] transition-transform"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Signed in as {name || "user"} · {role === "clinic" ? "Clinic owner" : "Doctor"}
          </p>
        </div>
      </div>
    </MobileAppShell>
  );
};

export default MobileMore;
