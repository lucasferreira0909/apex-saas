import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Copy, ArrowLeft, Sparkles, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";

interface CopyResult {
  headline: string;
  body: string;
  cta: string;
}

export default function CopyGenerator() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [objective, setObjective] = useState("venda");
  const [tone, setTone] = useState("urgente");
  const [copy, setCopy] = useState<CopyResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { credits, refreshCredits, deductCredits } = useCredits();

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const generateCopy = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e descrição do produto.",
        variant: "destructive"
      });
      return;
    }

    // Deduct credits before generating
    const canProceed = await deductCredits("copy");
    if (!canProceed) return;

    setIsGenerating(true);
    setCopy(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: {
          productName,
          productDescription,
          objective,
          tone
        }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setCopy(data.copy);
      toast({
        title: "Copy gerada!",
        description: "Sua copy persuasiva foi criada com sucesso."
      });
    } catch (error) {
      console.error('Error generating copy:', error);
      toast({
        title: "Erro ao gerar copy",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCopyToClipboard = () => {
    if (!copy) return;
    const text = `${copy.headline}\n\n${copy.body}\n\n${copy.cta}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Copy copiada para a área de transferência."
    });
  };

  return (
    <div className="space-y-6">
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
              <FileText className="h-8 w-8 mr-3 text-[#e8e8e8]" />
              Gerador de Copy Persuasiva
            </h1>
            <p className="text-muted-foreground">Crie copies persuasivas que convertem</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{credits} créditos</span>
          <span className="text-xs text-muted-foreground">({CREDIT_COSTS.copy} por uso)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Defina os parâmetros para gerar sua copy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto/Serviço *</Label>
              <Input
                id="productName"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="Ex: Curso de Marketing Digital"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrição *</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                placeholder="Descreva seu produto, benefícios e diferenciais..."
                className="bg-input border-border min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label>Objetivo da Copy</Label>
              <RadioGroup value={objective} onValueChange={setObjective} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="venda" id="venda" />
                  <Label htmlFor="venda" className="font-normal cursor-pointer">Venda Direta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="engajamento" id="engajamento" />
                  <Label htmlFor="engajamento" className="font-normal cursor-pointer">Engajamento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="captacao" id="captacao" />
                  <Label htmlFor="captacao" className="font-normal cursor-pointer">Captação de Leads</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lancamento" id="lancamento" />
                  <Label htmlFor="lancamento" className="font-normal cursor-pointer">Lançamento</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Tom da Mensagem</Label>
              <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgente" id="urgente" />
                  <Label htmlFor="urgente" className="font-normal cursor-pointer">Urgente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exclusivo" id="exclusivo" />
                  <Label htmlFor="exclusivo" className="font-normal cursor-pointer">Exclusivo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emocional" id="emocional" />
                  <Label htmlFor="emocional" className="font-normal cursor-pointer">Emocional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="racional" id="racional" />
                  <Label htmlFor="racional" className="font-normal cursor-pointer">Racional</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={generateCopy}
              disabled={isGenerating || !productName.trim() || !productDescription.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Copy...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Copy
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
                  Copy Gerada
                </CardTitle>
                <CardDescription>
                  {copy ? "Sua copy está pronta!" : "Aguardando geração"}
                </CardDescription>
              </div>
              {copy && (
                <Button variant="outline" size="sm" onClick={copyCopyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!copy ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma copy gerada</h3>
                <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Copy"</p>
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-bold text-card-foreground mb-3 text-lg">{copy.headline}</h4>
                <p className="text-muted-foreground text-sm whitespace-pre-line mb-4">{copy.body}</p>
                <div className="p-3 bg-primary/10 rounded text-sm font-medium text-primary">
                  {copy.cta}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      {copy && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-card-foreground mb-2">💡 Dicas de Uso:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adapte o tom da copy para cada canal (email, redes sociais, landing page)</li>
                <li>• Use a copy como base e personalize com dados específicos do seu público</li>
                <li>• Teste diferentes variações gerando novamente com parâmetros diferentes</li>
                <li>• Combine elementos da copy com seu próprio estilo de comunicação</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
