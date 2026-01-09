import styles from "./Layout.module.css";
import { ReactNode, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Building2,
  Clock,
  LifeBuoy,
  Settings,
  UserCog,
  Sparkles,
  Banknote,
  AlertTriangle,
  HeartPulse,
  FileCode,
  FileText,
  Layers,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Database,
  FolderCog,
  Share2,
  CreditCard,
  Activity,
} from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import clinicLogo from "@/assets/main-logo.webp";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LayoutProps {
  children: ReactNode;
}

interface MenuGroup {
  label: string;
  icon: any;
  items: { path: string; icon: any; label: string }[];
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Prevent double initialization in development mode (React StrictMode)
    if (initRef.current) return;
    initRef.current = true;

    // Set up auth state listener FIRST (critical for proper session handling)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // Only update state synchronously - no async calls here to prevent deadlock
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsInitialized(true);

      // Handle specific auth events
      if (event === "SIGNED_OUT" || !currentSession) {
        // Use setTimeout to defer navigation and avoid potential deadlock
        setTimeout(() => {
          navigate("/");
        }, 0);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsInitialized(true);

      if (!existingSession) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const [userRole, setUserRole] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorClinicId, setDoctorClinicId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setClinicId(null);
        setDoctorId(null);
        setDoctorClinicId(null);
        return;
      }

      // Reset role when user changes to prevent stale data
      setUserRole(null);
      setClinicId(null);
      setDoctorId(null);
      setDoctorClinicId(null);

      // Then check if user is a clinic FIRST (before receptionist check)
      // This is important because clinic owner's session should show clinic menu
      const { data: clinicData } = await supabase.from("clinics").select("id").eq("id", user.id).maybeSingle();

      if (clinicData) {
        setUserRole("clinic");
        return;
      }

      // Check if user is a doctor
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("id, clinic_id")
        .eq("id", user.id)
        .maybeSingle();

      if (doctorData) {
        setUserRole("doctor");
        setDoctorClinicId(doctorData.clinic_id);
        return;
      }

      // Check if user is a clinic receptionist
      const { data: clinicReceptionistData } = await supabase
        .from("clinic_receptionists")
        .select("clinic_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (clinicReceptionistData) {
        setUserRole("receptionist");
        setClinicId(clinicReceptionistData.clinic_id);
        return;
      }

      // Check if user is a doctor's receptionist
      const { data: doctorReceptionistData } = await supabase
        .from("doctor_receptionists")
        .select("doctor_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (doctorReceptionistData) {
        setUserRole("doctor_receptionist");
        setDoctorId(doctorReceptionistData.doctor_id);
        return;
      }

      // Finally check user_roles table for admin
      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();

