import { useState } from "react";
import { ChevronRight, Folder, Zap, LayoutGrid, MoreHorizontal, Trash2, Plus, X, Settings, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebarFolders, SidebarFolder, SidebarFolderItem } from "@/hooks/useSidebarFolders";
import { useFunnels } from "@/hooks/useFunnels";
import { useBoards } from "@/hooks/useBoards";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SidebarProjectsSection() {
  const navigate = useNavigate();
  const { 
    folders, 
    loading, 
    createFolder, 
    deleteFolder, 
    renameFolder, 
    addItemToFolder, 
    removeItemFromFolder,
    reorderFolders,
    moveItemToFolder,
    reorderItemsInFolder
  } = useSidebarFolders();
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
  const [activeItem, setActiveItem] = useState<{ type: 'folder' | 'item'; data: SidebarFolder | SidebarFolderItem } | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    // Check if it's a folder
    const folder = folders.find(f => f.id === activeId);
    if (folder) {
      setActiveItem({ type: 'folder', data: folder });
      return;
    }
    
    // Check if it's an item
    const item = folders.flatMap(f => f.items).find(i => i.id === activeId);
    if (item) {
      setActiveItem({ type: 'item', data: item });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging an item
    const activeItem = folders.flatMap(f => f.items).find(i => i.id === activeId);
    if (!activeItem) return;

    // Check if over a folder (to expand it)
    const overFolder = folders.find(f => f.id === overId);
    if (overFolder && !expandedFolders.has(overId)) {
      setExpandedFolders(prev => new Set([...prev, overId]));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Check if dragging a folder
    const activeFolderIndex = folders.findIndex(f => f.id === activeId);
    const overFolderIndex = folders.findIndex(f => f.id === overId);

    if (activeFolderIndex !== -1 && overFolderIndex !== -1) {
      // Reordering folders
      const newOrder = arrayMove(folders, activeFolderIndex, overFolderIndex);
      await reorderFolders(newOrder);
      return;
    }

    // Check if dragging an item
    const activeItemData = folders.flatMap(f => f.items).find(i => i.id === activeId);
    if (!activeItemData) return;

    // Find source folder
    const sourceFolderId = activeItemData.folder_id;

    // Check if dropping on a folder
    const targetFolder = folders.find(f => f.id === overId);
    if (targetFolder) {
      if (sourceFolderId !== targetFolder.id) {
        await moveItemToFolder(activeId, targetFolder.id);
      }
      return;
    }

    // Check if dropping on another item
    const overItem = folders.flatMap(f => f.items).find(i => i.id === overId);
    if (overItem) {
      const targetFolderId = overItem.folder_id;
      
      if (sourceFolderId === targetFolderId) {
        // Reordering within the same folder
        const folder = folders.find(f => f.id === sourceFolderId);
        if (folder) {
          const oldIndex = folder.items.findIndex(i => i.id === activeId);
          const newIndex = folder.items.findIndex(i => i.id === overId);
          const newOrder = arrayMove(folder.items, oldIndex, newIndex);
          await reorderItemsInFolder(sourceFolderId, newOrder);
        }
      } else {
        // Moving to another folder
        await moveItemToFolder(activeId, targetFolderId);
      }
    }
  };

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
    setSelectedProjects(new Set());
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

  const toggleProjectSelection = (type: 'funnel' | 'board', id: string) => {
    const key = `${type}:${id}`;
    setSelectedProjects(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAddSelectedProjects = async () => {
    if (!selectedFolder) return;
    for (const key of selectedProjects) {
      const [type, id] = key.split(':') as ['funnel' | 'board', string];
      await addItemToFolder(selectedFolder.id, type, id);
    }
    setSelectedProjects(new Set());
  };

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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={folders.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {folders.map((folder) => (
                    <SortableFolderItem
                      key={folder.id}
                      folder={folder}
                      isExpanded={expandedFolders.has(folder.id)}
                      onToggle={() => toggleFolder(folder.id)}
                      onItemClick={handleItemClick}
                      onManage={() => openManageDialog(folder)}
                      onDelete={() => confirmDelete(folder)}
                      onRemoveItem={removeItemFromFolder}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeItem && activeItem.type === 'folder' && (
                    <div className="bg-sidebar rounded-md border border-border shadow-lg p-2 flex items-center gap-2">
                      <Folder className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{(activeItem.data as SidebarFolder).name}</span>
                    </div>
                  )}
                  {activeItem && activeItem.type === 'item' && (
                    <div className="bg-sidebar rounded-md border border-border shadow-lg p-2 flex items-center gap-2">
                      {(activeItem.data as SidebarFolderItem).item_type === 'funnel' ? (
                        <Zap className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
                      )}
                      <span className="text-sm">{(activeItem.data as SidebarFolderItem).item_name || 'Sem nome'}</span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Create Folder Sheet */}
      <Sheet open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[450px]">
          <SheetHeader>
            <SheetTitle>Nova Pasta</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-6">
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
          <SheetFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Criar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Manage Folder Sheet */}
      <Sheet open={manageFolderOpen} onOpenChange={setManageFolderOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[450px]">
          <SheetHeader>
            <SheetTitle>Gerenciar Pasta</SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="projects" className="mt-6">
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
                <div className="space-y-4">
                  <ScrollArea className="h-[350px] pr-4">
                    {availableFunnels.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Funis</Label>
                        {availableFunnels.map((funnel) => {
                          const isSelected = selectedProjects.has(`funnel:${funnel.id}`);
                          return (
                            <button
                              key={funnel.id}
                              className={cn(
                                "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left transition-colors",
                                isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-accent"
                              )}
                              onClick={() => toggleProjectSelection('funnel', funnel.id)}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                              )}>
                                {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                              </div>
                              <span className="truncate">{funnel.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {availableBoards.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Quadros</Label>
                        {availableBoards.map((board) => {
                          const isSelected = selectedProjects.has(`board:${board.id}`);
                          return (
                            <button
                              key={board.id}
                              className={cn(
                                "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left transition-colors",
                                isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-accent"
                              )}
                              onClick={() => toggleProjectSelection('board', board.id)}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                              )}>
                                {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                              </div>
                              <span className="truncate">{board.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  {selectedProjects.size > 0 && (
                    <Button onClick={handleAddSelectedProjects} className="w-full">
                      Adicionar {selectedProjects.size} projeto{selectedProjects.size > 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
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
        </SheetContent>
      </Sheet>

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

interface SortableFolderItemProps {
  folder: SidebarFolder;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: SidebarFolderItem) => void;
  onManage: () => void;
  onDelete: () => void;
  onRemoveItem: (itemId: string) => void;
}

function SortableFolderItem({ 
  folder, 
  isExpanded, 
  onToggle, 
  onItemClick, 
  onManage, 
  onDelete,
  onRemoveItem 
}: SortableFolderItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="flex items-center group/folder">
          <div
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab opacity-0 group-hover/folder:opacity-100 transition-opacity"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="flex-1 justify-start">
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )} />
              <span className="truncate">{folder.name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover/folder:opacity-100 transition-opacity"
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
              <SortableContext
                items={folder.items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {folder.items.map((item) => (
                  <SortableProjectItem
                    key={item.id}
                    item={item}
                    onItemClick={onItemClick}
                    onRemoveItem={onRemoveItem}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

interface SortableProjectItemProps {
  item: SidebarFolderItem;
  onItemClick: (item: SidebarFolderItem) => void;
  onRemoveItem: (itemId: string) => void;
}

function SortableProjectItem({ item, onItemClick, onRemoveItem }: SortableProjectItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRemove = () => {
    onRemoveItem(item.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className="flex items-center group/item"
      >
        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab opacity-0 group-hover/item:opacity-100 transition-opacity"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <button
          className="flex items-center gap-2 flex-1 rounded px-2 py-1 text-sm hover:bg-accent transition-colors text-left"
          onClick={() => onItemClick(item)}
        >
          {item.item_type === 'funnel' ? (
            <Zap className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#e8e8e8' }} />
          ) : (
            <LayoutGrid className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#e8e8e8' }} />
          )}
          <span className="truncate">{item.item_name || 'Sem nome'}</span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
          onClick={() => setConfirmOpen(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover "{item.item_name || 'Sem nome'}" desta pasta? O projeto não será excluído, apenas removido da pasta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
