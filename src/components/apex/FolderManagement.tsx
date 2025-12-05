import { useState } from "react";
import { Folder, ChevronDown, ChevronRight, Plus, MoreVertical, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useFolders } from "@/hooks/useFolders";
import { useProjects } from "@/hooks/useProjects";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
interface FolderManagementProps {
  isCollapsed: boolean;
}
export function FolderManagement({
  isCollapsed
}: FolderManagementProps) {
  const {
    folders,
    addFolder,
    deleteFolder
  } = useFolders();
  const {
    projects,
    updateProject
  } = useProjects();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isAddProjectsOpen, setIsAddProjectsOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [folderName, setFolderName] = useState("");
  const [folderType, setFolderType] = useState<'funnel' | 'video' | 'message' | 'mixed'>('mixed');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };
  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a pasta",
        variant: "destructive"
      });
      return;
    }
    addFolder(folderName, folderType);
    toast({
      title: "Sucesso",
      description: "Pasta criada com sucesso"
    });
    setIsCreateFolderOpen(false);
    setFolderName("");
    setFolderType('mixed');
  };
  const handleDeleteFolder = (folderId: string) => {
    // Remove folder from all projects in this folder
    const folderProjects = projects.filter(p => p.folder === folderId);
    folderProjects.forEach(project => {
      updateProject(project.id, {
        ...project,
        folder: undefined
      });
    });
    deleteFolder(folderId);
    toast({
      title: "Sucesso",
      description: "Pasta excluída com sucesso"
    });
  };
  const handleAddProjects = async () => {
    if (!selectedFolderId) {
      toast({
        title: "Erro",
        description: "Selecione uma pasta",
        variant: "destructive"
      });
      return;
    }
    if (selectedProjects.size === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um projeto",
        variant: "destructive"
      });
      return;
    }
    for (const projectId of selectedProjects) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        await updateProject(projectId, {
          ...project,
          folder: selectedFolderId
        });
      }
    }
    toast({
      title: "Sucesso",
      description: `${selectedProjects.size} projeto(s) adicionado(s) à pasta`
    });
    setIsAddProjectsOpen(false);
    setSelectedProjects(new Set());
    setSelectedFolderId("");
  };
  const getProjectUrl = (type: string, projectId: string) => {
    switch (type) {
      case 'funnel':
        return `/funnels/editor/${projectId}`;
      case 'video':
        return '/tools';
      case 'message':
        return `/messages/editor/${projectId}`;
      default:
        return '/funnels';
    }
  };
  // Mostrar todos os projetos disponíveis (exceto os que já estão na pasta selecionada)
  const availableProjects = projects.filter(p => p.folder !== selectedFolderId);
  return <>
      <div className="flex flex-col gap-2">
        {!isCollapsed && <div className="flex items-center justify-between px-2">
            <span className="text-sm text-sidebar-foreground/60">Projetos</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsCreateFolderOpen(true)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nova Pasta</TooltipContent>
            </Tooltip>
          </div>}

        {isCollapsed && <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full" onClick={() => setIsCreateFolderOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nova Pasta</TooltipContent>
          </Tooltip>}

        {/* Folders */}
        <div className="flex flex-col gap-1">
          {folders.map(folder => {
          const folderProjects = projects.filter(p => p.folder === folder.id);
          const isExpanded = expandedFolders.has(folder.id);
          return <div key={folder.id}>
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 ${isCollapsed ? 'justify-center' : ''}`}>
                  {!isCollapsed && <>
                      <button onClick={() => toggleFolder(folder.id)} className="flex items-center gap-2 flex-1">
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        <Folder className="h-4 w-4" />
                        <span className="text-sm truncate">{folder.name}</span>
                        
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                      setSelectedFolderId(folder.id);
                      setIsAddProjectsOpen(true);
                    }}>
                            <Plus className="h-3 w-3 mr-2" />
                            Adicionar Projeto
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-destructive">
                            <Trash2 className="h-3 w-3 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>}
                  {isCollapsed && <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => toggleFolder(folder.id)}>
                          <Folder className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{folder.name} ({folderProjects.length})</TooltipContent>
                    </Tooltip>}
                </div>

                {isExpanded && !isCollapsed && <div className="ml-6 flex flex-col gap-1">
                    {folderProjects.map(project => <NavLink key={project.id} to={getProjectUrl(project.type, project.id)} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50">
                        <span className="truncate">{project.name}</span>
                      </NavLink>)}
                  </div>}
              </div>;
        })}
        </div>
      </div>

      {/* Create Folder Sheet */}
      <Sheet open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nova Pasta</SheetTitle>
            <SheetDescription>Crie uma pasta para organizar seus projetos</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="grid gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="folder-name">Nome da Pasta *</Label>
                <Input id="folder-name" placeholder="Digite o nome da pasta" value={folderName} onChange={e => setFolderName(e.target.value)} />
              </div>
              
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleCreateFolder}>Criar Pasta</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Projects to Folder Sheet */}
      <Sheet open={isAddProjectsOpen} onOpenChange={setIsAddProjectsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Adicionar Projeto</SheetTitle>
            <SheetDescription>Adicione projetos existentes a uma pasta</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="grid gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="select-folder">Selecione a Pasta *</Label>
                <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                  <SelectTrigger id="select-folder">
                    <SelectValue placeholder="Escolha uma pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Selecione os Projetos *</Label>
                <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto">
                  {availableProjects.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum projeto disponível</p> : <div className="flex flex-col gap-2">
                      {availableProjects.map(project => <div key={project.id} className="flex items-center gap-2">
                          <Checkbox id={project.id} checked={selectedProjects.has(project.id)} onCheckedChange={checked => {
                      const newSelected = new Set(selectedProjects);
                      if (checked) {
                        newSelected.add(project.id);
                      } else {
                        newSelected.delete(project.id);
                      }
                      setSelectedProjects(newSelected);
                    }} />
                          <Label htmlFor={project.id} className="text-sm cursor-pointer flex-1">
                            {project.name} <span className="text-muted-foreground text-xs">({project.type === 'funnel' ? 'Funil' : project.type === 'message' ? 'Mensagem' : 'Quadro'})</span>
                          </Label>
                        </div>)}
                    </div>}
                </div>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleAddProjects}>Adicionar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>;
}