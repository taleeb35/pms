import { ReactNode, useEffect, useState } from "react";
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
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import clinicLogo from "@/assets/clinic-logo.png";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/");
      }
    });

    const {
      data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect based on user role
    if (userRole === "doctor") {
      navigate("/doctor-auth");
    } else if (userRole === "clinic") {
      navigate("/auth");
    } else {
      navigate("/admin-login");
    }
  };

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      // First check if user is a doctor
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      if (doctorData) {
        setUserRole("doctor");
        return;
      }
      
      // Then check if user is a clinic
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      if (clinicData) {
        setUserRole("clinic");
        return;
      }
      
      // Finally check user_roles table for admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setUserRole(roleData?.role || "admin");
    };
    fetchUserRole();
  }, [user]);

  const adminMenuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/clinics", icon: Building2, label: "Manage Clinics" },
    { path: "/doctors", icon: Stethoscope, label: "Doctors" },
    { path: "/admin/finance", icon: Banknote, label: "Payment Tracking" },
    { path: "/support-tickets", icon: LifeBuoy, label: "Support Tickets" },
    { path: "/admin/profile", icon: UserCog, label: "Profile" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const [doctorSpecialization, setDoctorSpecialization] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorSpecialization = async () => {
      if (!user || userRole !== "doctor") return;
      
      const { data } = await supabase
        .from("doctors")
        .select("specialization")
        .eq("id", user.id)
        .maybeSingle();
      
      setDoctorSpecialization(data?.specialization || null);
    };
    
    if (userRole === "doctor") {
      fetchDoctorSpecialization();
    }
  }, [user, userRole]);

  const isOphthalmologist = doctorSpecialization?.toLowerCase().includes("ophthalmologist");

  const baseDoctorMenuItems = [
    { path: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/doctor/patients", icon: Users, label: "Patients" },
    { path: "/doctor/waitlist", icon: Clock, label: "Waitlist Patients" },
    { path: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    { path: "/doctor/walk-in", icon: Sparkles, label: "Walk-In Appointment" },
  ];

  const doctorMenuItems = isOphthalmologist 
    ? [
        ...baseDoctorMenuItems,
        { path: "/doctor/procedures", icon: Stethoscope, label: "Procedures" },
        { path: "/doctor/finance", icon: Banknote, label: "Finance" },
        { path: "/doctor/profile", icon: UserCog, label: "Profile" },
        { path: "/doctor/support", icon: LifeBuoy, label: "Support" },
      ]
    : [
        ...baseDoctorMenuItems,
        { path: "/doctor/finance", icon: Banknote, label: "Finance" },
        { path: "/doctor/profile", icon: UserCog, label: "Profile" },
        { path: "/doctor/support", icon: LifeBuoy, label: "Support" },
      ];

  const clinicMenuItems = [
    { path: "/clinic/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/clinic/doctors", icon: Stethoscope, label: "Doctors" },
    { path: "/clinic/patients", icon: Users, label: "Patients" },
    { path: "/clinic/appointments", icon: Calendar, label: "Appointments" },
    { path: "/clinic/walk-in", icon: Clock, label: "Walk-In Appointment" },
    { path: "/clinic/specializations", icon: Building2, label: "Specializations" },
    { path: "/clinic/finance", icon: Banknote, label: "Finance" },
    { path: "/clinic/profile", icon: UserCog, label: "Profile" },
    { path: "/clinic/support", icon: LifeBuoy, label: "Support" },
  ];

  const menuItems = userRole === "doctor" 
    ? doctorMenuItems 
    : userRole === "clinic" 
    ? clinicMenuItems 
    : adminMenuItems;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Logo and Graphics */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-card via-card/95 to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
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
                  alt="MedCare Pro" 
                  className="h-10 w-10 object-contain hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-success rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  MedCare Pro
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Patient Management System
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline px-3 py-1 rounded-full bg-accent/50">
              {user.email}
            </span>
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
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } fixed inset-0 top-16 z-40 bg-gradient-to-b from-card to-card/80 md:static md:block md:w-64 md:flex-shrink-0 md:rounded-lg md:border md:shadow-sm`}
        >
          <nav className="space-y-2 p-4">
            {menuItems.map((item) => {
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
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-hidden bg-gradient-to-br from-card via-card/50 to-primary/5 rounded-lg p-6 shadow-sm border">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
