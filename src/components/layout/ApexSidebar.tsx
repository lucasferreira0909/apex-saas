import { useState } from "react";
import { BarChart3, HeadphonesIcon, Settings, Zap, Video, MessageSquare, Library, ChevronDown, User, Sun, Moon, LogOut, PanelLeft, Wrench, LayoutGrid } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import apexLogoFull from "@/assets/apex-logo-full.png";
import apexLogoIcon from "@/assets/apex-logo-icon.png";
const projectItems = [{
  title: "Funis",
  url: "/funnels",
  icon: Zap
}, {
  title: "Quadros",
  url: "/tasks",
  icon: LayoutGrid
}, {
  title: "Geradores",
  url: "/tools",
  icon: Wrench
}];
const footerItems = [{
  title: "Suporte",
  url: "/support",
  icon: HeadphonesIcon
}, {
  title: "Configurações",
  url: "/settings",
  icon: Settings
}];
export function ApexSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    profile,
    signOut
  } = useAuth();
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar
  } = useSidebar();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };
  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile?.email || 'Usuário';
  };

  // Set dark mode by default on component mount
  useState(() => {
    document.documentElement.classList.add("dark");
  });
  const isCollapsed = state === "collapsed";
  const isActive = (url: string) => location.pathname === url;
  return <TooltipProvider>
      <Sidebar className="border-r border-sidebar-border" collapsible="icon">
        <SidebarHeader className={`border-b border-sidebar-border transition-all duration-200 ${isCollapsed ? "p-2" : "p-4"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed && <div className="flex items-center">
                <img src={apexLogoFull} alt="Apex Logo" className="h-10 w-auto" />
              </div>}
            
            {isCollapsed && <img src={apexLogoIcon} alt="Apex Logo" className="h-8 w-auto" />}
            
            {!isCollapsed && <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <PanelLeft className="h-4 w-4" />
              </SidebarTrigger>}
          </div>
          
          {isCollapsed && <div className="mt-2 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <PanelLeft className="h-4 w-4" />
                  </SidebarTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Expandir sidebar
                </TooltipContent>
              </Tooltip>
            </div>}
        </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">Ferramentas</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {projectItems.map(item => {
                const menuItem = <NavLink to={item.url} className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-2 transition-all duration-200 ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}>
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>;
                return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {isCollapsed ? <Tooltip>
                          <TooltipTrigger asChild>
                            {menuItem}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.title}
                          </TooltipContent>
                        </Tooltip> : menuItem}
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          {footerItems.map(item => {
            const menuItem = <NavLink to={item.url} className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-2 transition-all duration-200 ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}>
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>;
            return <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  {isCollapsed ? <Tooltip>
                      <TooltipTrigger asChild>
                        {menuItem}
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip> : menuItem}
                </SidebarMenuButton>
              </SidebarMenuItem>;
          })}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              {isCollapsed ? <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleSignOut} className="flex items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200">
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Sair
                  </TooltipContent>
                </Tooltip> : <button onClick={handleSignOut} className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200">
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span>Sair</span>
                </button>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      </Sidebar>
    </TooltipProvider>;
}