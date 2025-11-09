import { useState } from "react";
import { BarChart3, HeadphonesIcon, Settings, Zap, Video, MessageSquare, Library, ChevronDown, User, Sun, Moon, LogOut, PanelLeft, Wrench } from "lucide-react";
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
const generalItems = [{
  title: "Suporte",
  url: "/support",
  icon: HeadphonesIcon
}, {
  title: "Configurações",
  url: "/settings",
  icon: Settings
}];
const projectItems = [{
  title: "Funis",
  url: "/funnels",
  icon: Zap
}, {
  title: "Ferramentas",
  url: "/tools",
  icon: Wrench
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
                <img src={apexLogoFull} alt="Apex Logo" className="h-16 w-auto" />
              </div>}
            
            {isCollapsed && <img src={apexLogoIcon} alt="Apex Logo" className="h-10 w-auto" />}
            
            {!isCollapsed && <div className="flex items-center gap-2">
                <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <PanelLeft className="h-4 w-4" />
                </SidebarTrigger>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{getDisplayName()}</div>
                      <div className="text-xs text-muted-foreground">{profile?.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>}
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
          {!isCollapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">Principal</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {generalItems.map(item => {
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

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">Projetos</SidebarGroupLabel>}
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

      </Sidebar>
    </TooltipProvider>;
}