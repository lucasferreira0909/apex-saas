import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProjects } from "@/hooks/useProjects";
import { useProjectHistory } from "@/hooks/useProjectHistory";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  visitors: {
    label: "Projetos",
  },
  funnels: {
    label: "Funis",
    color: "hsl(var(--primary))",
  },
  messages: {
    label: "Mensagens",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig

export default function InteractiveProjectsChart() {
  const { projects } = useProjects();
  const { history } = useProjectHistory();
  const [timeRange, setTimeRange] = React.useState("90d")

  const chartData = useMemo(() => {
    let daysToShow = 90;
    if (timeRange === "30d") {
      daysToShow = 30;
    } else if (timeRange === "7d") {
      daysToShow = 7;
    }

    const days = eachDayOfInterval({
      start: subDays(new Date(), daysToShow - 1),
      end: new Date()
    });

    // Combine current projects and historical data
    const allProjects = [
      ...projects.map(p => ({ created: p.created, type: p.type })),
      ...history.filter(h => h.project_type).map(h => ({ created: h.created_date, type: h.project_type }))
    ];

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      
      const funnelsCount = allProjects.filter(project => 
        project.type === 'funnel' && 
        format(new Date(project.created), 'yyyy-MM-dd') === dayStr
      ).length;

      const messagesCount = allProjects.filter(project => 
        project.type === 'message' && 
        format(new Date(project.created), 'yyyy-MM-dd') === dayStr
      ).length;

      return {
        date: format(day, 'yyyy-MM-dd'),
        funnels: funnelsCount,
        messages: messagesCount,
      };
    });
  }, [projects, history, timeRange]);

  const totalProjects = chartData.reduce((sum, day) => sum + day.funnels + day.messages, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-card-foreground">Projetos Criados</CardTitle>
          <CardDescription>
            {totalProjects} projetos no período selecionado
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Selecionar período"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 dias
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 dias
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillFunnels" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--secondary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--secondary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="messages"
              type="natural"
              fill="url(#fillMessages)"
              stroke="hsl(var(--secondary))"
              stackId="a"
            />
            <Area
              dataKey="funnels"
              type="natural"
              fill="url(#fillFunnels)"
              stroke="hsl(var(--primary))"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}