import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateFunnelDialog } from "@/components/apex/CreateFunnelDialog";
import { useFunnels, useDeleteFunnel } from "@/hooks/useFunnels";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, Search, Folder, MoreHorizontal, Edit, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);
  
  const navigate = useNavigate();
  const { data: funnels = [], isLoading } = useFunnels();
  const deleteFunnel = useDeleteFunnel();

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

  const columns = useMemo<ColumnDef<FunnelItem>[]>(() => [
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
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
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
    </div>
  );
}
