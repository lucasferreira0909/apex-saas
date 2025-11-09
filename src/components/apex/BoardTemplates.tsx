import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, LayoutGrid } from "lucide-react";
import { BoardTemplate } from "@/types/board";

interface BoardTemplatesProps {
  onSelectTemplate: (template: BoardTemplate) => void;
}

export function BoardTemplates({ onSelectTemplate }: BoardTemplatesProps) {
  const templates: BoardTemplate[] = [
    {
      id: 'leads',
      title: 'Quadro de Leads',
      description: 'Organize e gerencie seus leads em diferentes estágios do funil',
      icon: Users,
      color: 'text-blue-600',
      features: ['Leads Não Abordados', 'Leads Pendentes', 'Leads Quentes'],
      defaultColumns: ['Leads Não Abordados', 'Leads Pendentes', 'Leads Quentes']
    },
    {
      id: 'free',
      title: 'Quadro Livre',
      description: 'Crie seu próprio quadro personalizado com colunas customizáveis',
      icon: LayoutGrid,
      color: 'text-purple-600',
      features: ['Colunas personalizadas', 'Flexibilidade total', 'Adaptável a qualquer processo'],
      defaultColumns: []
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <Card 
            key={template.id} 
            className="bg-card border-border hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted">
                  <template.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm">{template.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-1">
                {template.features.map((feature, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-center">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
                className="w-full"
              >
                Usar Modelo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
