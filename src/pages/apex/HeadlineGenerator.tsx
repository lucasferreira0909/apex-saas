import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Type, Copy, ArrowLeft, Sparkles, Instagram, Youtube, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
interface HeadlineResult {
  text: string;
  tip: string;
}
export default function HeadlineGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [style, setStyle] = useState("curiosidade");
  const [headlines, setHeadlines] = useState<HeadlineResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { credits, refreshCredits, deductCredits } = useCredits();

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const generateHeadlines = async () => {
    if (!topic.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o tema/assunto.",
        variant: "destructive"
      });
      return;
    }

    // Deduct credits before generating
    const canProceed = await deductCredits("headline");
    if (!canProceed) return;

    setIsGenerating(true);
    setHeadlines([]);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-headline', {
        body: {
          topic,
          platform,
          style
        }
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      setHeadlines(data.headlines);
      toast({
        title: "Headlines geradas!",
        description: `${data.headlines.length} headlines foram criadas para ${platform}.`
      });
    } catch (error) {
      console.error('Error generating headlines:', error);
      toast({
        title: "Erro ao gerar headlines",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const copySingleHeadline = (headline: HeadlineResult) => {
    navigator.clipboard.writeText(headline.text);
    toast({
      title: "Copiado!",
      description: "Headline copiada para a área de transferência."
    });
  };
  const copyAllHeadlines = () => {
    const text = headlines.map(h => h.text).join("\n\n");
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Todas as headlines foram copiadas."
    });
  };
  const getPlatformIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'tiktok':
        return <span className="text-xs font-bold">TT</span>;
      default:
        return null;
    }
  };
  const getPlatformLabel = () => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      default:
        return '';
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/tools">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Type className="h-8 w-8 mr-3 text-[#e8e8e8]" />
              Gerador de Headlines
            </h1>
            <p className="text-muted-foreground">Crie headlines virais para suas redes sociais</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Defina os parâmetros para gerar suas headlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tema/Assunto do Conteúdo *</Label>
              <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Como ganhar dinheiro na internet" className="bg-input border-border" />
            </div>

            <div className="space-y-3">
              <Label>Plataforma</Label>
              <RadioGroup value={platform} onValueChange={setPlatform} className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instagram" id="instagram" />
                  <Label htmlFor="instagram" className="font-normal cursor-pointer flex items-center gap-1">
                    <Instagram className="h-4 w-4" /> Instagram
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tiktok" id="tiktok" />
                  <Label htmlFor="tiktok" className="font-normal cursor-pointer">TikTok</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="youtube" id="youtube" />
                  <Label htmlFor="youtube" className="font-normal cursor-pointer flex items-center gap-1">
                    <Youtube className="h-4 w-4" /> YouTube
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Estilo de Abordagem</Label>
              <RadioGroup value={style} onValueChange={setStyle} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="curiosidade" id="curiosidade" />
                  <Label htmlFor="curiosidade" className="font-normal cursor-pointer">Curiosidade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beneficio" id="beneficio" />
                  <Label htmlFor="beneficio" className="font-normal cursor-pointer">Benefício</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="problema" id="problema" />
                  <Label htmlFor="problema" className="font-normal cursor-pointer">Problema/Dor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="numero" id="numero" />
                  <Label htmlFor="numero" className="font-normal cursor-pointer">Número/Lista</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={generateHeadlines} disabled={isGenerating || !topic.trim()} className="w-full">
              {isGenerating ? <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Headlines...
                </> : <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Headlines
                </>}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground flex items-center">
                  
                  Headlines Geradas
                </CardTitle>
                <CardDescription>
                  {headlines.length > 0 ? <span className="flex items-center gap-1">
                      {headlines.length} headlines para {getPlatformIcon()} {getPlatformLabel()}
                    </span> : "Aguardando geração"}
                </CardDescription>
              </div>
              {headlines.length > 0 && <Button variant="outline" size="sm" onClick={copyAllHeadlines}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Todas
                </Button>}
            </div>
          </CardHeader>
          <CardContent>
            {headlines.length === 0 ? <div className="text-center py-12">
                <Type className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma headline gerada</h3>
                <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Headlines"</p>
              </div> : <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {headlines.map((headline, index) => <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground mb-2">{headline.text}</p>
                        <p className="text-xs text-muted-foreground">💡 {headline.tip}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copySingleHeadline(headline)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      {headlines.length > 0 && <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-card-foreground mb-2">💡 Dicas para {getPlatformLabel()}:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {platform === 'instagram' && <>
                    <li>• Use emojis no início para chamar atenção no feed</li>
                    <li>• Headlines curtas funcionam melhor para carrosséis</li>
                    <li>• Teste diferentes ganchos nos stories</li>
                  </>}
                {platform === 'tiktok' && <>
                    <li>• O gancho nos primeiros 3 segundos é crucial</li>
                    <li>• Use linguagem coloquial e tendências atuais</li>
                    <li>• Crie curiosidade para manter o viewer até o final</li>
                  </>}
                {platform === 'youtube' && <>
                    <li>• Inclua palavras-chave no início do título</li>
                    <li>• Títulos entre 60-70 caracteres têm melhor CTR</li>
                    <li>• Combine com thumbnails que complementem o título</li>
                  </>}
              </ul>
            </div>
          </CardContent>
        </Card>}
    </div>;
}