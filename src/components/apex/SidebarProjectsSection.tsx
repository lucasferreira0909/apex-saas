import { useState } from "react";
import { ChevronRight, Folder, Zap, LayoutGrid, MoreHorizontal, Trash2, Plus, X, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebarFolders, SidebarFolder, SidebarFolderItem } from "@/hooks/useSidebarFolders";
import { useFunnels } from "@/hooks/useFunnels";
import { useBoards } from "@/hooks/useBoards";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function SidebarProjectsSection() {
  const navigate = useNavigate();
  const { folders, loading, createFolder, deleteFolder, renameFolder, addItemToFolder, removeItemFromFolder } = useSidebarFolders();
  const { data: funnels } = useFunnels();
  const { data: boards } = useBoards();

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [manageFolderOpen, setManageFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<SidebarFolder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<SidebarFolder | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName("");
    setCreateFolderOpen(false);
  };

  const handleRenameFolder = async () => {
    if (!selectedFolder || !folderName.trim()) return;
    await renameFolder(selectedFolder.id, folderName.trim());
  };

  const openManageDialog = (folder: SidebarFolder) => {
    setSelectedFolder(folder);
    setFolderName(folder.name);
    setManageFolderOpen(true);
  };

  const confirmDelete = (folder: SidebarFolder) => {
    setFolderToDelete(folder);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!folderToDelete) return;
    await deleteFolder(folderToDelete.id);
    setFolderToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleItemClick = (item: SidebarFolderItem) => {
    if (item.item_type === 'funnel') {
      navigate(`/funnel-editor/${item.item_id}`);
    } else {
      navigate(`/tasks?board=${item.item_id}`);
    }
  };

  const handleAddProject = async (type: 'funnel' | 'board', id: string) => {
    if (!selectedFolder) return;
    await addItemToFolder(selectedFolder.id, type, id);
  };

  // Get items already in the selected folder to filter them out
  const getAvailableItems = () => {
    if (!selectedFolder) return { availableFunnels: [], availableBoards: [] };
    
    const existingItemIds = new Set(selectedFolder.items.map(item => item.item_id));
    
    const availableFunnels = (funnels || []).filter(f => !existingItemIds.has(f.id));
    const availableBoards = (boards || []).filter(b => !existingItemIds.has(b.id));
    
    return { availableFunnels, availableBoards };
  };

  const { availableFunnels, availableBoards } = getAvailableItems();

  if (loading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-sidebar-foreground/60">Projetos</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-3 py-2 text-sm text-muted-foreground">Carregando...</div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <div className="flex items-center justify-between pr-2">
          <SidebarGroupLabel className="text-sidebar-foreground/60">Projetos</SidebarGroupLabel>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCreateFolderOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <SidebarGroupContent>
          <SidebarMenu>
            {folders.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Nenhuma pasta criada
              </div>
            ) : (
              folders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  isExpanded={expandedFolders.has(folder.id)}
                  onToggle={() => toggleFolder(folder.id)}
                  onItemClick={handleItemClick}
                  onManage={() => openManageDialog(folder)}
                  onDelete={() => confirmDelete(folder)}
                  onRemoveItem={removeItemFromFolder}
                />
              ))
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nome da pasta</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Minha Pasta"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Folder Dialog (Rename + Add Projects) */}
      <Dialog open={manageFolderOpen} onOpenChange={setManageFolderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Pasta</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="projects" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="projects" className="flex-1">Projetos</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="mt-4">
              {availableFunnels.length === 0 && availableBoards.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum projeto disponível para adicionar
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  {availableFunnels.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Funis</Label>
                      {availableFunnels.map((funnel) => (
                        <button
                          key={funnel.id}
                          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors"
                          onClick={() => handleAddProject('funnel', funnel.id)}
                        >
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="truncate">{funnel.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {availableBoards.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Quadros</Label>
                      {availableBoards.map((board) => (
                        <button
                          key={board.id}
                          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors"
                          onClick={() => handleAddProject('board', board.id)}
                        >
                          <LayoutGrid className="h-4 w-4 text-blue-500" />
                          <span className="truncate">{board.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </TabsContent>
            <TabsContent value="settings" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rename-folder">Nome da pasta</Label>
                <div className="flex gap-2">
                  <Input
                    id="rename-folder"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
                  />
                  <Button onClick={handleRenameFolder} disabled={!folderName.trim()}>
                    Salvar
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a pasta "{folderToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface FolderItemProps {
  folder: SidebarFolder;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: SidebarFolderItem) => void;
  onManage: () => void;
  onDelete: () => void;
  onRemoveItem: (itemId: string) => void;
}

function FolderItem({ 
  folder, 
  isExpanded, 
  onToggle, 
  onItemClick, 
  onManage, 
  onDelete,
  onRemoveItem 
}: FolderItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SidebarMenuItem>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="flex items-center group">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="flex-1 justify-start">
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )} />
              <Folder className="h-4 w-4 text-amber-500" />
              <span className="truncate">{folder.name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1">
              <button
                className="flex items-center gap-2 w-full rounded px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => { onManage(); setMenuOpen(false); }}
              >
                <Settings className="h-4 w-4" />
                Gerenciar
              </button>
              <button
                className="flex items-center gap-2 w-full rounded px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                onClick={() => { onDelete(); setMenuOpen(false); }}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </PopoverContent>
          </Popover>
        </div>
        <CollapsibleContent>
          <div className="ml-4 pl-4 border-l border-border space-y-0.5 py-1">
            {folder.items.length === 0 ? (
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Pasta vazia
              </div>
            ) : (
              folder.items.map((item) => (
                <div key={item.id} className="flex items-center group/item">
                  <button
                    className="flex items-center gap-2 flex-1 rounded px-2 py-1 text-sm hover:bg-accent transition-colors text-left"
                    onClick={() => onItemClick(item)}
                  >
                    {item.item_type === 'funnel' ? (
                      <Zap className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    ) : (
                      <LayoutGrid className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.item_name || 'Sem nome'}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
