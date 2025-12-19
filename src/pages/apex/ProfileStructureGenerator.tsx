import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, ArrowLeft, Copy, Check, AtSign, Target, Lightbulb, MessageSquare, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedProfile {
  bio: string;
  highlights: string[];
  contentPillars: string[];
  cta: string;
  keywords: string[];
  tips: string[];
}

export default function ProfileStructureGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  const [tone, setTone] = useState("");
  const [generatedProfile, setGeneratedProfile] = useState<GeneratedProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateProfile = async () => {
    if (!businessName.trim() || !niche.trim() || !platform) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome do negócio, nicho e plataforma.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedProfile(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-profile-structure', {
        body: { businessName, niche, platform, valueProposition, tone }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedProfile(data);
      toast({
        title: "Estrutura gerada!",
        description: "A estrutura do seu perfil está pronta."
      });
    } catch (error) {
      console.error('Error generating profile structure:', error);
      toast({
        title: "Erro ao gerar estrutura",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyProfile = async () => {
    if (!generatedProfile) return;
    const profileText = `ESTRUTURA DE PERFIL - ${platform.toUpperCase()}

BIO
${generatedProfile.bio}

DESTAQUES/SEÇÕES
${generatedProfile.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

PILARES DE CONTEÚDO
${generatedProfile.contentPillars.map(p => `• ${p}`).join('\n')}

CALL-TO-ACTION
${generatedProfile.cta}

PALAVRAS-CHAVE
${generatedProfile.keywords.join(', ')}

DICAS
${generatedProfile.tips.map(t => `• ${t}`).join('\n')}`;

    await navigator.clipboard.writeText(profileText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado!",
      description: "Estrutura copiada para a área de transferência."
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
            <UserCircle className="h-8 w-8 mr-3 text-primary" />
            Estrutura de Perfil
          </h1>
          <p className="text-muted-foreground">Crie a estrutura ideal para o perfil do seu negócio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Informe sobre seu negócio e plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do Negócio/Marca *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Ex: Studio Criativo Design"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Nicho de Atuação *</Label>
              <Input
                id="niche"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                placeholder="Ex: Design gráfico para pequenas empresas"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma *</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueProposition">Proposta de Valor (opcional)</Label>
              <Textarea
                id="valueProposition"
                value={valueProposition}
                onChange={e => setValueProposition(e.target.value)}
                placeholder="O que torna seu negócio único? Qual transformação você oferece?"
                className="bg-input border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tom de Comunicação</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="descontraido">Descontraído</SelectItem>
                  <SelectItem value="inspirador">Inspirador</SelectItem>
                  <SelectItem value="educativo">Educativo</SelectItem>
                  <SelectItem value="provocativo">Provocativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateProfile} disabled={isGenerating || !businessName.trim() || !niche.trim() || !platform} className="w-full">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Estrutura...
                </>
              ) : (
                <>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Gerar Estrutura
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
                <CardTitle className="text-card-foreground">Estrutura Gerada</CardTitle>
                <CardDescription>{generatedProfile ? "Sua estrutura está pronta!" : "Aguardando geração"}</CardDescription>
              </div>
              {generatedProfile && (
                <Button variant="outline" size="sm" onClick={copyProfile}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedProfile ? (
              <div className="text-center py-12">
                <UserCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma estrutura gerada</h3>
                <p className="text-muted-foreground">Configure e clique em "Gerar Estrutura"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bio */}
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AtSign className="h-4 w-4 text-primary" />
                    <Label className="text-xs text-primary font-medium">BIO</Label>
                  </div>
                  <p className="text-foreground whitespace-pre-line">{generatedProfile.bio}</p>
                </div>

                {/* Highlights */}
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-amber-500" />
                    <Label className="text-xs text-amber-600 font-medium">DESTAQUES/SEÇÕES</Label>
                  </div>
                  <ul className="space-y-2">
                    {generatedProfile.highlights.map((highlight, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="font-bold text-amber-500">{i + 1}.</span>{highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Content Pillars */}
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-green-600 font-medium">PILARES DE CONTEÚDO</Label>
                  </div>
                  <ul className="space-y-1">
                    {generatedProfile.contentPillars.map((pillar, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-green-500">•</span>{pillar}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <Label className="text-xs text-blue-600 font-medium">CALL-TO-ACTION</Label>
                  </div>
                  <p className="text-foreground font-medium">{generatedProfile.cta}</p>
                </div>

                {/* Keywords */}
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-purple-500" />
                    <Label className="text-xs text-purple-600 font-medium">PALAVRAS-CHAVE</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedProfile.keywords.map((keyword, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-700">{keyword}</span>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground">DICAS</Label>
                  </div>
                  <ul className="space-y-1">
                    {generatedProfile.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span>💡</span>{tip}
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
