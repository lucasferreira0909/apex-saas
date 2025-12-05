import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateFunnelDialog } from "@/components/apex/CreateFunnelDialog";
import { useProjects } from "@/hooks/useProjects";
import { useFolders } from "@/hooks/useFolders";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Plus, Search, Folder, MoreHorizontal, Edit, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

interface FunnelData {
  id: string;
  name: string;
  status: string;
  type: string;
  updated: string;
}

export default function Funnels() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();
  const { folders } = useFolders();

  // Filter only funnel projects
  const funnelProjects = projects.filter(project => project.type === 'funnel');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600 text-white">Concluído</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'paused':
        return <Badge variant="outline">Pausado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter projects based on search, folder and status
  const filteredProjects = useMemo(() => {
    return funnelProjects.filter(project => {
      const searchMatch = searchTerm === "" || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (project.folder && project.folder.toLowerCase().includes(searchTerm.toLowerCase()));
      const folderMatch = selectedFolder === "all" || 
        (selectedFolder === "no-folder" && !project.folder) || 
        project.folder === selectedFolder;
      const statusMatch = selectedStatus === "all" || project.status === selectedStatus;
      return searchMatch && folderMatch && statusMatch;
    });
  }, [funnelProjects, searchTerm, selectedFolder, selectedStatus]);

  const tableData: FunnelData[] = useMemo(() => {
    return filteredProjects.map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      type: project.type,
      updated: project.updated,
    }));
  }, [filteredProjects]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFolder("all");
    setSelectedStatus("all");
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters = searchTerm !== "" || selectedFolder !== "all" || selectedStatus !== "all";

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (projectId: string) => {
    navigate(`/funnel-editor/${projectId}`);
  };

  const columns = useMemo<ColumnDef<FunnelData>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
        size: 250,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => getStatusBadge(info.getValue() as string),
        size: 120,
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: (info) => <span className="capitalize">{info.getValue() as string}</span>,
        size: 100,
      },
      {
        accessorKey: 'updated',
        header: 'Atualizado',
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString('pt-BR'),
        size: 120,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditClick(row.original.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(row.original.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 60,
        meta: {
          headerClassName: 'text-right',
          cellClassName: 'text-right',
        },
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: tableData,
    pageCount: Math.ceil(tableData.length / pagination.pageSize),
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
        <Button onClick={() => setShowCreateDialog(true)} className="bg-[#1e1e1e]">
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
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <span />
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-card-foreground">Filtros</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Pasta</label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as pastas</SelectItem>
                    <SelectItem value="no-folder">Sem pasta</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.name}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Filtros ativos:</span>
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Busca: "{searchTerm}"</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
          {selectedFolder !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Pasta: {selectedFolder === "no-folder" ? "Sem pasta" : selectedFolder}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedFolder("all")} />
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {selectedStatus}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatus("all")} />
            </Badge>
          )}
        </div>
      )}

      {/* Funnels List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Meus Funis ({filteredProjects.length})</CardTitle>
          <CardDescription>Todos os seus funis organizados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum funil encontrado</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters ? "Tente ajustar os filtros ou criar um novo funil" : "Crie seu primeiro funil para começar"}
              </p>
            </div>
          ) : (
            <DataGrid table={table} recordCount={tableData.length}>
              <div className="w-full space-y-2.5">
                <DataGridContainer>
                  <ScrollArea>
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </DataGridContainer>
                <DataGridPagination />
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
