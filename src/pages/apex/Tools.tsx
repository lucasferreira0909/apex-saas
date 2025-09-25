import React, { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, MessageSquare, Hash, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

// Tipo para as ferramentas
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  features: string[];
}

// Dados estáticos das ferramentas para otimizar re-renderizações
const TOOLS_DATA: Tool[] = [
  {
    id: "roi-calculator",
    title: "Calculadora de ROI",
    description: "Calcule o retorno do investimento dos seus projetos",
    icon: Calculator,
    route: "/roi-calculator",
    features: ["Cálculo preciso", "Relatórios", "Comparação de projetos"]
  },
  {
    id: "whatsapp-generator",
    title: "Gerador de Link WhatsApp",
    description: "Crie links personalizados para WhatsApp",
    icon: MessageSquare,
    route: "/whatsapp-generator",
    features: ["Link personalizado", "Mensagem pré-definida", "Rastreamento"]
  },
  {
    id: "hashtag-generator",
    title: "Gerador de Hashtags",
    description: "Gere hashtags relevantes para suas publicações",
    icon: Hash,
    route: "/hashtag-generator",
    features: ["Hashtags inteligentes", "Análise de tendências", "Múltiplas categorias"]
  }
];

// Componente de ferramenta memoizado para melhor performance
const ToolCard = memo(({ tool }: { tool: Tool }) => {
  const IconComponent = tool.icon;
  
  return (
    <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-card-foreground">{tool.title}</CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {tool.features.map((feature, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-center">
              <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0"></div>
              {feature}
            </li>
          ))}
        </ul>
        <Link to={tool.route} className="block">
          <Button className="w-full group-hover:scale-[1.02] transition-transform">
            Abrir Ferramenta
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
});

ToolCard.displayName = "ToolCard";

const Tools = memo(() => {
  // Memoizar os dados para evitar recriação desnecessária
  const tools = useMemo(() => TOOLS_DATA, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ferramentas</h1>
        <p className="text-muted-foreground">Conjunto de ferramentas para potencializar seus projetos</p>
      </div>

      {/* Tools Grid - Otimizado com grid responsivo e carregamento rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
});

Tools.displayName = "Tools";

export default Tools;