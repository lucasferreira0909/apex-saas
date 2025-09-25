import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateFunnelDialog } from "@/components/apex/CreateFunnelDialog";
import { FunnelTemplates } from "@/components/apex/FunnelTemplates";
import { useProjects } from "@/hooks/useProjects";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Funnels() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'sales' | 'ltv' | 'quiz' | null>(null);
  const { getProjectStats } = useProjects();
  
  const funnelStats = getProjectStats();

  const handleSelectTemplate = (templateType: 'sales' | 'ltv' | 'quiz') => {
    setSelectedTemplate(templateType);
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funis de Vendas</h1>
          <p className="text-muted-foreground">Crie e gerencie seus funis de conversão</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Funil
        </Button>
      </div>

      {/* Stats Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Resumo dos Funis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-card-foreground">{funnelStats.byType.funnel}</div>
            <div className="text-lg text-muted-foreground">Total de Funis Criados</div>
          </div>
        </CardContent>
      </Card>

      {/* Funnel Templates */}
      <FunnelTemplates onSelectTemplate={handleSelectTemplate} />

      {/* Library Shortcut */}
      <div className="flex justify-center">
        <Link to="/library">
          <Button variant="outline" className="px-8 py-3">
            <Plus className="h-5 w-5 mr-2" />
            Biblioteca de Funis
          </Button>
        </Link>
      </div>

      {/* Create Dialog */}
      <CreateFunnelDialog 
        open={showCreateDialog} 
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setSelectedTemplate(null);
        }}
        templateType={selectedTemplate}
      />
    </div>
  );
}