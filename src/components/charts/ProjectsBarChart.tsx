import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useProjects } from "@/hooks/useProjects";
import { useMemo } from "react";

const chartConfig = {
  projects: {
    label: "Projetos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ProjectsBarChart() {
  const { projects } = useProjects();

  const chartData = useMemo(() => {
    // Get last 6 months
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'long' }),
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        projects: 0
      });
    }

    // Count projects per month
    projects.forEach(project => {
      const createdDate = new Date(project.created);
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthData = months.find(m => m.monthKey === monthKey);
      if (monthData) {
        monthData.projects++;
      }
    });

    return months;
  }, [projects]);

  // Calculate trend
  const currentMonth = chartData[chartData.length - 1]?.projects || 0;
  const previousMonth = chartData[chartData.length - 2]?.projects || 0;
  const trend = previousMonth > 0 
    ? (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1)
    : currentMonth > 0 ? "100" : "0";

  const trendPositive = Number(trend) >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projetos Criados</CardTitle>
        <CardDescription>
          {chartData[0]?.month} - {chartData[chartData.length - 1]?.month} {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="projects" fill="var(--color-projects)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trendPositive ? "Crescimento" : "Redução"} de {Math.abs(Number(trend))}% este mês 
          <TrendingUp className={`h-4 w-4 ${trendPositive ? "" : "rotate-180"}`} />
        </div>
        <div className="text-muted-foreground leading-none">
          Mostrando total de projetos criados nos últimos 6 meses
        </div>
      </CardFooter>
    </Card>
  );
}
