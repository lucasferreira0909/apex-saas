import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Video, MessageSquare, TrendingUp, Users, Clock, BarChart3, DollarSign, Settings } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InteractiveProjectsChart from "@/components/charts/InteractiveProjectsChart";
export default function Dashboard() {
  const {
    projects,
    getProjectStats
  } = useProjects();
  const projectStats = getProjectStats();
  const stats = [{
    title: "Total de Projetos",
    value: projectStats.total.toString(),
    description: projectStats.total > 0 ? `${projectStats.total} projetos criados` : "Nenhum projeto ainda",
    icon: BarChart3,
    trend: projectStats.total > 0 ? "+100%" : "0%"
  }, {
    title: "Funis Ativos",
    value: projectStats.byStatus.active.toString(),
    description: `${projectStats.byType.funnel} funis total`,
    icon: Zap,
    trend: projectStats.byStatus.active > 0 ? "+100%" : "0%"
  }];
  const recentProjects = projects.slice(-3).reverse();
  const quickActions = [
    {
      title: "Criar Novo Funil",
      description: "Monte um funil de vendas completo",
      icon: Zap,
      href: "/funnels",
      color: "text-blue-600"
    },
    {
      title: "Ferramentas",
      description: "ROI, WhatsApp, hashtags e mais",
      icon: Settings,
      href: "/tools",
      color: "text-purple-600"
    }
  ];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Geral</h1>
          <p className="text-muted-foreground">Visão geral do seu marketing digital</p>
        </div>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <span className="text-success font-medium">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Projects Chart */}
      <InteractiveProjectsChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Ações Rápidas</CardTitle>
            <CardDescription>Comece um novo projeto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map(action => <Link key={action.title} to={action.href} className="block">
                <div className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <action.icon className="h-8 w-8 text-primary mr-3" />
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>)}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Projetos Recentes</CardTitle>
            <CardDescription>Seus últimos trabalhos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProjects.length === 0 ? <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum projeto criado ainda</p>
                </div> : recentProjects.map((project, index) => <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-success' : project.status === 'completed' ? 'bg-blue-600' : project.status === 'paused' ? 'bg-yellow-600' : 'bg-muted-foreground'}`}></div>
                      <div>
                        <p className="font-medium text-card-foreground text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{project.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.updated).toLocaleDateString('pt-BR')}
                    </span>
                  </div>)}
            </div>
            <div className="mt-4">
              <Link to="/library">
                <Button variant="outline" className="w-full text-sm">
                  Ver Todos os Projetos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}