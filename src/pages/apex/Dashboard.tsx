import { Workflow, LayoutGrid, Coins, Clock, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { CreditsChart } from "@/components/dashboard/CreditsChart";
import { RecentItemsTable } from "@/components/dashboard/RecentItemsTable";
import { TemplatesGallery } from "@/components/dashboard/TemplatesGallery";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { useAuth } from "@/hooks/useAuth";
import { useFunnels } from "@/hooks/useFunnels";
import { useBoards } from "@/hooks/useBoards";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
export default function Dashboard() {
  const {
    profile
  } = useAuth();
  const {
    data: funnels
  } = useFunnels();
  const {
    data: boards
  } = useBoards();
  const navigate = useNavigate();
  const firstName = profile?.first_name || profile?.email?.split("@")[0] || "User";
  const activeFunnels = funnels?.filter(f => f.status === "active").length || 0;
  const totalFunnels = funnels?.length || 0;
  const activeBoards = boards?.length || 0;
  const availableCredits = 1000; // Default credits - can be fetched from profile if needed

  // Calculate items expiring soon (items updated more than 30 days ago)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const expiringSoon = [...(funnels || []).filter(f => new Date(f.updated_at) < thirtyDaysAgo), ...(boards || []).filter(b => new Date(b.updated_at) < thirtyDaysAgo)].length;
  const handleExport = () => {
    toast({
      title: "Exportando dados",
      description: "Seus dados estão sendo preparados para download..."
    });
  };
  const handleCreate = () => {
    navigate("/funnels");
  };
  return <div className="space-y-6 animate-fade-in">
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard title="Funis Ativos" value={`${activeFunnels}/${totalFunnels}`} icon={Workflow} />
        <DashboardMetricCard title="Quadros Ativos" value={activeBoards} icon={LayoutGrid} verified={activeBoards > 0} />
        <DashboardMetricCard title="Créditos Disponíveis" value={availableCredits.toLocaleString()} icon={Coins} />
        <DashboardMetricCard title="Expirando em Breve" value={expiringSoon} icon={Clock} />
      </div>

      {/* Chart and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditsChart />
        <RecentItemsTable />
      </div>

      {/* Templates Gallery */}
      <TemplatesGallery />

      {/* Upgrade Modal */}
      <UpgradeModal />
    </div>;
}