import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Video, ArrowLeft, Copy, Check, Lightbulb, Music, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedScript {
  hook: string;
  development: string[];
  cta: string;
  audioSuggestion: string;
  tips: string[];
}

export default function ScriptGenerator() {
  const [platform, setPlatform] = useState("reels");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30");
  const [style, setStyle] = useState("educational");
  const [audience, setAudience] = useState("");
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    if (!topic.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o tema do vídeo.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedScript(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: { platform, topic, duration, style, audience }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedScript(data);
      toast({
        title: "Roteiro gerado!",
        description: "Seu roteiro viral está pronto."
      });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Erro ao gerar roteiro",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyFullScript = async () => {
    if (!generatedScript) return;
    const fullScript = `🎬 GANCHO (0-3s)
${generatedScript.hook}

📖 DESENVOLVIMENTO
${generatedScript.development.map((point, i) => `${i + 1}. ${point}`).join('\n')}

🎯 CTA
${generatedScript.cta}

🎵 Sugestão de Áudio
${generatedScript.audioSuggestion}

💡 Dicas de Produção
${generatedScript.tips.map(tip => `• ${tip}`).join('\n')}`;

    await navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado!",
      description: "Roteiro copiado para a área de transferência."
    });
  };

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
            <Video className="h-8 w-8 mr-3 text-primary" />
            Gerador de Roteiros
          </h1>
          <p className="text-muted-foreground">Crie roteiros virais para Reels e TikTok</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Configure seu roteiro de vídeo curto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Plataforma</Label>
              <RadioGroup value={platform} onValueChange={setPlatform} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reels" id="reels" />
                  <Label htmlFor="reels" className="font-normal cursor-pointer">Instagram Reels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tiktok" id="tiktok" />
                  <Label htmlFor="tiktok" className="font-normal cursor-pointer">TikTok</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Tema do Vídeo *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Ex: Como aumentar vendas no Instagram"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-3">
              <Label>Duração</Label>
              <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15" id="d15" />
                  <Label htmlFor="d15" className="font-normal cursor-pointer">15 segundos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="d30" />
                  <Label htmlFor="d30" className="font-normal cursor-pointer">30 segundos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="60" id="d60" />
                  <Label htmlFor="d60" className="font-normal cursor-pointer">60 segundos</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Estilo</Label>
              <RadioGroup value={style} onValueChange={setStyle} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="educational" id="educational" />
                  <Label htmlFor="educational" className="font-normal cursor-pointer">Educativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entertainment" id="entertainment" />
                  <Label htmlFor="entertainment" className="font-normal cursor-pointer">Entretenimento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="storytelling" id="storytelling" />
                  <Label htmlFor="storytelling" className="font-normal cursor-pointer">Storytelling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tutorial" id="tutorial" />
                  <Label htmlFor="tutorial" className="font-normal cursor-pointer">Tutorial</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Público-alvo (opcional)</Label>
              <Input
                id="audience"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="Ex: Empreendedores iniciantes"
                className="bg-input border-border"
              />
            </div>

            <Button onClick={generateScript} disabled={isGenerating || !topic.trim()} className="w-full">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Roteiro...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Gerar Roteiro
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Roteiro Gerado</CardTitle>
                <CardDescription>{generatedScript ? "Seu roteiro está pronto!" : "Aguardando geração"}</CardDescription>
              </div>
              {generatedScript && (
                <Button variant="outline" size="sm" onClick={copyFullScript}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar Tudo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedScript ? (
              <div className="text-center py-12">
                <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum roteiro gerado</h3>
                <p className="text-muted-foreground">Configure e clique em "Gerar Roteiro"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium text-primary">GANCHO (0-3s)</Label>
                  </div>
                  <p className="text-foreground font-medium">{generatedScript.hook}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <Label className="text-xs text-muted-foreground mb-2 block">📖 DESENVOLVIMENTO</Label>
                  <ul className="space-y-2">
                    {generatedScript.development.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-medium">{index + 1}.</span>
                        <span className="text-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Label className="text-xs text-green-600 mb-2 block">🎯 CTA</Label>
                  <p className="text-foreground font-medium">{generatedScript.cta}</p>
                </div>

                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="h-4 w-4 text-purple-500" />
                    <Label className="text-xs text-purple-600">SUGESTÃO DE ÁUDIO</Label>
                  </div>
                  <p className="text-foreground">{generatedScript.audioSuggestion}</p>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <Label className="text-xs text-amber-600">DICAS DE PRODUÇÃO</Label>
                  </div>
                  <ul className="space-y-1">
                    {generatedScript.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {tip}
                      </li>
                    ))}
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
