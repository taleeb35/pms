import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  UserCog,
  LogOut,
  Menu,
  X,
  Stethoscope,
  CreditCard,
  Building2,
} from "lucide-react";
import { User } from "@supabase/supabase-js";

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
    } else {
      navigate("/admin-login");
    }
  };

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      // Check user_roles table first
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      setUserRole(data?.role || null);
    };
    fetchUserRole();
  }, [user]);

  const adminMenuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/doctors", icon: Stethoscope, label: "Doctors" },
    { path: "/pending-doctors", icon: UserCog, label: "Pending Doctors" },
  ];

  const doctorMenuItems = [
    { path: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/doctor/patients", icon: Users, label: "Patients" },
    { path: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  ];

  const menuItems = userRole === "doctor" ? doctorMenuItems : adminMenuItems;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-sm font-bold text-primary">
                  Patient Management System
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Healthcare Management
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex gap-6 py-6">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } fixed inset-0 top-16 z-40 bg-background md:static md:block md:w-64 md:flex-shrink-0`}
        >
          <nav className="space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
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
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
