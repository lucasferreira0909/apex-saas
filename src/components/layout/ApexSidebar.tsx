import { useState, useEffect, useMemo } from "react";
import { HeadphonesIcon, Settings, Workflow, LogOut, Wrench, LayoutGrid, House, Search, Sparkles, Image, MessageSquare, FileText, Columns, CheckSquare, ListTodo } from "lucide-react";
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
import { useFunnels } from "@/hooks/useFunnels";
import { useBoards } from "@/hooks/useBoards";
import { ScrollArea } from "@/components/ui/scroll-area";
import apexLogoFull from "@/assets/apex-logo-full.png";

// Tools list for search
const toolsList = [
  { id: "image-generator", name: "Gerador de Imagens", url: "/image-generator", icon: Image },
  { id: "copy-generator", name: "Gerador de Copy", url: "/copy-generator", icon: FileText },
  { id: "headline-generator", name: "Gerador de Headlines", url: "/headline-generator", icon: FileText },
  { id: "email-generator", name: "Gerador de E-mails", url: "/email-generator", icon: MessageSquare },
  { id: "script-generator", name: "Gerador de Scripts", url: "/script-generator", icon: FileText },
  { id: "offer-generator", name: "Gerador de Ofertas", url: "/offer-generator", icon: FileText },
  { id: "persona-generator", name: "Gerador de Personas", url: "/persona-generator", icon: FileText },
  { id: "testimonial-generator", name: "Gerador de Depoimentos", url: "/testimonial-generator", icon: MessageSquare },
];
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
  const { data: funnels } = useFunnels();
  const { data: boards } = useBoards();
  const {
    profile,
    signOut
  } = useAuth();

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { funnels: [], boards: [], tools: [] };
    
    const query = searchQuery.toLowerCase();
    
    const filteredFunnels = (funnels || [])
      .filter(f => f.name.toLowerCase().includes(query))
      .slice(0, 5);
    
    const filteredBoards = (boards || [])
      .filter(b => b.name.toLowerCase().includes(query))
      .slice(0, 5);
    
    const filteredTools = toolsList
      .filter(t => t.name.toLowerCase().includes(query))
      .slice(0, 5);
    
    return { funnels: filteredFunnels, boards: filteredBoards, tools: filteredTools };
  }, [searchQuery, funnels, boards]);

  const hasResults = searchResults.funnels.length > 0 || searchResults.boards.length > 0 || searchResults.tools.length > 0;

  const handleSearchResultClick = (url: string) => {
    navigate(url);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const getFunnelIcon = (templateType: string | null) => {
    if (templateType === "ai_flow") return Sparkles;
    return Workflow;
  };

  const getBoardIcon = (templateType: string | null) => {
    if (templateType === "checklist") return CheckSquare;
    if (templateType === "rows") return ListTodo;
    return Columns;
  };

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
      <Dialog open={searchOpen} onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) setSearchQuery("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pesquisar</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Digite para pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            
            {searchQuery.trim() === "" ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Pesquise por fluxos, quadros e ferramentas.
              </div>
            ) : !hasResults ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Nenhum resultado encontrado para "{searchQuery}"
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="flex flex-col gap-4 py-2">
                  {/* Funnels Results */}
                  {searchResults.funnels.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        Fluxos
                      </div>
                      <div className="flex flex-col gap-1">
                        {searchResults.funnels.map((funnel) => {
                          const Icon = getFunnelIcon(funnel.template_type);
                          const url = funnel.template_type === "ai_flow" 
                            ? `/ai-flow-editor/${funnel.id}` 
                            : `/funnel-editor/${funnel.id}`;
                          return (
                            <button
                              key={funnel.id}
                              onClick={() => handleSearchResultClick(url)}
                              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-left"
                            >
                              <Icon className="h-4 w-4 text-violet-400 flex-shrink-0" />
                              <span className="truncate">{funnel.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Boards Results */}
                  {searchResults.boards.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        Quadros
                      </div>
                      <div className="flex flex-col gap-1">
                        {searchResults.boards.map((board) => {
                          const Icon = getBoardIcon(board.template_type);
                          return (
                            <button
                              key={board.id}
                              onClick={() => handleSearchResultClick(`/tasks?board=${board.id}`)}
                              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-left"
                            >
                              <Icon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              <span className="truncate">{board.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tools Results */}
                  {searchResults.tools.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        Ferramentas
                      </div>
                      <div className="flex flex-col gap-1">
                        {searchResults.tools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => handleSearchResultClick(tool.url)}
                            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-left"
                          >
                            <tool.icon className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{tool.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>;
}