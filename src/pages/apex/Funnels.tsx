import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateFunnelDialog } from "@/components/apex/CreateFunnelDialog";
import { useFunnels, useDeleteFunnel, useDeleteMultipleFunnels, checkFunnelNameExists } from "@/hooks/useFunnels";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Folder, MoreHorizontal, Edit, Trash2, X, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { useQueryClient } from "@tanstack/react-query";

interface FunnelItem {
  id: string;
  name: string;
  template_type: string | null;
  created_at: string;
  folder?: string | null;
}

export default function Funnels() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);
  
  // Rename states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [funnelToRename, setFunnelToRename] = useState<{ id: string; name: string } | null>(null);
  const [newFunnelName, setNewFunnelName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: funnels = [], isLoading } = useFunnels();
  const deleteFunnel = useDeleteFunnel();
  const deleteMultipleFunnels = useDeleteMultipleFunnels();

  const getTypeBadge = (templateType: string | null) => {
    switch (templateType) {
      case 'ltv':
        return <Badge variant="secondary" className="capitalize">LTV</Badge>;
      case 'vendas':
        return <Badge variant="secondary" className="capitalize">Vendas</Badge>;
      case 'remarketing':
        return <Badge variant="secondary" className="capitalize">Remarketing</Badge>;
      case 'livre':
      default:
        return <Badge variant="secondary" className="capitalize">Livre</Badge>;
    }
  };

  // Transform funnels to ProjectItem format
  const funnelProjects = useMemo(() => 
    funnels.map(funnel => ({
      id: funnel.id,
      name: funnel.name,
      template_type: funnel.template_type,
      created_at: funnel.created_at,
      folder: funnel.folder
    })),
    [funnels]
  );

  // Filter projects based on search and folder
  const filteredProjects = useMemo(() => {
    return funnelProjects.filter(project => {
      const searchMatch = searchTerm === "" || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (project.folder && project.folder.toLowerCase().includes(searchTerm.toLowerCase()));
      const folderMatch = selectedFolder === "all" || 
        (selectedFolder === "no-folder" && !project.folder) || 
        project.folder === selectedFolder;
      return searchMatch && folderMatch;
    });
  }, [funnelProjects, searchTerm, selectedFolder]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFolder("all");
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters = searchTerm !== "" || selectedFolder !== "all";

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await deleteFunnel.mutateAsync(projectToDelete);
      setProjectToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (projectId: string) => {
    navigate(`/funnel-editor/${projectId}`);
  };

  // Rename handlers
  const handleRenameClick = (funnel: { id: string; name: string }) => {
    setFunnelToRename(funnel);
    setNewFunnelName(funnel.name);
    setRenameDialogOpen(true);
  };

  const handleConfirmRename = async () => {
    if (!funnelToRename || !user) return;
    
    const trimmedName = newFunnelName.trim();
    
    if (!trimmedName) {
      toast.error("Nome inválido", { description: "O nome do funil não pode estar vazio." });
      return;
    }
    
    if (trimmedName.length > 50) {
      toast.error("Nome muito longo", { description: "O nome deve ter no máximo 50 caracteres." });
      return;
    }
    
    // Check if name changed
    if (trimmedName.toLowerCase() === funnelToRename.name.toLowerCase()) {
      setRenameDialogOpen(false);
      setFunnelToRename(null);
      return;
    }
    
    setIsRenaming(true);
    
    try {
      // Check if name already exists
      const nameExists = await checkFunnelNameExists(trimmedName, user.id);
      if (nameExists) {
        toast.error("Nome já existe", { description: "Já existe um funil com este nome." });
        setIsRenaming(false);
        return;
      }
      
      const { error } = await supabase
        .from('funnels')
        .update({ name: trimmedName, updated_at: new Date().toISOString() })
        .eq('id', funnelToRename.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      toast.success("Funil renomeado com sucesso");
      setRenameDialogOpen(false);
      setFunnelToRename(null);
    } catch (error) {
      toast.error("Erro ao renomear funil");
    } finally {
      setIsRenaming(false);
    }
  };

  // Get selected row IDs
  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection).filter(id => rowSelection[id]);
  }, [rowSelection]);

  const handleBulkDelete = async () => {
    if (selectedIds.length > 0) {
      await deleteMultipleFunnels.mutateAsync(selectedIds);
      setRowSelection({});
    }
    setBulkDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<FunnelItem>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      size: 250,
    },
    {
      accessorKey: 'template_type',
      header: 'Tipo',
      cell: ({ row }) => getTypeBadge(row.original.template_type),
      size: 120,
    },
    {
      accessorKey: 'created_at',
      header: 'Criado em',
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString('pt-BR'),
      size: 150,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleEditClick(row.original.id);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleRenameClick({ id: row.original.id, name: row.original.name });
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row.original.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 80,
      enableSorting: false,
      meta: {
        headerClassName: 'text-right',
        cellClassName: 'text-right',
      },
    },
  ], []);

  const table = useReactTable({
    columns,
    data: filteredProjects,
    pageCount: Math.ceil(filteredProjects.length / pagination.pageSize),
    getRowId: (row) => row.id,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funis de Vendas</h1>
          <p className="text-muted-foreground">Crie e gerencie seus funis de conversão</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Funil
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar funis..." 
            className="pl-10 bg-input border-border" 
            value={searchTerm} 
            onChange={e => {
              setSearchTerm(e.target.value);
              setPagination(prev => ({ ...prev, pageIndex: 0 }));
            }} 
          />
        </div>
        
        {/* Bulk delete button */}
        {selectedIds.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={() => setBulkDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir {selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Filtros ativos:</span>
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Busca: "{searchTerm}"</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setSearchTerm("");
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }} 
              />
            </Badge>
          )}
          {selectedFolder !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Pasta: {selectedFolder === "no-folder" ? "Sem pasta" : selectedFolder}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setSelectedFolder("all");
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }} 
              />
            </Badge>
          )}
        </div>
      )}

      {/* Funnels List with DataGrid */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Meus Funis</CardTitle>
          <CardDescription>Todos os seus funis organizados</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum funil encontrado</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters ? "Tente ajustar os filtros ou criar um novo funil" : "Crie seu primeiro funil para começar"}
              </p>
            </div>
          ) : (
            <DataGrid table={table} recordCount={filteredProjects.length}>
              <div className="w-full">
                <DataGridContainer className="border-0 rounded-none">
                  <ScrollArea>
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </DataGridContainer>
                <DataGridPagination className="border-t px-4" />
              </div>
            </DataGrid>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateFunnelDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onConfirm={handleConfirmDelete} 
        title="Excluir Funil" 
        description="Tem certeza que deseja excluir este funil? Esta ação não pode ser desfeita e todos os elementos do funil serão perdidos." 
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={bulkDeleteDialogOpen} 
        onOpenChange={setBulkDeleteDialogOpen} 
        onConfirm={handleBulkDelete} 
        title="Excluir Funis Selecionados" 
        description={`Tem certeza que deseja excluir ${selectedIds.length} funis? Esta ação não pode ser desfeita e todos os elementos dos funis serão perdidos.`} 
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Funil</DialogTitle>
            <DialogDescription>
              Digite um novo nome para o funil.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="funnel-name">Nome</Label>
            <Input
              id="funnel-name"
              value={newFunnelName}
              onChange={(e) => setNewFunnelName(e.target.value)}
              placeholder="Nome do funil"
              className={cn(
                newFunnelName.length > 50 && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="flex justify-between items-center">
              <span className={cn(
                "text-xs",
                newFunnelName.length > 50 ? "text-destructive" : "text-muted-foreground"
              )}>
                {newFunnelName.length}/50 caracteres
              </span>
              {newFunnelName.length > 50 && (
                <span className="text-xs text-destructive">Limite excedido</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmRename} 
              disabled={isRenaming || !newFunnelName.trim() || newFunnelName.length > 50}
            >
              {isRenaming ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}