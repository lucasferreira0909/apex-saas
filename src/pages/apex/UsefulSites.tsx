import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowLeft, Search, ExternalLink, Palette, TrendingUp, Clock, PenTool, BarChart2, Sparkles, CreditCard, Server, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

type SiteCategory = 'all' | 'design' | 'marketing' | 'produtividade' | 'copywriting' | 'seo' | 'ia' | 'pagamentos' | 'hospedagem' | 'ecommerce';

interface UsefulSite {
  id: string;
  name: string;
  description: string;
  url: string;
  category: Exclude<SiteCategory, 'all'>;
  icon: React.ComponentType<any>;
}

const sites: UsefulSite[] = [
  // Design
  { id: "canva", name: "Canva", description: "Crie designs incríveis sem ser designer", url: "https://www.canva.com", category: "design", icon: Palette },
  { id: "figma", name: "Figma", description: "Ferramenta colaborativa de design de interfaces", url: "https://www.figma.com", category: "design", icon: Palette },
  { id: "removebg", name: "Remove.bg", description: "Remova fundos de imagens automaticamente", url: "https://www.remove.bg", category: "design", icon: Palette },
  { id: "unsplash", name: "Unsplash", description: "Banco de imagens gratuitas em alta resolução", url: "https://unsplash.com", category: "design", icon: Palette },
  { id: "pexels", name: "Pexels", description: "Fotos e vídeos gratuitos de alta qualidade", url: "https://www.pexels.com", category: "design", icon: Palette },
  { id: "coolors", name: "Coolors", description: "Gerador de paletas de cores", url: "https://coolors.co", category: "design", icon: Palette },
  
  // Marketing
  { id: "google-trends", name: "Google Trends", description: "Analise tendências de busca no Google", url: "https://trends.google.com", category: "marketing", icon: TrendingUp },
  { id: "ubersuggest", name: "Ubersuggest", description: "Ferramenta de pesquisa de palavras-chave", url: "https://neilpatel.com/ubersuggest", category: "marketing", icon: TrendingUp },
  { id: "answerthepublic", name: "AnswerThePublic", description: "Descubra o que as pessoas perguntam online", url: "https://answerthepublic.com", category: "marketing", icon: TrendingUp },
  { id: "meta-ads", name: "Meta Ads Library", description: "Veja anúncios ativos no Facebook e Instagram", url: "https://www.facebook.com/ads/library", category: "marketing", icon: TrendingUp },
  
  // Produtividade
  { id: "notion", name: "Notion", description: "Organize notas, tarefas e projetos em um só lugar", url: "https://www.notion.so", category: "produtividade", icon: Clock },
  { id: "trello", name: "Trello", description: "Gerencie projetos com quadros Kanban", url: "https://trello.com", category: "produtividade", icon: Clock },
  { id: "clickup", name: "ClickUp", description: "Plataforma completa de produtividade", url: "https://clickup.com", category: "produtividade", icon: Clock },
  { id: "calendly", name: "Calendly", description: "Agende reuniões sem troca de emails", url: "https://calendly.com", category: "produtividade", icon: Clock },
  
  // Copywriting
  { id: "hemingway", name: "Hemingway Editor", description: "Torne sua escrita mais clara e direta", url: "https://hemingwayapp.com", category: "copywriting", icon: PenTool },
  { id: "headline-analyzer", name: "CoSchedule Headline", description: "Analise a qualidade das suas headlines", url: "https://coschedule.com/headline-analyzer", category: "copywriting", icon: PenTool },
  { id: "thesaurus", name: "Sinônimos.com.br", description: "Dicionário de sinônimos em português", url: "https://www.sinonimos.com.br", category: "copywriting", icon: PenTool },
  
  // SEO
  { id: "gtmetrix", name: "GTmetrix", description: "Analise a velocidade do seu site", url: "https://gtmetrix.com", category: "seo", icon: BarChart2 },
  { id: "pagespeed", name: "PageSpeed Insights", description: "Teste de performance do Google", url: "https://pagespeed.web.dev", category: "seo", icon: BarChart2 },
  { id: "seoptimer", name: "SEOptimer", description: "Auditoria SEO gratuita do seu site", url: "https://www.seoptimer.com", category: "seo", icon: BarChart2 },
  { id: "ahrefs-free", name: "Ahrefs Free Tools", description: "Ferramentas SEO gratuitas", url: "https://ahrefs.com/free-seo-tools", category: "seo", icon: BarChart2 },
  
  // IA
  { id: "chatgpt", name: "ChatGPT", description: "Assistente de IA para diversas tarefas", url: "https://chat.openai.com", category: "ia", icon: Sparkles },
  { id: "midjourney", name: "Midjourney", description: "Geração de imagens por IA", url: "https://www.midjourney.com", category: "ia", icon: Sparkles },
  { id: "elevenlabs", name: "ElevenLabs", description: "Síntese de voz realista com IA", url: "https://elevenlabs.io", category: "ia", icon: Sparkles },
  { id: "claude", name: "Claude", description: "Assistente de IA avançado da Anthropic", url: "https://claude.ai", category: "ia", icon: Sparkles },
  { id: "runway", name: "Runway", description: "Edição de vídeo com IA", url: "https://runwayml.com", category: "ia", icon: Sparkles },
  
  // Pagamentos
  { id: "stripe", name: "Stripe", description: "Processamento de pagamentos online", url: "https://stripe.com", category: "pagamentos", icon: CreditCard },
  { id: "mercadopago", name: "Mercado Pago", description: "Pagamentos e checkout no Brasil", url: "https://www.mercadopago.com.br", category: "pagamentos", icon: CreditCard },
  { id: "paypal", name: "PayPal", description: "Pagamentos internacionais", url: "https://www.paypal.com", category: "pagamentos", icon: CreditCard },
  { id: "hotmart", name: "Hotmart", description: "Plataforma de produtos digitais", url: "https://www.hotmart.com", category: "pagamentos", icon: CreditCard },
  
  // Hospedagem
  { id: "vercel", name: "Vercel", description: "Hospedagem para aplicações web modernas", url: "https://vercel.com", category: "hospedagem", icon: Server },
  { id: "hostinger", name: "Hostinger", description: "Hospedagem web acessível", url: "https://www.hostinger.com.br", category: "hospedagem", icon: Server },
  { id: "cloudflare", name: "Cloudflare", description: "CDN e proteção para sites", url: "https://www.cloudflare.com", category: "hospedagem", icon: Server },
  
  // E-commerce
  { id: "shopify", name: "Shopify", description: "Plataforma completa de e-commerce", url: "https://www.shopify.com", category: "ecommerce", icon: ShoppingCart },
  { id: "nuvemshop", name: "Nuvemshop", description: "Loja virtual para o Brasil", url: "https://www.nuvemshop.com.br", category: "ecommerce", icon: ShoppingCart },
  { id: "woocommerce", name: "WooCommerce", description: "E-commerce para WordPress", url: "https://woocommerce.com", category: "ecommerce", icon: ShoppingCart },
];

