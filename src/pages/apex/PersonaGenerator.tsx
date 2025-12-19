import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, ArrowLeft, Copy, Check, Briefcase, DollarSign, Heart, ShoppingBag, MessageCircle, AlertCircle, Zap, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedPersona {
  name: string;
  age: number;
  profession: string;
  income: string;
  location?: string;
  education?: string;
  pains: string[];
  desires: string[];
  buyingBehavior: string;
  preferredChannels: string[];
  objections: string[];
  triggers: string[];
  quote: string;
}

export default function PersonaGenerator() {
  const [business, setBusiness] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [currentAudience, setCurrentAudience] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [generatedPersona, setGeneratedPersona] = useState<GeneratedPersona | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generatePersona = async () => {
    if (!business.trim() || !productDescription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o tipo de negócio e descrição do produto.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedPersona(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-persona', {
        body: { business, productDescription, currentAudience, priceRange }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedPersona(data);
      toast({
        title: "Persona gerada!",
        description: "Sua persona de cliente ideal está pronta."
      });
    } catch (error) {
      console.error('Error generating persona:', error);
      toast({
        title: "Erro ao gerar persona",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPersona = async () => {
    if (!generatedPersona) return;
    const personaText = `PERSONA: ${generatedPersona.name}, ${generatedPersona.age} anos

PERFIL
• Profissão: ${generatedPersona.profession}
• Renda: ${generatedPersona.income}
${generatedPersona.location ? `• Localização: ${generatedPersona.location}` : ''}
${generatedPersona.education ? `• Escolaridade: ${generatedPersona.education}` : ''}

DORES
${generatedPersona.pains.map(p => `• ${p}`).join('\n')}

DESEJOS
${generatedPersona.desires.map(d => `• ${d}`).join('\n')}

COMPORTAMENTO DE COMPRA
${generatedPersona.buyingBehavior}

CANAIS PREFERIDOS
${generatedPersona.preferredChannels.map(c => `• ${c}`).join('\n')}

OBJEÇÕES COMUNS
${generatedPersona.objections.map(o => `• ${o}`).join('\n')}

GATILHOS DE COMPRA
${generatedPersona.triggers.map(t => `• ${t}`).join('\n')}

FRASE TÍPICA
"${generatedPersona.quote}"`;

    await navigator.clipboard.writeText(personaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado!",
      description: "Persona copiada para a área de transferência."
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
            <Users className="h-8 w-8 mr-3 text-primary" />
            Gerador de Persona
          </h1>
          <p className="text-muted-foreground">Crie personas detalhadas do seu cliente ideal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Informe sobre seu negócio e produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business">Tipo de Negócio *</Label>
              <Input
                id="business"
                value={business}
                onChange={e => setBusiness(e.target.value)}
                placeholder="Ex: Agência de marketing digital"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrição do Produto/Serviço *</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                placeholder="Descreva seu produto ou serviço, seus benefícios e diferenciais..."
                className="bg-input border-border min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAudience">Informações sobre Público Atual (opcional)</Label>
              <Textarea
                id="currentAudience"
                value={currentAudience}
                onChange={e => setCurrentAudience(e.target.value)}
                placeholder="O que você já sabe sobre seus clientes atuais?"
                className="bg-input border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Faixa de Preço (opcional)</Label>
              <Input
                id="priceRange"
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                placeholder="Ex: R$ 500 a R$ 2.000"
                className="bg-input border-border"
              />
            </div>

            <Button onClick={generatePersona} disabled={isGenerating || !business.trim() || !productDescription.trim()} className="w-full">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Persona...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Gerar Persona
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
                <CardTitle className="text-card-foreground">Persona Gerada</CardTitle>
                <CardDescription>{generatedPersona ? "Sua persona está pronta!" : "Aguardando geração"}</CardDescription>
              </div>
              {generatedPersona && (
                <Button variant="outline" size="sm" onClick={copyPersona}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedPersona ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma persona gerada</h3>
                <p className="text-muted-foreground">Configure e clique em "Gerar Persona"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header Card */}
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{generatedPersona.name}</h3>
                  <p className="text-muted-foreground">{generatedPersona.age} anos</p>
                </div>

                {/* Profile */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-xs text-muted-foreground">Profissão</Label>
                    </div>
                    <p className="text-sm font-medium text-foreground">{generatedPersona.profession}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-xs text-muted-foreground">Renda</Label>
                    </div>
                    <p className="text-sm font-medium text-foreground">{generatedPersona.income}</p>
                  </div>
                </div>

                {/* Pains */}
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <Label className="text-xs text-red-600 font-medium">DORES</Label>
                  </div>
                  <ul className="space-y-1">
                    {generatedPersona.pains.map((pain, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-red-500">•</span>{pain}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desires */}
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-green-600 font-medium">DESEJOS</Label>
                  </div>
                  <ul className="space-y-1">
                    {generatedPersona.desires.map((desire, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-green-500">•</span>{desire}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buying Behavior */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground">COMPORTAMENTO DE COMPRA</Label>
                  </div>
                  <p className="text-sm text-foreground">{generatedPersona.buyingBehavior}</p>
                </div>

                {/* Channels */}
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <Label className="text-xs text-blue-600 font-medium">CANAIS PREFERIDOS</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedPersona.preferredChannels.map((channel, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-700">{channel}</span>
                    ))}
                  </div>
                </div>

                {/* Triggers */}
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <Label className="text-xs text-amber-600 font-medium">GATILHOS DE COMPRA</Label>
                  </div>
                  <ul className="space-y-1">
                    {generatedPersona.triggers.map((trigger, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-amber-500">•</span>{trigger}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quote */}
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="h-4 w-4 text-purple-500" />
                    <Label className="text-xs text-purple-600 font-medium">FRASE TÍPICA</Label>
                  </div>
                  <p className="text-foreground italic">"{generatedPersona.quote}"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
