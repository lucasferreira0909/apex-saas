import { useState } from "react";
import { BarChart3, HeadphonesIcon, Settings, Zap, Video, MessageSquare, Library, ChevronDown, User, Sun, Moon, LogOut, PanelLeft, Wrench, LayoutGrid, Plus, Folder } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
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
  const [isCreateProjectSheetOpen, setIsCreateProjectSheetOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'funnel' | 'video' | 'message'>('funnel');
  
  const { projects, addProject } = useProjects();
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
  
  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para o projeto",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addProject({
        name: projectName,
        type: projectType,
        status: 'draft',
        stats: {}
      });
      
      toast({
        title: "Sucesso",
        description: "Projeto criado com sucesso"
      });
      
      setIsCreateProjectSheetOpen(false);
      setProjectName('');
      setProjectType('funnel');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar projeto",
        variant: "destructive"
      });
    }
  };
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

        <SidebarGroup>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel className="text-sidebar-foreground/60">Projetos</SidebarGroupLabel>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setIsCreateProjectSheetOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full"
                  onClick={() => setIsCreateProjectSheetOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Novo Projeto
              </TooltipContent>
            </Tooltip>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.slice(0, 5).map(project => {
                const projectUrl = project.type === 'funnel' ? `/funnels` : `/tasks`;
                const menuItem = (
                  <NavLink
                    to={projectUrl}
                    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg px-3 py-2 transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground`}
                  >
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{project.name}</span>}
                  </NavLink>
                );
                
                return (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {menuItem}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {project.name}
                          </TooltipContent>
                        </Tooltip>
                      ) : menuItem}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
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
      
      {/* Create Project Sheet */}
      <Sheet open={isCreateProjectSheetOpen} onOpenChange={setIsCreateProjectSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Novo Projeto</SheetTitle>
            <SheetDescription>Configure seu novo projeto</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="grid gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-name">Nome do Projeto *</Label>
                <Input
                  id="project-name"
                  placeholder="Digite o nome do projeto"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-type">Tipo de Projeto *</Label>
                <Select value={projectType} onValueChange={(value: 'funnel' | 'video' | 'message') => setProjectType(value)}>
                  <SelectTrigger id="project-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funnel">Funil</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="message">Mensagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleCreateProject}>Criar Projeto</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>;
}