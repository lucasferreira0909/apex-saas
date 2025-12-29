import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
} from "recharts";
import { useState, useMemo } from "react";

const generateChartData = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const baseConsumption = Math.floor(Math.random() * 30) + 10;
    const projected = Math.floor(baseConsumption * 0.9 + Math.random() * 10);
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      consumption: baseConsumption,
      projected: projected,
    });
  }
  
  return data;
};

const chartConfig = {
  consumption: {
    label: "Consumo",
    color: "hsl(var(--primary))",
  },
};

type PeriodOption = "7" | "30" | "90";

export function CreditsChart() {
  const [period, setPeriod] = useState<PeriodOption>("30");

  const chartData = useMemo(() => {
    return generateChartData(parseInt(period));
  }, [period]);

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.consumption));
    return Math.ceil(max / 50) * 50 + 50;
  }, [chartData]);

  return (
    <Card className="bg-card border-border rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Consumo de Créditos ao Longo do Tempo
        </CardTitle>
        <Select value={period} onValueChange={(value: PeriodOption) => setPeriod(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              interval={period === "7" ? 0 : period === "30" ? 4 : 14}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, maxValue]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              fill="url(#consumptionGradient)"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
