import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProjects } from "@/hooks/useProjects";
import { useProjectHistory } from "@/hooks/useProjectHistory";
import { useMemo } from "react";

export default function ProjectsChart() {
  const { projects } = useProjects();
  const { history } = useProjectHistory();

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    // Combine current projects and historical data
    const allProjects = [
      ...projects.map(p => ({ created: p.created, type: p.type })),
      ...history.filter(h => h.project_type === 'funnel').map(h => ({ created: h.created_date, type: h.project_type }))
    ];

    // Remove duplicates based on creation date and ensure we only count funnels
    const uniqueProjects = allProjects.filter((project, index, self) => 
      project.type === 'funnel' && 
      index === self.findIndex(p => p.created === project.created)
    );

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const projectsCount = uniqueProjects.filter(project => 
        format(new Date(project.created), 'yyyy-MM-dd') === dayStr
      ).length;

      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        projects: projectsCount,
        fullDate: dayStr
      };
    });
  }, [projects, history]);

  const totalProjects = chartData.reduce((sum, day) => sum + day.projects, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Projetos Criados</CardTitle>
        <CardDescription>
          {totalProjects} projetos nos últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="projects" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}