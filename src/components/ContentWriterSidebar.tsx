import { Stethoscope, FileText, LayoutDashboard } from "lucide-react";
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
import clinicLogo from "@/assets/main-logo.webp";

const contentWriterMenuItems = [
  { title: "Dashboard", url: "/content-writer/dashboard", icon: LayoutDashboard },
  { title: "Blogs", url: "/content-writer/blogs", icon: FileText },
  { title: "Doctors", url: "/content-writer/doctors", icon: Stethoscope },
];

export function ContentWriterSidebar() {
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
                alt="Zonoir" 
                className="main_logo new_logo hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="p-2 border-b border-border/40 flex justify-center">
            <img 
              src={clinicLogo} 
              alt="Zonoir" 
              className="h-8 w-8 object-contain hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Content Writer
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentWriterMenuItems.map((item) => (
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
