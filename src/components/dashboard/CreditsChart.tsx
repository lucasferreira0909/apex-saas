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
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { useState, useMemo, useEffect } from "react";
import { useCredits, CreditTransaction } from "@/hooks/useCredits";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins } from "lucide-react";

const chartConfig = {
  consumption: {
    label: "Consumo",
    color: "hsl(var(--primary))",
  },
};

type PeriodOption = "7" | "30" | "90";

export function CreditsChart() {
  const [period, setPeriod] = useState<PeriodOption>("30");
  const { transactions, isLoading, refreshTransactions } = useCredits();

  useEffect(() => {
    refreshTransactions(parseInt(period));
  }, [period, refreshTransactions]);

  const chartData = useMemo(() => {
    const days = parseInt(period);
    const now = new Date();
    const data: { date: string; consumption: number; fullDate: string }[] = [];
    
    // Create map for each day
    const dailyConsumption: Record<string, number> = {};
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyConsumption[dateKey] = 0;
    }
    
    // Sum consumption per day (only negative amounts = consumption)
    transactions.forEach((t: CreditTransaction) => {
      if (t.amount < 0) {
        const dateKey = new Date(t.created_at).toISOString().split('T')[0];
        if (dailyConsumption[dateKey] !== undefined) {
          dailyConsumption[dateKey] += Math.abs(t.amount);
        }
      }
    });
    
    // Convert to chart format
    Object.keys(dailyConsumption).sort().forEach(dateKey => {
      const date = new Date(dateKey);
      data.push({
        fullDate: dateKey,
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        consumption: dailyConsumption[dateKey],
      });
    });
    
    return data;
  }, [transactions, period]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 50;
    const max = Math.max(...chartData.map(d => d.consumption));
    return Math.max(Math.ceil(max / 10) * 10 + 10, 20);
  }, [chartData]);

  const totalConsumption = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.consumption, 0);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-36" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-foreground">
            Consumo de Créditos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total consumido: <span className="font-medium text-foreground">{totalConsumption} créditos</span>
          </p>
        </div>
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
        {totalConsumption === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
            <Coins className="h-12 w-12 mb-3 opacity-50" />
            <p>Nenhum consumo de créditos no período</p>
            <p className="text-sm">Use as ferramentas para ver o gráfico de consumo</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#consumptionGradient)"
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
