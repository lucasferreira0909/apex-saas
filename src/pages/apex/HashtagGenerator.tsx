import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hash, Copy, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HashtagGenerator() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [audience, setAudience] = useState("");
  const [description, setDescription] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const categories = [
    "Marketing Digital",
    "Empreendedorismo",
    "Vendas",
    "Saúde e Bem-estar",
    "Educação",
    "Tecnologia",
    "Moda e Beleza",
    "Alimentação",
    "Viagem",
    "Fitness",
    "Arte e Design",
    "Música",
    "Fotografia",
    "Lifestyle"
  ];

  const audienceTypes = [
    "Público Geral",
    "Empreendedores",
    "Profissionais de Marketing",
    "Jovens (18-25)",
    "Adultos (26-40)",
    "Pais de Família",
    "Profissionais Liberais",
    "Estudantes",
    "Aposentados"
  ];

  // Hashtags mock baseadas em categorias reais
  const hashtagDatabase = {
    "Marketing Digital": [
      "#marketingdigital", "#digitalmarketing", "#socialmedia", "#marketing", "#branding",
      "#contentmarketing", "#seo", "#ads", "#instagram", "#facebook", "#tiktok",
      "#influencer", "#copywriting", "#estrategia", "#vendasonline", "#negociodigital",
      "#empreendedorismo", "#startup", "#business", "#growth", "#leads", "#conversao"
    ],
    "Empreendedorismo": [
      "#empreendedorismo", "#entrepreneur", "#business", "#startup", "#negocio",
      "#sucesso", "#motivacao", "#lideranca", "#inovacao", "#mindset", "#metas",
      "#produtividade", "#networking", "#investimento", "#financas", "#crescimento",
      "#oportunidade", "#determinacao", "#foco", "#results", "#winning", "#hustle"
    ],
    "Vendas": [
      "#vendas", "#sales", "#vender", "#cliente", "#negociacao", "#prospeccao",
      "#crm", "#funil", "#conversao", "#leads", "#followup", "#closing", "#pitch",
      "#b2b", "#b2c", "#relacionamento", "#atendimento", "#sucesso", "#metas",
      "#performance", "#resultado", "#comissao", "#vendedor", "#salesforce"
    ]
  };

  const generateHashtags = async () => {
    if (!topic.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um tópico principal.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simular processamento de IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Gerar hashtags baseadas no tópico e categoria
    let baseHashtags = [];
    
    if (category && hashtagDatabase[category as keyof typeof hashtagDatabase]) {
      baseHashtags = [...hashtagDatabase[category as keyof typeof hashtagDatabase]];
    } else {
      baseHashtags = [
        "#" + topic.toLowerCase().replace(/\s+/g, ""),
        "#marketing", "#business", "#sucesso", "#crescimento", "#estrategia",
        "#digital", "#online", "#content", "#social", "#branding"
      ];
    }

    // Adicionar hashtags específicas do tópico
    const topicWords = topic.toLowerCase().split(" ");
    const topicHashtags = topicWords.map(word => "#" + word.replace(/[^a-zA-Z0-9]/g, ""));
    
    // Combinar e selecionar as melhores hashtags
    const allHashtags = [...new Set([...baseHashtags, ...topicHashtags])];
    const selectedHashtags = allHashtags.slice(0, 30);

    setGeneratedHashtags(selectedHashtags);
    setIsGenerating(false);

    toast({
      title: "Hashtags geradas!",
      description: `${selectedHashtags.length} hashtags foram criadas para o seu conteúdo.`
    });
  };

  const copyHashtags = (hashtags: string[]) => {
    const text = hashtags.join(" ");
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Hashtags copiadas para a área de transferência."
    });
  };

  const copyAllHashtags = () => {
    copyHashtags(generatedHashtags);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Hash className="h-8 w-8 mr-3 text-primary" />
          Gerador de Hashtags
        </h1>
        <p className="text-muted-foreground">Crie hashtags inteligentes para suas publicações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Configurações
            </CardTitle>
            <CardDescription>Defina os parâmetros para gerar suas hashtags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico Principal *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Marketing Digital para Pequenos Negócios"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Público-Alvo</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione o público-alvo" />
                </SelectTrigger>
                <SelectContent>
                  {audienceTypes.map(aud => (
                    <SelectItem key={aud} value={aud}>{aud}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Adicional</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva mais detalhadamente o conteúdo ou contexto..."
                className="bg-input border-border min-h-[100px]"
              />
            </div>

            <Button 
              onClick={generateHashtags} 
              disabled={isGenerating || !topic.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Hashtags...
                </>
              ) : (
                <>
                  <Hash className="h-4 w-4 mr-2" />
                  Gerar Hashtags
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Hashtags Geradas
                </CardTitle>
                <CardDescription>
                  {generatedHashtags.length > 0 ? `${generatedHashtags.length} hashtags criadas` : "Aguardando geração"}
                </CardDescription>
              </div>
              {generatedHashtags.length > 0 && (
                <Button variant="outline" size="sm" onClick={copyAllHashtags}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Todas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedHashtags.length === 0 ? (
              <div className="text-center py-12">
                <Hash className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma hashtag gerada</h3>
                <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Hashtags"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Popular/Trending Section */}
                <div>
                  <div className="flex items-center mb-3">
                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="text-sm font-medium text-card-foreground">Populares & Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {generatedHashtags.slice(0, 10).map((hashtag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => copyHashtags([hashtag])}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Niche/Specific Section */}
                <div>
                  <div className="flex items-center mb-3">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium text-card-foreground">Específicas & Nicho</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedHashtags.slice(10).map((hashtag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => copyHashtags([hashtag])}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-card-foreground mb-2">💡 Dicas de Uso:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use 5-10 hashtags por post no Instagram</li>
                    <li>• Misture hashtags populares com específicas</li>
                    <li>• Clique em qualquer hashtag para copiar individualmente</li>
                    <li>• Varie as hashtags entre diferentes posts</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}