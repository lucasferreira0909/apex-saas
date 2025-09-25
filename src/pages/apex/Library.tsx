import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Folder, Zap, MoreHorizontal, Edit, Trash2, Grid, List, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProjects } from "@/hooks/useProjects";
import { useFolders } from "@/hooks/useFolders";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useNavigate } from "react-router-dom";
export default function Library() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    projects,
    deleteProject
  } = useProjects();
  const {
    folders
  } = useFolders();

  // Filter only funnel projects
  const funnelProjects = projects.filter(project => project.type === 'funnel');
  const getProjectIcon = () => {
    return <Zap className="h-4 w-4 text-primary" />;
  };
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
    // Filter by search term
    const searchMatch = searchTerm === "" || project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.folder && project.folder.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by folder
    const folderMatch = selectedFolder === "all" || selectedFolder === "no-folder" && !project.folder || project.folder === selectedFolder;

    // Filter by status
    const statusMatch = selectedStatus === "all" || project.status === selectedStatus;
    return searchMatch && folderMatch && statusMatch;
  });
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFolder("all");
    setSelectedStatus("all");
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
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biblioteca</h1>
          <p className="text-muted-foreground">Todos os seus projetos organizados</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border border-border rounded-md">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar projetos..." className="pl-10 bg-input border-border" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
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
      {hasActiveFilters && <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Filtros ativos:</span>
          {searchTerm && <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Busca: "{searchTerm}"</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>}
          {selectedFolder !== "all" && <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Pasta: {selectedFolder === "no-folder" ? "Sem pasta" : selectedFolder}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedFolder("all")} />
            </Badge>}
          {selectedStatus !== "all" && <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {selectedStatus}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatus("all")} />
            </Badge>}
        </div>}

      {/* Projects Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Funis ({funnelProjects.length})</CardTitle>
          <CardDescription>Todos os seus funis organizados</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {filteredProjects.length === 0 ? <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum funil encontrado</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters ? "Tente ajustar os filtros ou criar um novo funil" : "Crie seu primeiro funil para começar"}
              </p>
            </div> : viewMode === "grid" ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map(project => <Card key={project.id} className="bg-muted/30 border-border hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="w-full h-32 bg-muted rounded-t-lg flex items-center justify-center">
                            {getProjectIcon()}
                          </div>
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(project.status)}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-card-foreground">{project.name}</h4>
                            
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(project.stats).map(([key, value], i) => (
                              <span key={key} className="mr-3">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(project.updated).toLocaleDateString('pt-BR')}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>)}
                </div> : <div className="space-y-2">
                  {filteredProjects.map(project => <div key={project.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        {getProjectIcon()}
                        <div>
                          <h4 className="font-medium text-card-foreground">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.folder || "Sem pasta"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(project.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(project.updated).toLocaleDateString('pt-BR')}
                        </span>
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
                      </div>
                    </div>)}
                </div>}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} title="Excluir Funil" description="Tem certeza que deseja excluir este funil? Esta ação não pode ser desfeita e todos os elementos do funil serão perdidos." />
    </div>;
}