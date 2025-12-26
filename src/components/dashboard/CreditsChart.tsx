import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { Calendar } from "lucide-react";
import { useState } from "react";

const chartData = [
  { month: "Jan", consumption: 120, projected: 100 },
  { month: "Fev", consumption: 180, projected: 150 },
  { month: "Mar", consumption: 150, projected: 180 },
  { month: "Abr", consumption: 280, projected: 220 },
  { month: "Mai", consumption: 220, projected: 260 },
  { month: "Jun", consumption: 340, projected: 300 },
];

const chartConfig = {
  consumption: {
    label: "Consumo",
    color: "hsl(var(--primary))",
  },
  projected: {
    label: "Projetado",
    color: "hsl(var(--muted-foreground))",
  },
};

export function CreditsChart() {
  const [dateRange, setDateRange] = useState("Jan - Jun");

  return (
    <Card className="bg-card border-border rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Consumo de Créditos ao Longo do Tempo
        </CardTitle>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          {dateRange}
        </Button>
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
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, 400]}
              ticks={[0, 100, 200, 300, 400]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              fill="url(#consumptionGradient)"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
