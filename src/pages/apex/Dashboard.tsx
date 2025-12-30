import { Workflow, LayoutGrid, Coins, Plus, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { CreditsChart } from "@/components/dashboard/CreditsChart";
import { RecentItemsTable } from "@/components/dashboard/RecentItemsTable";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { useAuth } from "@/hooks/useAuth";
import { useFunnels } from "@/hooks/useFunnels";
import { useBoards } from "@/hooks/useBoards";
import { useCredits } from "@/hooks/useCredits";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: funnels } = useFunnels();
  const { data: boards } = useBoards();
  const { credits, isLoading: creditsLoading } = useCredits();
  const { currentPlan, planInfo, counts, isLoading: planLoading } = usePlanLimits();
  const navigate = useNavigate();

  const firstName = profile?.first_name || profile?.email?.split("@")[0] || "User";
  const activeFunnels = funnels?.filter(f => f.status === "active").length || 0;
  const totalFunnels = funnels?.length || 0;
  const activeBoards = boards?.length || 0;

  // Calculate limits based on plan
  const funnelLimit = planInfo.limits.maxFunnels === -1 ? "∞" : planInfo.limits.maxFunnels;
  const boardLimit = planInfo.limits.maxBoards === -1 ? "∞" : planInfo.limits.maxBoards;
  const aiFlowLimit = planInfo.limits.maxAIFlows === -1 ? "∞" : planInfo.limits.maxAIFlows;

  const handleCreate = () => {
    navigate("/funnels");
  };

  const isLoading = creditsLoading || planLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bem-vindo de volta, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está uma visão geral do seu desempenho de marketing
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Novo
          </Button>
        </div>
      </div>

      {/* Plan Badge */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {currentPlan === "advanced" ? "Plano Advanced" : "Plano Growth"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentPlan === "advanced" ? "Recursos ilimitados" : "7 funis • 14 quadros • 3 fluxos"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/upgrades")}>
              {currentPlan === "advanced" ? "Gerenciar" : "Fazer Upgrade"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-[100px] rounded-xl" />
            <Skeleton className="h-[100px] rounded-xl" />
            <Skeleton className="h-[100px] rounded-xl" />
            <Skeleton className="h-[100px] rounded-xl" />
          </>
        ) : (
          <>
            <DashboardMetricCard 
              title="Funis" 
              value={`${totalFunnels}/${funnelLimit}`} 
              icon={Workflow} 
              verified={totalFunnels > 0}
            />
            <DashboardMetricCard 
              title="Quadros" 
              value={`${activeBoards}/${boardLimit}`} 
              icon={LayoutGrid} 
              verified={activeBoards > 0} 
            />
            <DashboardMetricCard 
              title="Fluxos de IA" 
              value={`${counts.aiFlows}/${aiFlowLimit}`} 
              icon={Workflow} 
              verified={counts.aiFlows > 0}
            />
            <DashboardMetricCard 
              title="Créditos" 
              value={credits.toLocaleString()} 
              icon={Coins} 
              verified={credits > 0}
            />
          </>
        )}
      </div>

      {/* Chart and Table */}
      <div className="grid grid-cols-1 gap-6">
        <CreditsChart />
        <RecentItemsTable />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal />
    </div>
  );
}
