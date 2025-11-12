import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, MessageSquare, Hash, Plus, Folder, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  features: string[];
}
const tools: Tool[] = [{
  id: "roi-calculator",
  title: "Calculadora de ROI",
  description: "Calcule o retorno do investimento dos seus projetos",
  icon: Calculator,
  route: "/roi-calculator",
  features: ["Cálculo preciso", "Relatórios", "Comparação de projetos"]
}, {
  id: "whatsapp-generator",
  title: "Gerador de Link WhatsApp",
  description: "Crie links personalizados para WhatsApp",
  icon: MessageSquare,
  route: "/whatsapp-generator",
  features: ["Link personalizado", "Mensagem pré-definida", "Rastreamento"]
}, {
  id: "hashtag-generator",
  title: "Gerador de Hashtags",
  description: "Gere hashtags relevantes para suas publicações",
  icon: Hash,
  route: "/hashtag-generator",
  features: ["Hashtags inteligentes", "Análise de tendências", "Múltiplas categorias"]
}];
export default function Tools() {
  const { projects, addProject } = useProjects();
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<"funnel" | "video" | "message">("funnel");

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Digite um nome para o projeto");
      return;
    }

    const result = await addProject({
      name: projectName,
      type: projectType,
      status: "draft",
      stats: {},
    });

    if (result) {
      toast.success("Projeto criado com sucesso!");
      setProjectName("");
      setProjectType("funnel");
      setOpen(false);
    } else {
      toast.error("Erro ao criar projeto");
    }
  };

  const getProjectTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      funnel: "Funil",
      video: "Vídeo",
      message: "Mensagem",
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "primary",
      completed: "default",
      draft: "secondary",
      paused: "warning",
    };
    return colors[status] || "secondary";
  };

  return <div className="space-y-8">
      {/* Tools Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">​Geradores</h1>
          <p className="text-muted-foreground">Conjunto de ferramentas para potencializar seus projetos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => {
            const IconComponent = tool.icon;
            return <Card key={tool.id} className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-card-foreground">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tool.features.map((feature, index) => <li key={index} className="text-sm text-muted-foreground flex items-center">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                    {feature}
                  </li>)}
                </ul>
                <Link to={tool.route} className="block">
                  <Button className="w-full group-hover:scale-[1.02] transition-transform">
                    Abrir Ferramenta
                  </Button>
                </Link>
              </CardContent>
            </Card>;
          })}
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Projetos</h2>
            <p className="text-muted-foreground">Gerencie seus projetos criados</p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Criar Novo Projeto</SheetTitle>
                <SheetDescription>
                  Preencha as informações para criar um novo projeto
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto</Label>
                  <Input
                    id="name"
                    placeholder="Digite o nome do projeto"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Projeto</Label>
                  <Select value={projectType} onValueChange={(value: any) => setProjectType(value)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funnel">Funil</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="message">Mensagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateProject}>
                  Criar Projeto
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {projects.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum projeto criado ainda</p>
              <p className="text-sm">Clique em "Novo Projeto" para começar</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(project.created), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getProjectTypeLabel(project.type)}</Badge>
                    <Badge variant={getStatusColor(project.status) as any}>
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>;
}