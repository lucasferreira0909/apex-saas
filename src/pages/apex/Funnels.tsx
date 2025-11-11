import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateFunnelDialog } from "@/components/apex/CreateFunnelDialog";
import { useProjects } from "@/hooks/useProjects";
import { useFolders } from "@/hooks/useFolders";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Plus, Search, Filter, Folder, MoreHorizontal, Edit, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
const ITEMS_PER_PAGE = 10;
export default function Funnels() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const {
    projects,
    deleteProject,
    getProjectStats
  } = useProjects();
  const {
    folders
  } = useFolders();
  const funnelStats = getProjectStats();

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
  const filteredProjects = funnelProjects.filter(project => {
    const searchMatch = searchTerm === "" || project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.folder && project.folder.toLowerCase().includes(searchTerm.toLowerCase());
    const folderMatch = selectedFolder === "all" || selectedFolder === "no-folder" && !project.folder || project.folder === selectedFolder;
    const statusMatch = selectedStatus === "all" || project.status === selectedStatus;
    return searchMatch && folderMatch && statusMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFolder("all");
    setSelectedStatus("all");
    setCurrentPage(1);
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
      // Adjust page if needed after deletion
      if (paginatedProjects.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
    setDeleteDialogOpen(false);
  };
  const handleEditClick = (projectId: string) => {
    navigate(`/funnel-editor/${projectId}`);
  };
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 3;
    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(<PaginationItem key={i}>
            <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i} className="cursor-pointer">
              {i}
            </PaginationLink>
          </PaginationItem>);
      }
    } else {
      // Show first page
      items.push(<PaginationItem key={1}>
          <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1} className="cursor-pointer">
            1
          </PaginationLink>
        </PaginationItem>);

      // Show ellipsis if needed
      if (currentPage > 3) {
        items.push(<PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>);
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        items.push(<PaginationItem key={i}>
            <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i} className="cursor-pointer">
              {i}
            </PaginationLink>
          </PaginationItem>);
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(<PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>);
      }

      // Show last page
      items.push(<PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages} className="cursor-pointer">
            {totalPages}
          </PaginationLink>
        </PaginationItem>);
    }
    return items;
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funis de Vendas</h1>
          <p className="text-muted-foreground">Crie e gerencie seus funis de conversão</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-[neutr] bg-[#1e1e1e]">
          <Plus className="h-4 w-4 mr-2" />
          Criar Funil
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar funis..." className="pl-10 bg-input border-border" value={searchTerm} onChange={e => {
          setSearchTerm(e.target.value);
          handleFilterChange();
        }} />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-card-foreground">Filtros</h4>
                {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Pasta</label>
                <Select value={selectedFolder} onValueChange={value => {
                setSelectedFolder(value);
                handleFilterChange();
              }}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as pastas</SelectItem>
                    <SelectItem value="no-folder">Sem pasta</SelectItem>
                    {folders.map(folder => <SelectItem key={folder.id} value={folder.name}>
                        {folder.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={selectedStatus} onValueChange={value => {
                setSelectedStatus(value);
                handleFilterChange();
              }}>
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
      {hasActiveFilters && <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Filtros ativos:</span>
          {searchTerm && <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Busca: "{searchTerm}"</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => {
          setSearchTerm("");
          handleFilterChange();
        }} />
            </Badge>}
          {selectedFolder !== "all" && <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Pasta: {selectedFolder === "no-folder" ? "Sem pasta" : selectedFolder}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => {
          setSelectedFolder("all");
          handleFilterChange();
        }} />
            </Badge>}
          {selectedStatus !== "all" && <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {selectedStatus}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => {
          setSelectedStatus("all");
          handleFilterChange();
        }} />
            </Badge>}
        </div>}

      {/* Funnels List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Meus Funis (11)11{filteredProjects.length})</CardTitle>
          <CardDescription>Todos os seus funis organizados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum funil encontrado</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters ? "Tente ajustar os filtros ou criar um novo funil" : "Crie seu primeiro funil para começar"}
              </p>
            </div> : <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map(project => <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell className="capitalize">{project.type}</TableCell>
                      <TableCell>
                        {new Date(project.updated).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(project.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(project.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>}
            </>}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateFunnelDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} title="Excluir Funil" description="Tem certeza que deseja excluir este funil? Esta ação não pode ser desfeita e todos os elementos do funil serão perdidos." />
    </div>;
}