import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Workflow, LayoutGrid, TrendingDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

type TimeFilter = "daily" | "weekly" | "monthly";

const General = () => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily");

  // Fetch profile with credits
  const { data: profileData } = useQuery({
    queryKey: ["profile-credits", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch funnels count
  const { data: funnelsCount = 0 } = useQuery({
    queryKey: ["funnels-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("funnels")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch boards count
  const { data: boardsCount = 0 } = useQuery({
    queryKey: ["boards-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("boards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch transactions for credit consumption chart
  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions-chart", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Generate chart data based on filter
  const chartData = useMemo(() => {
    const now = new Date();
    let intervals: Date[] = [];
    let dateFormat: string;
    let groupFn: (date: Date) => string;

    switch (timeFilter) {
      case "daily":
        intervals = eachDayOfInterval({
          start: subDays(now, 30),
          end: now,
        });
        dateFormat = "dd/MM";
        groupFn = (date: Date) => format(startOfDay(date), "yyyy-MM-dd");
        break;
      case "weekly":
        intervals = eachWeekOfInterval({
          start: subWeeks(now, 12),
          end: now,
        });
        dateFormat = "'Sem' w";
        groupFn = (date: Date) => format(startOfWeek(date), "yyyy-'W'ww");
        break;
      case "monthly":
        intervals = eachMonthOfInterval({
          start: subMonths(now, 12),
          end: now,
        });
        dateFormat = "MMM";
        groupFn = (date: Date) => format(startOfMonth(date), "yyyy-MM");
        break;
    }

    // Group transactions by period
    const grouped: Record<string, number> = {};
    transactions.forEach((t) => {
      const key = groupFn(new Date(t.created_at));
      grouped[key] = (grouped[key] || 0) + (t.credits_added || 0);
    });

    return intervals.map((date) => {
      const key = groupFn(date);
      return {
        name: format(date, dateFormat, { locale: ptBR }),
        consumo: grouped[key] || 0,
      };
    });
  }, [transactions, timeFilter]);

  const stats = [
    {
      title: "Créditos",
      value: profileData?.credits ?? 0,
      icon: Coins,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Funis",
      value: funnelsCount,
      icon: Workflow,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Quadros",
      value: boardsCount,
      icon: LayoutGrid,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Geral</h1>
        <p className="text-muted-foreground">Visão geral da sua conta</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stat.value.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consumption Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Consumo de Créditos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Acompanhe o uso de créditos de IA
              </p>
            </div>
          </div>
          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="daily" className="text-xs">
                Diário
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">
                Semanal
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">
                Mensal
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="name"
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [
                    `${value} créditos`,
                    "Consumo",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="consumo"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConsumo)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {chartData.every((d) => d.consumo === 0) && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              Nenhum consumo registrado no período selecionado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default General;