const categories: { value: SiteCategory; label: string; icon: React.ComponentType<any> }[] = [
  { value: "all", label: "Todos", icon: Globe },
  { value: "design", label: "Design", icon: Palette },
  { value: "marketing", label: "Marketing", icon: TrendingUp },
  { value: "produtividade", label: "Produtividade", icon: Clock },
  { value: "copywriting", label: "Copywriting", icon: PenTool },
  { value: "seo", label: "SEO", icon: BarChart2 },
  { value: "ia", label: "IA", icon: Sparkles },
  { value: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { value: "hospedagem", label: "Hospedagem", icon: Server },
  { value: "ecommerce", label: "E-commerce", icon: ShoppingCart },
];

const categoryColors: Record<Exclude<SiteCategory, 'all'>, string> = {
  design: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  marketing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  produtividade: "bg-green-500/10 text-green-600 border-green-500/20",
  copywriting: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  seo: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  ia: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  pagamentos: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  hospedagem: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  ecommerce: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

export default function UsefulSites() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SiteCategory>("all");

  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const matchesSearch = search === "" || 
        site.name.toLowerCase().includes(search.toLowerCase()) ||
        site.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || site.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Globe className="h-8 w-8 mr-3 text-[#e8e8e8]" />
            Sites Úteis
          </h1>
          <p className="text-muted-foreground">Coleção curada de ferramentas e sites essenciais</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sites..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const IconComponent = cat.icon;
              return (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>

          {filteredSites.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {filteredSites.length} {filteredSites.length === 1 ? 'site encontrado' : 'sites encontrados'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum site encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar sua busca ou filtro</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map(site => {
            const IconComponent = site.icon;
            const categoryLabel = categories.find(c => c.value === site.category)?.label || site.category;
            
            return (
              <Card key={site.id} className="bg-card border-border hover:shadow-lg transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <IconComponent className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-card-foreground">{site.name}</CardTitle>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[site.category]}`}>
                          {categoryLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-sm">{site.description}</CardDescription>
                  <a 
                    href={site.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Acessar <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
