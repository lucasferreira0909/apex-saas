import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Pen, 
  ArrowLeft, 
  Zap, 
  TrendingUp,
  Copy,
  Download,
  Save,
  RefreshCw,
  Play,
  Eye,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VideoScriptGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [scriptCount, setScriptCount] = useState("5");
  
  const generatedScripts = [
    {
      id: 1,
      title: "Como Duplicar Vendas em 30 Dias",
      hook: "Você está perdendo 70% das suas vendas e nem sabe...",
      content: "Neste vídeo revolucionário, vou te mostrar a estratégia exata que usei para duplicar vendas...",
      engagement: "Alto",
      trending: true,
      words: 156
    },
    {
      id: 2,
      title: "O Segredo dos Top 1% do Marketing",
      hook: "Enquanto você foca em likes, eles faturam milhões...",
      content: "Descobri por acaso a estratégia que apenas 1% dos marketers conhecem...",
      engagement: "Muito Alto",
      trending: true,
      words: 142
    },
    {
      id: 3,
      title: "Por Que Seus Anúncios Não Convertem",
      hook: "R$ 5.000 jogados fora em anúncios... até descobrir isso",
      content: "Gastei uma fortuna em tráfego pago sem resultado até aprender esta técnica...",
      engagement: "Médio",
      trending: false,
      words: 134
    }
  ];

  const viralElements = [
    { element: "Hook Magnético", present: true },
    { element: "História Pessoal", present: true },
    { element: "Prova Social", present: false },
    { element: "Urgência/Escassez", present: true },
    { element: "Call to Action", present: true }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 4000);
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'Muito Alto':
        return 'text-success';
      case 'Alto':
        return 'text-blue-600';
      case 'Médio':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/videos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerador de Roteiros</h1>
            <p className="text-muted-foreground">Crie roteiros similares a vídeos virais</p>
          </div>
        </div>
        
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Salvar Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Vídeo de Referência</CardTitle>
              <CardDescription>Link do vídeo viral que você quer usar como base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-input border-border"
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Quantidade de roteiros
                </label>
                <select 
                  value={scriptCount}
                  onChange={(e) => setScriptCount(e.target.value)}
                  className="w-full p-2 rounded-md bg-input border border-border"
                >
                  <option value="2">2 roteiros</option>
                  <option value="5">5 roteiros</option>
                  <option value="10">10 roteiros</option>
                </select>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !videoUrl}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Gerar Roteiros
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Viral Analysis */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Análise Viral</CardTitle>
              <CardDescription>Elementos identificados no vídeo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {viralElements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">{item.element}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      item.present ? 'bg-success' : 'bg-muted'
                    }`}></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-card-foreground">Potencial Viral: Alto</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  4/5 elementos virais identificados
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Preview do Vídeo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg h-32 flex items-center justify-center">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-card-foreground">Marketing Digital Secrets</p>
                <p className="text-xs text-muted-foreground">1.2M visualizações • 15K likes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Scripts */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">Roteiros Gerados</CardTitle>
                  <CardDescription>
                    {scriptCount} roteiros baseados no vídeo de referência
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {generatedScripts.length} de {scriptCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-border rounded-lg">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedScripts.map((script) => (
                    <div key={script.id} className="p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-card-foreground">{script.title}</h3>
                            {script.trending && (
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Hook:</strong> "{script.hook}"
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Star className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <Textarea
                        value={script.content}
                        readOnly
                        rows={3}
                        className="mb-3 bg-input/50 border-border text-sm"
                      />
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex space-x-4">
                          <span className="text-muted-foreground">{script.words} palavras</span>
                          <span className={`font-medium ${getEngagementColor(script.engagement)}`}>
                            Engajamento: {script.engagement}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}