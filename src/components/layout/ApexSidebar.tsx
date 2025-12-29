import { useState, useEffect } from "react";
import { HeadphonesIcon, Settings, Workflow, LogOut, Wrench, LayoutGrid, Zap, House, Search } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProjectsSection } from "@/components/apex/SidebarProjectsSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import apexLogoFull from "@/assets/apex-logo-full.png";
const projectItems = [{
  title: "Visão Geral",
  url: "/dashboard",
  icon: House
}, {
  title: "Fluxos",
  url: "/funnels",
  icon: Workflow
}, {
  title: "Quadros",
  url: "/tasks",
  icon: LayoutGrid
}, {
  title: "Ferramentas",
  url: "/tools",
  icon: Wrench
}, {
  title: "Upgrades",
  url: "/upgrades",
  icon: Zap
}];
const menuItems = [{
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    profile,
    signOut
  } = useAuth();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
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
  const handleNavigate = (url: string) => {
    navigate(url);
    setPopoverOpen(false);
  };

  // Set dark mode by default on component mount
  useState(() => {
    document.documentElement.classList.add("dark");
  });
  const isActive = (url: string) => location.pathname === url;
  const PopoverMenuContent = () => <div className="flex flex-col gap-1 p-1">
      {menuItems.map(item => <button key={item.title} onClick={() => handleNavigate(item.url)} className={`flex items-center gap-3 rounded-lg px-3 py-2 w-full text-left transition-all duration-200 ${isActive(item.url) ? "bg-accent text-accent-foreground font-medium" : "text-foreground hover:bg-accent/50"}`}>
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span>{item.title}</span>
        </button>)}
      
      <div className="h-px bg-border my-1" />
      
      <button onClick={handleSignOut} className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-left text-destructive hover:bg-destructive/10 transition-all duration-200">
        <LogOut className="h-4 w-4 flex-shrink-0" />
        <span>Sair</span>
      </button>
    </div>;
  return <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <img src={apexLogoFull} alt="Apex Logo" className="h-10 w-auto" />
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-0 bg-popover border border-border">
              <PopoverMenuContent />
            </PopoverContent>
          </Popover>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Search Bar */}
        <SidebarGroup>
          <SidebarGroupContent>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left text-sm">Pesquisar...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                /
              </kbd>
            </button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarProjectsSection />

        <div className="mt-auto">
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-left text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span>Sair</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </div>
      </SidebarContent>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pesquisar</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Digite para pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="text-sm text-muted-foreground">
              Pesquise por fluxos, quadros e ferramentas.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>;
}