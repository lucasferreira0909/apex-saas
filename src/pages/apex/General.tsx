import { useState, useMemo } from "react";
import { Workflow, LayoutGrid, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFunnels } from "@/hooks/useFunnels";
import { useBoards } from "@/hooks/useBoards";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

type TimeRange = "daily" | "weekly" | "monthly";

const General = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const { data: funnels = [], isLoading: funnelsLoading } = useFunnels();
  const { data: boards = [], isLoading: boardsLoading } = useBoards();
  const { profile } = useAuth();

  // Fetch transactions for credit consumption
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions-consumption'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (timeRange === "daily") {
      // Last 7 days
      const startDate = subDays(now, 6);
      const days = eachDayOfInterval({ start: startDate, end: now });
      
      return days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayTransactions = transactions.filter(t => {
          const tDate = new Date(t.created_at);
          return tDate >= dayStart && tDate <= dayEnd;
        });
        
        const totalCredits = dayTransactions.reduce((sum, t) => sum + (t.credits_added || 0), 0);
        
        return {
          date: format(day, "dd/MM", { locale: ptBR }),
          creditos: totalCredits
        };
      });
    }
    
    if (timeRange === "weekly") {
      // Last 4 weeks
      const startDate = subWeeks(now, 3);
      const weeks = eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 });
      
      return weeks.map((weekStart, index) => {
        const weekEnd = index < weeks.length - 1 ? subDays(weeks[index + 1], 1) : now;
        
        const weekTransactions = transactions.filter(t => {
          const tDate = new Date(t.created_at);
          return tDate >= weekStart && tDate <= weekEnd;
        });
        
        const totalCredits = weekTransactions.reduce((sum, t) => sum + (t.credits_added || 0), 0);
        
        return {
          date: `Sem ${index + 1}`,
          creditos: totalCredits
        };
      });
    }
    
    // Monthly - Last 6 months
    const startDate = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: startDate, end: now });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.created_at);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      
      const totalCredits = monthTransactions.reduce((sum, t) => sum + (t.credits_added || 0), 0);
      
      return {
        date: format(month, "MMM", { locale: ptBR }),
        creditos: totalCredits
      };
    });
  }, [transactions, timeRange]);

  const chartConfig = {
    creditos: {
      label: "Créditos",
      color: "hsl(var(--primary))",
    },
  };

  const isLoading = funnelsLoading || boardsLoading || transactionsLoading;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Geral</h1>
        <p className="text-muted-foreground">Visão geral do seu workspace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funis</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : funnels.length}
            </div>
            <p className="text-xs text-muted-foreground">
              funis criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quadros</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : boards.length}
            </div>
            <p className="text-xs text-muted-foreground">
              quadros criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.credits ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              créditos restantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Consumption Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consumo de Créditos</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={timeRange === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("daily")}
              >
                Diário
              </Button>
              <Button
                variant={timeRange === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("weekly")}
              >
                Semanal
              </Button>
              <Button
                variant={timeRange === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("monthly")}
              >
                Mensal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCreditos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="creditos"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCreditos)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default General;
