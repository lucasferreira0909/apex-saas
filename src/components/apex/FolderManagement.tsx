import { useState } from "react";
import { Folder, ChevronDown, ChevronRight, Plus, MoreVertical, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useFolders } from "@/hooks/useFolders";
import { useProjects } from "@/hooks/useProjects";
import { useBoards, useUpdateBoardFolder } from "@/hooks/useBoards";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface UnifiedItem {
  id: string;
  name: string;
  type: string;
  folder: string | null | undefined;
  itemType: 'project' | 'board';
}

export function FolderManagement() {
  const {
    folders,
    addFolder,
    deleteFolder
  } = useFolders();
  const {
    projects,
    updateProject
  } = useProjects();
  const { data: boards = [] } = useBoards();
  const updateBoardFolder = useUpdateBoardFolder();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isAddProjectsOpen, setIsAddProjectsOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [folderName, setFolderName] = useState("");
  const [folderType, setFolderType] = useState<'funnel' | 'video' | 'message' | 'mixed'>('mixed');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Combinar projetos e boards em uma lista unificada
  const allItems: UnifiedItem[] = [
    ...projects.map(p => ({ 
      id: p.id, 
      name: p.name, 
      type: p.type, 
      folder: p.folder,
      itemType: 'project' as const 
    })),
    ...boards.map(b => ({ 
      id: b.id, 
      name: b.name, 
      type: 'board', 
      folder: (b as any).folder as string | null | undefined,
      itemType: 'board' as const 
    }))
  ];

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

  const handleDeleteFolder = async (folderId: string) => {
    // Remove folder from all items in this folder
    const folderItems = allItems.filter(item => item.folder === folderId);
    
    for (const item of folderItems) {
      if (item.itemType === 'project') {
        const project = projects.find(p => p.id === item.id);
        if (project) {
          await updateProject(item.id, { ...project, folder: undefined });
        }
      } else {
        await updateBoardFolder.mutateAsync({ boardId: item.id, folder: null });
      }
    }

    deleteFolder(folderId);
    toast({
      title: "Sucesso",
      description: "Pasta excluída com sucesso"
    });
  };

  const handleAddItems = async () => {
    if (!selectedFolderId) {
      toast({
        title: "Erro",
        description: "Selecione uma pasta",
        variant: "destructive"
      });
      return;
    }
    if (selectedItems.size === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um projeto",
        variant: "destructive"
      });
      return;
    }

    for (const itemId of selectedItems) {
      const item = allItems.find(i => i.id === itemId);
      if (item) {
        if (item.itemType === 'project') {
          const project = projects.find(p => p.id === itemId);
          if (project) {
            await updateProject(itemId, { ...project, folder: selectedFolderId });
          }
        } else {
          await updateBoardFolder.mutateAsync({ boardId: itemId, folder: selectedFolderId });
        }
      }
    }

    toast({
      title: "Sucesso",
      description: `${selectedItems.size} item(ns) adicionado(s) à pasta`
    });
    setIsAddProjectsOpen(false);
    setSelectedItems(new Set());
    setSelectedFolderId("");
  };

  const getItemUrl = (type: string, itemId: string) => {
    switch (type) {
      case 'funnel':
        return `/funnels/editor/${itemId}`;
      case 'video':
        return '/tools';
      case 'message':
        return `/messages/editor/${itemId}`;
      case 'board':
        return `/tasks?board=${itemId}`;
      default:
        return '/funnels';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'funnel':
        return 'Funil';
      case 'message':
        return 'Mensagem';
      case 'board':
        return 'Quadro';
      default:
        return type;
    }
  };

  // Mostrar todos os itens disponíveis (exceto os que já estão na pasta selecionada)
  const availableItems = allItems.filter(item => item.folder !== selectedFolderId);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-sidebar-foreground/60">Projetos</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsCreateFolderOpen(true)}>
                <Plus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Nova Pasta</TooltipContent>
          </Tooltip>
        </div>

        {/* Folders */}
        <div className="flex flex-col gap-1">
          {folders.map(folder => {
            const folderItems = allItems.filter(item => item.folder === folder.id);
            const isExpanded = expandedFolders.has(folder.id);

            return (
              <div key={folder.id}>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50">
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
                </div>

                {isExpanded && (
                  <div className="ml-6 flex flex-col gap-1">
                    {folderItems.map(item => (
                      <NavLink
                        key={item.id}
                        to={getItemUrl(item.type, item.id)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
                      >
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
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
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Selecione os Projetos *</Label>
                <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto">
                  {availableItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum projeto disponível</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {availableItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Checkbox
                            id={item.id}
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={checked => {
                              const newSelected = new Set(selectedItems);
                              if (checked) {
                                newSelected.add(item.id);
                              } else {
                                newSelected.delete(item.id);
                              }
                              setSelectedItems(newSelected);
                            }}
                          />
                          <Label htmlFor={item.id} className="text-sm cursor-pointer flex-1">
                            {item.name}{" "}
                            <span className="text-muted-foreground text-xs">
                              ({getTypeLabel(item.type)})
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleAddItems}>Adicionar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}