      setUserRole(roleData?.role || "admin");
    };
    fetchUserRole();
  }, [user?.id]);

  // Admin menu - grouped
  const adminMenuGroups: MenuGroup[] = [
    {
      label: "Management",
      icon: FolderCog,
      items: [
        { path: "/admin/clinics", icon: Building2, label: "Manage Clinics" },
        { path: "/doctors", icon: Stethoscope, label: "Doctors" },
        { path: "/admin/referral-partners", icon: Share2, label: "Referral Partners" },
        { path: "/admin/finance", icon: Banknote, label: "Payment Tracking" },
        { path: "/support-tickets", icon: LifeBuoy, label: "Support Tickets" },
      ],
    },
    {
      label: "Account",
      icon: UserCog,
      items: [
        { path: "/admin/profile", icon: UserCog, label: "Profile" },
        { path: "/admin/settings", icon: Settings, label: "Settings" },
      ],
    },
  ];

  const [doctorSpecialization, setDoctorSpecialization] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorSpecialization = async () => {
      if (!user || userRole !== "doctor") return;

      const { data } = await supabase.from("doctors").select("specialization").eq("id", user.id).maybeSingle();

      setDoctorSpecialization(data?.specialization || null);
    };

    if (userRole === "doctor") {
      fetchDoctorSpecialization();
    }
  }, [user, userRole]);

  // Doctor menu - grouped (conditionally include receptionists for single doctors only)
  const doctorSettingsItems = [
    // Only show Receptionists for single doctors (not linked to a clinic)
    ...(doctorClinicId ? [] : [{ path: "/doctor/receptionists", icon: UserCog, label: "Receptionists" }]),
    { path: "/doctor/schedule", icon: Clock, label: "Timing & Schedule" },
    { path: "/doctor/finance", icon: Banknote, label: "Finance" },
    // Only show Subscription for single doctors (not linked to a clinic)
    ...(doctorClinicId ? [] : [{ path: "/doctor/subscription", icon: CreditCard, label: "Subscription" }]),
    { path: "/doctor/profile", icon: UserCog, label: "Profile" },
    { path: "/doctor/support", icon: LifeBuoy, label: "Support" },
  ];

  const doctorMenuGroups: MenuGroup[] = [
    {
      label: "Patient Care",
      icon: Users,
      items: [
        { path: "/doctor/patients", icon: Users, label: "Patients" },
        { path: "/doctor/waitlist", icon: Clock, label: "Waitlist" },
        { path: "/doctor/appointments", icon: Calendar, label: "Appointments" },
        { path: "/doctor/walk-in", icon: Sparkles, label: "Walk-In" },
      ],
    },
    {
      label: "Clinical Data",
      icon: Database,
      items: [
        { path: "/doctor/allergies", icon: AlertTriangle, label: "Allergies" },
        { path: "/doctor/diseases", icon: HeartPulse, label: "Diseases" },
        { path: "/doctor/icd-codes", icon: FileCode, label: "ICD Codes" },
        { path: "/doctor/procedures", icon: Stethoscope, label: "Procedures" },
        { path: "/doctor/templates", icon: Layers, label: "Templates" },
      ],
    },
    {
      label: "Settings",
      icon: Settings,
      items: doctorSettingsItems,
    },
  ];

  // Clinic menu - grouped
  const clinicMenuGroups: MenuGroup[] = [
    {
      label: "Staff",
      icon: Stethoscope,
      items: [
        { path: "/clinic/doctors", icon: Stethoscope, label: "Doctors" },
        { path: "/clinic/schedules", icon: Clock, label: "Schedules" },
        { path: "/clinic/receptionists", icon: UserCog, label: "Receptionists" },
      ],
    },
    {
      label: "Patient Care",
      icon: Users,
      items: [
        { path: "/clinic/patients", icon: Users, label: "Patients" },
        { path: "/clinic/appointments", icon: Calendar, label: "Appointments" },
        { path: "/clinic/walk-in", icon: Sparkles, label: "Walk-In" },
      ],
    },
    {
      label: "Clinical Data",
      icon: Database,
      items: [
        { path: "/clinic/specializations", icon: Building2, label: "Specializations" },
        { path: "/clinic/allergies", icon: AlertTriangle, label: "Allergies" },
        { path: "/clinic/diseases", icon: HeartPulse, label: "Diseases" },
        { path: "/clinic/icd-codes", icon: FileCode, label: "ICD Codes" },
        { path: "/clinic/procedures", icon: Settings, label: "Procedures" },
        { path: "/clinic/templates", icon: Layers, label: "Templates" },
      ],
    },
    {
      label: "Finance & Settings",
      icon: Banknote,
      items: [
        { path: "/clinic/finance", icon: Banknote, label: "Finance" },
        { path: "/clinic/expenses", icon: FileText, label: "Expenses" },
        { path: "/clinic/subscription", icon: CreditCard, label: "Subscription" },
        { path: "/clinic/profile", icon: UserCog, label: "Profile" },
        { path: "/clinic/support", icon: LifeBuoy, label: "Support" },
      ],
    },
  ];

  // Receptionist menu - grouped
  const receptionistMenuGroups: MenuGroup[] = [
    {
      label: "Staff",
      icon: Stethoscope,
      items: [
        { path: "/receptionist/doctors", icon: Stethoscope, label: "Doctors" },
        { path: "/receptionist/schedules", icon: Clock, label: "Schedules" },
      ],
    },
    {
      label: "Patient Care",
      icon: Users,
      items: [
        { path: "/receptionist/patients", icon: Users, label: "Patients" },
        { path: "/receptionist/appointments", icon: Calendar, label: "Appointments" },
        { path: "/receptionist/walk-in", icon: Sparkles, label: "Walk-In" },
      ],
    },
    {
      label: "Clinical Data",
      icon: Database,
      items: [
        { path: "/receptionist/specializations", icon: Building2, label: "Specializations" },
        { path: "/receptionist/allergies", icon: AlertTriangle, label: "Allergies" },
        { path: "/receptionist/diseases", icon: HeartPulse, label: "Diseases" },
        { path: "/receptionist/icd-codes", icon: FileCode, label: "ICD Codes" },
        { path: "/receptionist/procedures", icon: Settings, label: "Procedures" },
        { path: "/receptionist/templates", icon: Layers, label: "Templates" },
      ],
    },
    {
      label: "Finance",
      icon: Banknote,
      items: [
        { path: "/receptionist/finance", icon: Banknote, label: "Finance" },
        { path: "/receptionist/expenses", icon: FileText, label: "Expenses" },
      ],
    },
  ];

  // Doctor's receptionist menu
  const doctorReceptionistMenuGroups: MenuGroup[] = [
    {
      label: "Patient Care",
      icon: Users,
      items: [
        { path: "/doctor-receptionist/patients", icon: Users, label: "Patients" },
        { path: "/doctor-receptionist/waitlist", icon: Clock, label: "Waitlist" },
        { path: "/doctor-receptionist/appointments", icon: Calendar, label: "Appointments" },
        { path: "/doctor-receptionist/walk-in", icon: Sparkles, label: "Walk-In" },
      ],
    },
    {
      label: "Clinical Data",
      icon: Database,
      items: [
        { path: "/doctor-receptionist/allergies", icon: AlertTriangle, label: "Allergies" },
        { path: "/doctor-receptionist/diseases", icon: HeartPulse, label: "Diseases" },
        { path: "/doctor-receptionist/icd-codes", icon: FileCode, label: "ICD Codes" },
        { path: "/doctor-receptionist/procedures", icon: Stethoscope, label: "Procedures" },
      ],
    },
  ];

  const menuGroups =
    userRole === "doctor"
      ? doctorMenuGroups
      : userRole === "clinic"
        ? clinicMenuGroups
        : userRole === "receptionist"
          ? receptionistMenuGroups
          : userRole === "doctor_receptionist"
            ? doctorReceptionistMenuGroups
            : adminMenuGroups;

  // Dashboard item (shown at top)
  const getDashboardItem = () => {
    if (userRole === "doctor") {
      return { path: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" };
    } else if (userRole === "clinic") {
      return { path: "/clinic/dashboard", icon: LayoutDashboard, label: "Dashboard" };
    } else if (userRole === "receptionist") {
      return { path: "/receptionist/dashboard", icon: LayoutDashboard, label: "Dashboard" };
    } else if (userRole === "doctor_receptionist") {
      return { path: "/doctor-receptionist/dashboard", icon: LayoutDashboard, label: "Dashboard" };
    } else {
      return { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" };
    }
  };

  // Activity Logs item (shown at end) - only for doctors and clinics, not receptionists
  const getActivityLogsItem = () => {
    if (userRole === "doctor") {
      return { path: "/doctor/activity-logs", icon: Activity, label: "Activity Logs" };
    } else if (userRole === "clinic") {
      return { path: "/clinic/activity-logs", icon: Activity, label: "Activity Logs" };
    } else {
      return null; // Receptionists and admin don't have activity logs
    }
  };

  const dashboardItem = getDashboardItem();
  const activityLogsItem = getActivityLogsItem();

  // Auto-expand group containing the active route on initial load only
  const initializedGroupsRef = useRef(false);
  useEffect(() => {
    if (initializedGroupsRef.current) return;
    initializedGroupsRef.current = true;

    const currentPath = location.pathname;
    const newOpenGroups: Record<string, boolean> = {};

    menuGroups.forEach((group) => {
      const hasActiveItem = group.items.some((item) => item.path === currentPath);
      if (hasActiveItem) {
        newOpenGroups[group.label] = true;
      }
    });

    setOpenGroups(newOpenGroups);
  }, []);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      // Close all other groups and toggle the clicked one
      const newState: { [key: string]: boolean } = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      newState[label] = !prev[label];
      return newState;
    });
  };

  // Show nothing while initializing to prevent flicker
  if (!isInitialized || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Logo and Graphics */}
      <header className="dr sticky top-0 z-50 w-full border-b bg-gradient-to-r from-card via-card/95 to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={clinicLogo}
                  alt="Zonoir"
                  className="main_logo new_logo hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="new_bg hidden text-sm sm:inline px-3 py-1.5 rounded-full">{user.email}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full px-4 flex gap-6 py-6">
        {/* Sidebar with Collapsible Groups */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } ${
            userRole === 'doctor' ? 'doctor-sidebar' : ''
          } ${
            userRole === 'clinic' ? 'clinic-sidebar' : ''
          } fixed inset-0 top-16 z-40 bg-gradient-to-b from-card to-card/80 md:static md:block md:w-64 md:flex-shrink-0 md:rounded-lg md:border dr_side md:shadow-sm overflow-y-auto max-h-[calc(100vh-6rem)]`}
        >
          <nav className="space-y-1 p-3">
            {/* Dashboard item (at top) */}
            {(() => {
              const Icon = dashboardItem.icon;
              const isActive = location.pathname === dashboardItem.path;
              return (
                <Link to={dashboardItem.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start transition-all ${
                      isActive ? "shadow-md" : "hover:bg-accent hover:shadow-sm"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {dashboardItem.label}
                  </Button>
                </Link>
              );
            })()}

            {/* Grouped menu items */}
            {menuGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = openGroups[group.label] ?? false;
              const hasActiveItem = group.items.some((item) => location.pathname === item.path);

              // For single-item groups, render directly without collapsible
              if (group.items.length === 1) {
                const item = group.items[0];
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${
                        isActive ? "shadow-md" : "hover:bg-accent hover:shadow-sm"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              }

              return (
                <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full justify-between text-foreground hover:bg-accent ${
                        hasActiveItem
                          ? "bg-primary/15 text-primary font-semibold border-l-2 border-primary"
                          : "hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center">
                        <GroupIcon className="mr-2 h-4 w-4" />
                        {group.label}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1 mt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link key={item.path} to={item.path}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            className={`w-full justify-start text-sm transition-all ${
                              isActive ? "shadow-sm" : "hover:bg-accent hover:shadow-sm"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="mr-2 h-3.5 w-3.5" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            {/* Activity Logs item (at end) */}
            {activityLogsItem &&
              (() => {
                const Icon = activityLogsItem.icon;
                const isActive = location.pathname === activityLogsItem.path;
                return (
                  <Link to={activityLogsItem.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${
                        isActive ? "shadow-md" : "hover:bg-accent hover:shadow-sm"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {activityLogsItem.label}
                    </Button>
                  </Link>
                );
              })()}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-hidden bg-gradient-to-br from-card via-card/50 to-primary/5 rounded-lg p-6 shadow-sm border">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
