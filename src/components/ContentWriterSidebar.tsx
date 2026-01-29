import { Stethoscope, FileText, LayoutDashboard, ChevronDown, UserCheck, ClipboardList } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import clinicLogo from "@/assets/main-logo.webp";

export function ContentWriterSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Check if any doctor sub-route is active
  const isDoctorRouteActive = currentPath.includes("/content-writer/doctors");
  const [isDoctorsOpen, setIsDoctorsOpen] = useState(isDoctorRouteActive);

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
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/content-writer/dashboard")}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive("/content-writer/dashboard")
                      ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <LayoutDashboard className={`h-5 w-5 ${isActive("/content-writer/dashboard") ? "text-primary" : ""}`} />
                  {!collapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Blogs */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/content-writer/blogs")}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive("/content-writer/blogs")
                      ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <FileText className={`h-5 w-5 ${isActive("/content-writer/blogs") ? "text-primary" : ""}`} />
                  {!collapsed && <span>Blogs</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Doctors with Sub-items */}
              <Collapsible
                open={isDoctorsOpen}
                onOpenChange={setIsDoctorsOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`cursor-pointer transition-all duration-200 ${
                        isDoctorRouteActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <Stethoscope className={`h-5 w-5 ${isDoctorRouteActive ? "text-primary" : ""}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Doctors</span>
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDoctorsOpen ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate("/content-writer/doctors")}
                            className={`cursor-pointer transition-all duration-200 ${
                              isActive("/content-writer/doctors")
                                ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary"
                                : "hover:bg-accent/50"
                            }`}
                          >
                            <ClipboardList className="h-4 w-4" />
                            <span>Listed Dr</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate("/content-writer/registered-doctors")}
                            className={`cursor-pointer transition-all duration-200 ${
                              isActive("/content-writer/registered-doctors")
                                ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary"
                                : "hover:bg-accent/50"
                            }`}
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>Registered Dr</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
