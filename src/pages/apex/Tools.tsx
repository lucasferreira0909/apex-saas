import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, MessageSquare, Hash, MessageSquareQuote, Image, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  features: string[];
}
const tools: Tool[] = [{
  id: "roi-calculator",
  title: "Calculadora de ROI",
  description: "Calcule o retorno do investimento dos seus projetos",
  icon: Calculator,
  route: "/roi-calculator",
  features: ["Cálculo preciso", "Relatórios", "Comparação de projetos"]
}, {
  id: "whatsapp-generator",
  title: "Gerador de Link WhatsApp",
  description: "Crie links personalizados para WhatsApp",
  icon: MessageSquare,
  route: "/whatsapp-generator",
  features: ["Link personalizado", "Mensagem pré-definida", "Rastreamento"]
}, {
  id: "hashtag-generator",
  title: "Gerador de Hashtags",
  description: "Gere hashtags relevantes para suas publicações",
  icon: Hash,
  route: "/hashtag-generator",
  features: ["Hashtags inteligentes", "Análise de tendências", "Múltiplas categorias"]
}, {
  id: "testimonial-generator",
  title: "Criador de Depoimentos",
  description: "Gere depoimentos convincentes para seu produto ou serviço",
  icon: MessageSquareQuote,
  route: "/testimonial-generator",
  features: ["3, 6 ou 9 depoimentos", "Estilos variados", "Geração por IA"]
}, {
  id: "image-generator",
  title: "Gerador de Imagens",
  description: "Crie imagens incríveis com inteligência artificial",
  icon: Image,
  route: "/image-generator",
  features: ["Geração por IA", "Múltiplas proporções", "Download direto"]
}, {
  id: "product-calculator",
  title: "Calculador de Produto",
  description: "Calcule o preço ideal para seus produtos",
  icon: ShoppingBag,
  route: "/product-calculator",
  features: ["Cálculo de margem", "Impostos inclusos", "Custo total"]
}];
export default function Tools() {
  return <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ferramentas</h1>
        <p className="text-muted-foreground">Conjunto de ferramentas para potencializar seus projetos</p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => {
        const IconComponent = tool.icon;
        return <Card key={tool.id} className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-card-foreground">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tool.features.map((feature, index) => <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-1 h-1 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                      {feature}
                    </li>)}
                </ul>
                <Link to={tool.route} className="block">
                  <Button className="w-full group-hover:scale-[1.02] transition-transform">
                    Abrir Ferramenta
                  </Button>
                </Link>
              </CardContent>
            </Card>;
      })}
      </div>
    </div>;
}