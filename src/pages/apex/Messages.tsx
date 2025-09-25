import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MessageSquare, MoreHorizontal, Eye, Edit, Trash2, Copy, Users, Send, Clock, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateMessageDialog } from "@/components/apex/CreateMessageDialog";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
export default function Messages() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const {
    projects,
    getProjectsByType,
    deleteProject,
    getProjectStats
  } = useProjects();
  const messageCampaigns = getProjectsByType('message');
  const stats = getProjectStats();
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'paused':
        return <Badge variant="outline">Pausado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disparos WhatsApp</h1>
          <p className="text-muted-foreground">Configure e gerencie suas campanhas de mensagens</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Criar Campanha
        </Button>
      </div>

      {/* Search and Filter */}
      

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-medium text-card-foreground">Campanhas</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground mt-2">{stats.byType.message}</p>
            <p className="text-xs text-muted-foreground">{stats.byStatus.active} ativas</p>
          </CardContent>
        </Card>
        
        
        
        
        
        
      </div>

      {/* Message Flows List */}
      <div className="space-y-6">
        {messageCampaigns.length === 0 ? <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma campanha criada</h3>
            <p className="text-muted-foreground mb-4">Crie sua primeira campanha de mensagens</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Campanha
            </Button>
          </div> : <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {messageCampaigns.map(flow => <Card key={flow.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {getStatusBadge(flow.status)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/message-editor/${flow.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/message-editor/${flow.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteProject(flow.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-card-foreground">{flow.name}</CardTitle>
                  <CardDescription>{flow.folder || "Sem pasta"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>{flow.folder || "Sem pasta"}</span>
                    <span>{new Date(flow.updated).toLocaleDateString('pt-BR')}</span>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>

      {/* WhatsApp Configuration Notice */}
      <Card className="bg-card border-border border-l-4 border-l-warning">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <MessageSquare className="h-5 w-5 text-warning mt-1" />
            <div>
              <h4 className="font-medium text-card-foreground">Configuração do WhatsApp</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Para usar as funcionalidades de disparo, configure seu número do WhatsApp nas configurações.
              </p>
              <Link to="/settings">
                <Button variant="outline" size="sm" className="mt-2">
                  Configurar Agora
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Message Dialog */}
      <CreateMessageDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>;
}