import { useState } from "react";
import { Building2, Stethoscope, LifeBuoy, Settings, LayoutDashboard, User, Share2, PenLine, CreditCard, ChevronDown, FolderKanban } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import clinicLogo from "@/assets/main-logo.webp";

const managementItems = [
  { title: "Manage Clinics", url: "/admin/clinics", icon: Building2 },
  { title: "Doctors", url: "/doctors", icon: Stethoscope },
  { title: "Referral Partners", url: "/admin/referral-partners", icon: Share2 },
  { title: "Content Writers", url: "/admin/content-writers", icon: PenLine },
  { title: "Payment Tracking", url: "/admin/finance", icon: CreditCard },
  { title: "Support Tickets", url: "/support-tickets", icon: LifeBuoy },
];

const accountItems = [
  { title: "Profile", url: "/admin/profile", icon: User },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  
  const isManagementActive = managementItems.some(item => currentPath === item.url);
  const isAccountActive = accountItems.some(item => currentPath === item.url);
  
  const [managementOpen, setManagementOpen] = useState<boolean>(true);
  const [accountOpen, setAccountOpen] = useState<boolean>(isAccountActive);

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
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - Top Level */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/dashboard")}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <LayoutDashboard className={`h-5 w-5 ${isActive("/dashboard") ? "text-primary" : ""}`} />
                  {!collapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Management Section */}
              {!collapsed ? (
                <Collapsible open={managementOpen} onOpenChange={setManagementOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className={`cursor-pointer transition-all duration-200 justify-between ${isManagementActive ? "text-primary" : "hover:bg-accent/50"}`}>
                        <div className="flex items-center gap-2">
                          <FolderKanban className="h-5 w-5" />
                          <span>Management</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${managementOpen ? "rotate-180" : ""}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <div className="ml-4 border-l border-border/40">
                      {managementItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            onClick={() => navigate(item.url)}
                            className={`cursor-pointer transition-all duration-200 ${
                              isActive(item.url)
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-accent/50"
                            }`}
                          >
                            <item.icon className={`h-4 w-4 ${isActive(item.url) ? "text-primary" : ""}`} />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                managementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`cursor-pointer transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-accent/50"
                      }`}
                      title={item.title}
                    >
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : ""}`} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}

              {/* Account Section */}
              {!collapsed ? (
                <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className={`cursor-pointer transition-all duration-200 justify-between ${isAccountActive ? "text-primary" : "hover:bg-accent/50"}`}>
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          <span>Account</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <div className="ml-4 border-l border-border/40">
                      {accountItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            onClick={() => navigate(item.url)}
                            className={`cursor-pointer transition-all duration-200 ${
                              isActive(item.url)
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-accent/50"
                            }`}
                          >
                            <item.icon className={`h-4 w-4 ${isActive(item.url) ? "text-primary" : ""}`} />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                accountItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`cursor-pointer transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-accent/50"
                      }`}
                      title={item.title}
                    >
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : ""}`} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
