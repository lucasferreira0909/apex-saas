import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, MessageSquare, Hash, MessageSquareQuote, Image, ShoppingBag, FileText, Type, Tag, Mail, Video, Users, Search, UserCircle, Receipt, Globe } from "lucide-react";
import { Link } from "react-router-dom";

type Category = 'all' | 'calculadoras' | 'conteudo' | 'visual' | 'marketing';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  features: string[];
  category: Category;
}

const tools: Tool[] = [
  {
    id: "roi-calculator",
    title: "Calculadora de ROI",
    description: "Calcule o retorno do investimento dos seus projetos",
    icon: Calculator,
    route: "/roi-calculator",
    features: ["Cálculo preciso", "Relatórios", "Comparação de projetos"],
    category: "calculadoras"
  },
  {
    id: "product-calculator",
    title: "Calculador de Produto",
    description: "Calcule o preço ideal para seus produtos",
    icon: ShoppingBag,
    route: "/product-calculator",
    features: ["Cálculo de margem", "Impostos inclusos", "Custo total"],
    category: "calculadoras"
  },
  {
    id: "copy-generator",
    title: "Gerador de Copy Persuasiva",
    description: "Crie copies persuasivas que convertem vendas",
    icon: FileText,
    route: "/copy-generator",
    features: ["Copy otimizada", "Múltiplos tons", "Geração por IA"],
    category: "conteudo"
  },
  {
    id: "headline-generator",
    title: "Gerador de Headlines",
    description: "Crie headlines virais para Instagram, TikTok e YouTube",
    icon: Type,
    route: "/headline-generator",
    features: ["Instagram, TikTok, YouTube", "5 headlines por geração", "Dicas de uso"],
    category: "conteudo"
  },
  {
    id: "email-generator",
    title: "Gerador de E-mails",
    description: "Crie emails de marketing que convertem",
    icon: Mail,
    route: "/email-generator",
    features: ["5 tipos de email", "Múltiplos tons", "Assunto otimizado"],
    category: "conteudo"
  },
  {
    id: "script-generator",
    title: "Gerador de Roteiros",
    description: "Crie roteiros virais para Reels e TikTok",
    icon: Video,
    route: "/script-generator",
    features: ["Reels e TikTok", "Gancho + CTA", "Dicas de produção"],
    category: "conteudo"
  },
  {
    id: "image-generator",
    title: "Gerador de Imagens",
    description: "Crie imagens incríveis com inteligência artificial",
    icon: Image,
    route: "/image-generator",
    features: ["Geração por IA", "Edição de imagens", "3 imagens/dia"],
    category: "visual"
  },
  {
    id: "offer-generator",
    title: "Gerador de Oferta Persuasiva",
    description: "Crie ofertas irresistíveis para seus produtos",
    icon: Tag,
    route: "/offer-generator",
    features: ["Estrutura completa", "Benefícios e bônus", "CTA otimizado"],
    category: "marketing"
  },
  {
    id: "testimonial-generator",
    title: "Criador de Depoimentos",
    description: "Gere depoimentos convincentes para seu produto ou serviço",
    icon: MessageSquareQuote,
    route: "/testimonial-generator",
    features: ["3, 6 ou 9 depoimentos", "Estilos variados", "Geração por IA"],
    category: "marketing"
  },
  {
    id: "persona-generator",
    title: "Gerador de Persona",
    description: "Crie personas detalhadas do seu cliente ideal",
    icon: Users,
    route: "/persona-generator",
    features: ["Perfil completo", "Dores e desejos", "Gatilhos de compra"],
    category: "marketing"
  },
  {
    id: "hashtag-generator",
    title: "Gerador de Hashtags",
    description: "Gere hashtags relevantes para suas publicações",
    icon: Hash,
    route: "/hashtag-generator",
    features: ["Hashtags inteligentes", "Análise de tendências", "Múltiplas categorias"],
    category: "marketing"
  },
  {
    id: "profile-structure-generator",
    title: "Estrutura de Perfil",
    description: "Crie a estrutura ideal para o perfil do seu negócio",
    icon: UserCircle,
    route: "/profile-structure-generator",
    features: ["Bio otimizada", "Pilares de conteúdo", "CTA estratégico"],
    category: "marketing"
  },
  {
    id: "orderbump-generator",
    title: "Gerador de OrderBumps",
    description: "Crie OrderBumps persuasivos que aumentam seu ticket médio",
    icon: Receipt,
    route: "/orderbump-generator",
    features: ["Headlines chamativas", "Benefícios estruturados", "Texto de checkbox"],
    category: "marketing"
  },
  {
    id: "useful-sites",
    title: "Sites Úteis",
    description: "Coleção curada de ferramentas e sites essenciais",
    icon: Globe,
    route: "/useful-sites",
    features: ["Design e Marketing", "IA e Produtividade", "Pagamentos e E-commerce"],
    category: "marketing"
  },
  {
    id: "whatsapp-generator",
    title: "Gerador de Link WhatsApp",
    description: "Crie links personalizados para WhatsApp",
    icon: MessageSquare,
    route: "/whatsapp-generator",
    features: ["Link personalizado", "Mensagem pré-definida", "Rastreamento"],
    category: "marketing"
  }
];

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "calculadoras", label: "Calculadoras" },
  { value: "conteudo", label: "Conteúdo" },
  { value: "visual", label: "Visual" },
  { value: "marketing", label: "Marketing" }
];

export default function Tools() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = search === "" || 
        tool.title.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ferramentas</h1>
        <p className="text-muted-foreground">Conjunto de ferramentas para potencializar seus projetos</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ferramentas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {filteredTools.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {filteredTools.length} {filteredTools.length === 1 ? 'ferramenta encontrada' : 'ferramentas encontradas'}
          </p>
        )}
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma ferramenta encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar sua busca ou filtro</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => {
            const IconComponent = tool.icon;
            return (
              <Card key={tool.id} className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
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
          })}
        </div>
      )}
    </div>
  );
}
