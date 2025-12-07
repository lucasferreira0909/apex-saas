import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, ClipboardList, Pencil, RefreshCw } from "lucide-react";
interface FunnelTemplatesProps {
  onSelectTemplate: (templateType: 'sales' | 'ltv' | 'quiz' | 'blank' | 'remarketing') => void;
}
export function FunnelTemplates({
  onSelectTemplate
}: FunnelTemplatesProps) {
  const templates = [{
    id: 'sales',
    title: 'Funil de Vendas',
    description: 'Converta visitantes em clientes com um funil otimizado para vendas',
    icon: TrendingUp,
    color: 'text-green-600',
    features: ['Landing Page', 'Página de Captura', 'Página de Vendas', 'Thank You Page']
  }, {
    id: 'ltv',
    title: 'Funil de LTV',
    description: 'Maximize o valor do tempo de vida dos seus clientes',
    icon: DollarSign,
    color: 'text-blue-600',
    features: ['Upsell', 'Cross-sell', 'Retenção', 'Fidelização']
  }, {
    id: 'quiz',
    title: 'Funil de Quiz',
    description: 'Engaje e qualifique leads através de quizzes interativos',
    icon: ClipboardList,
    color: 'text-purple-600',
    features: ['Quiz Interativo', 'Qualificação', 'Segmentação', 'Resultados Personalizados']
  }, {
    id: 'remarketing',
    title: 'Funil de Remarketing',
    description: 'Recupere vendas abandonadas com mensagens automáticas',
    icon: RefreshCw,
    color: 'text-orange-600',
    features: ['Mensagem WhatsApp', 'Intervalo', 'Checkout']
  }, {
    id: 'blank',
    title: 'Criar do Zero',
    description: 'Comece com um funil em branco e personalize completamente',
    icon: Pencil,
    color: 'text-gray-600',
    features: ['Total flexibilidade', 'Personalizável', 'Adicione seus próprios elementos']
  }];
  return <div className="space-y-4">
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => <Card key={template.id} className="bg-card border-border hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted">
                  <template.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm">{template.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-1">
                {template.features.map((feature, index) => <li key={index} className="text-xs text-muted-foreground flex items-center">
                    <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                    {feature}
                  </li>)}
              </ul>
              <Button size="sm" onClick={() => onSelectTemplate(template.id as 'sales' | 'ltv' | 'quiz' | 'blank' | 'remarketing')} className="w-full bg-[#1e1e1e]">
                Usar Modelo
              </Button>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}