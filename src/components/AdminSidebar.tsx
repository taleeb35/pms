import { Building2, Users, Stethoscope, LifeBuoy, Settings, LayoutDashboard, Clock, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import clinicLogo from "@/assets/clinic-logo.png";

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Manage Clinics", url: "/admin/clinics", icon: Building2 },
  { title: "All Doctors", url: "/doctors", icon: Stethoscope },
  { title: "Pending Doctors", url: "/pending-doctors", icon: Clock },
  { title: "Support Tickets", url: "/support-tickets", icon: LifeBuoy },
  { title: "Profile", url: "/admin/profile", icon: User },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo Section */}
        {!collapsed && (
          <div className="p-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <img 
                src={clinicLogo} 
                alt="MedCare Pro" 
                className="h-12 w-12 object-contain hover:scale-110 transition-transform duration-300"
              />
              <div>
                <h3 className="font-bold text-lg">MedCare Pro</h3>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="p-2 border-b border-border/40 flex justify-center">
            <img 
              src={clinicLogo} 
              alt="MedCare Pro" 
              className="h-8 w-8 object-contain hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={`cursor-pointer transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : ""}`} />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
