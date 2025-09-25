import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, MessageSquare, Hash } from "lucide-react";
import { Link } from "react-router-dom";

export default function Tools() {
  const tools = [
    {
      id: "roi-calculator",
      title: "Calculadora de ROI",
      description: "Calcule o retorno do investimento dos seus projetos",
      icon: Calculator,
      color: "text-purple-600",
      route: "/roi-calculator",
      features: ["Cálculo preciso", "Relatórios", "Comparação de projetos"]
    },
    {
      id: "whatsapp-generator",
      title: "Gerador de Link WhatsApp",
      description: "Crie links personalizados para WhatsApp",
      icon: MessageSquare,
      color: "text-green-500",
      route: "/whatsapp-generator",
      features: ["Link personalizado", "Mensagem pré-definida", "Rastreamento"]
    },
    {
      id: "hashtag-generator",
      title: "Gerador de Hashtags",
      description: "Gere hashtags relevantes para suas publicações",
      icon: Hash,
      color: "text-blue-500",
      route: "/hashtag-generator",
      features: ["Hashtags inteligentes", "Análise de tendências", "Múltiplas categorias"]
    }
  ];

  const handleToolClick = (route: string) => {
    if (route !== "#") {
      // Use React Router navigation for internal routes
      window.location.href = route;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ferramentas</h1>
        <p className="text-muted-foreground">Conjunto de ferramentas para potencializar seus projetos</p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <Card key={tool.id} className="bg-card border-border hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <tool.icon className="h-6 w-6 text-primary" />
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
                    <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleToolClick(tool.route)}
                disabled={tool.route === "#"}
                variant={tool.route === "#" ? "outline" : "default"}
              >
                {tool.route === "#" ? "Em breve" : "Abrir Ferramenta"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}