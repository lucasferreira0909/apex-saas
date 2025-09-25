import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Folder, Zap, Video, MessageSquare, MoreHorizontal, Eye, Edit, Trash2, FolderPlus, Grid, List, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProjects } from "@/hooks/useProjects";
import { useFolders } from "@/hooks/useFolders";

export default function Library() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { projects, deleteProject } = useProjects();
  const { folders } = useFolders();

  // Group projects by folder and count them
  const folderCounts = projects.reduce((acc, project) => {
    const folderName = project.folder || 'Sem pasta';
    acc[folderName] = (acc[folderName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allProjects = projects;

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'funnel':
        return <Zap className="h-4 w-4 text-purple-600" />;
      case 'video':
        return <Video className="h-4 w-4 text-green-600" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <Folder className="h-4 w-4 text-muted-foreground" />;
    }
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

  // Filter projects based on search, folder, status, and tab
  const filteredProjects = allProjects.filter(project => {
    // Filter by tab
    const tabMatch = activeTab === "all" || project.type === activeTab;
    
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.folder && project.folder.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by folder
    const folderMatch = selectedFolder === "all" || 
      (selectedFolder === "no-folder" && !project.folder) ||
      project.folder === selectedFolder;
    
    // Filter by status
    const statusMatch = selectedStatus === "all" || project.status === selectedStatus;
    
    return tabMatch && searchMatch && folderMatch && statusMatch;
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFolder("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters = searchTerm !== "" || selectedFolder !== "all" || selectedStatus !== "all";

  const getTabCount = (type: string) => {
    if (type === "all") return allProjects.length;
    return allProjects.filter(p => p.type === type).length;
  };

  return (
    <div className="space-y-6">
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
          <Input 
            placeholder="Buscar projetos..." 
            className="pl-10 bg-input border-border" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={hasActiveFilters ? "border-primary" : ""}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
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

      {/* Projects Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Todos ({getTabCount("all")})
              </TabsTrigger>
              <TabsTrigger value="funnel">
                Funis ({getTabCount("funnel")})
              </TabsTrigger>
              <TabsTrigger value="video">
                Vídeos ({getTabCount("video")})
              </TabsTrigger>
              <TabsTrigger value="message">
                Mensagens ({getTabCount("message")})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  {activeTab === "all" ? (
                    <>
                      <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum projeto encontrado</h3>
                      <p className="text-muted-foreground">
                        {hasActiveFilters ? "Tente ajustar os filtros ou criar um novo projeto" : "Crie seu primeiro projeto para começar"}
                      </p>
                    </>
                  ) : (
                    <>
                      {getProjectIcon(activeTab as any)}
                      <h3 className="text-lg font-medium text-card-foreground mb-2">
                        Nenhum projeto de {activeTab === "funnel" ? "funil" : activeTab === "video" ? "vídeo" : "mensagem"} encontrado
                      </h3>
                      <p className="text-muted-foreground">
                        Crie um novo projeto na aba específica
                      </p>
                    </>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map(project => (
                    <Card key={project.id} className="bg-muted/30 border-border hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="w-full h-32 bg-muted rounded-t-lg flex items-center justify-center">
                            {getProjectIcon(project.type)}
                          </div>
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(project.status)}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-card-foreground">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">{project.folder || "Sem pasta"}</p>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(project.stats).map(([key, value], i) => (
                              <div key={i}>{key}: {value}</div>
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
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => deleteProject(project.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        {getProjectIcon(project.type)}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteProject(project.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}