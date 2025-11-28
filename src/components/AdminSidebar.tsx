import { Building2, Users, Stethoscope, LifeBuoy, Settings, LayoutDashboard, Clock } from "lucide-react";
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

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Manage Clinics", url: "/admin/clinics", icon: Building2 },
  { title: "All Doctors", url: "/doctors", icon: Stethoscope },
  { title: "Pending Doctors", url: "/pending-doctors", icon: Clock },
  { title: "Support Tickets", url: "/support-tickets", icon: LifeBuoy },
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
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Admin Panel
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
