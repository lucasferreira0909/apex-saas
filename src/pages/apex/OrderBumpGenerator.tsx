import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Receipt, ArrowLeft, Copy, Check, DollarSign, Package, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedOrderBump {
  name: string;
  suggestedPrice: string;
  deliverables: string[];
  headline: string;
  checkboxText: string;
}

interface GeneratedResult {
  orderBumps: GeneratedOrderBump[];
}

export default function OrderBumpGenerator() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const generateOrderBumps = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e preço do produto.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-orderbump', {
        body: { productName, productPrice, productDescription, targetAudience }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedResult(data);
      toast({
        title: "OrderBumps gerados!",
        description: "3 sugestões de OrderBumps estão prontas."
      });
    } catch (error) {
      console.error('Error generating order bumps:', error);
      toast({
        title: "Erro ao gerar OrderBumps",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyOrderBump = async (orderBump: GeneratedOrderBump, index: number) => {
    const orderBumpText = `ORDERBUMP: ${orderBump.name}

PREÇO SUGERIDO: R$ ${orderBump.suggestedPrice}

HEADLINE: ${orderBump.headline}

O QUE SERÁ ENTREGUE:
${orderBump.deliverables.map(d => `• ${d}`).join('\n')}

TEXTO DO CHECKBOX:
☐ ${orderBump.checkboxText}`;

    await navigator.clipboard.writeText(orderBumpText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copiado!",
      description: "OrderBump copiado para a área de transferência."
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
            <Receipt className="h-8 w-8 mr-3 text-primary" />
            Gerador de OrderBumps
          </h1>
          <p className="text-muted-foreground">Gere 3 sugestões de OrderBumps relacionados ao seu produto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Produto Principal</CardTitle>
            <CardDescription>Informe os detalhes do seu produto para gerar OrderBumps relacionados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nome do Produto *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="Ex: Curso de Marketing Digital"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productPrice">Preço (R$) *</Label>
                <Input
                  id="productPrice"
                  value={productPrice}
                  onChange={e => setProductPrice(e.target.value)}
                  placeholder="Ex: 497"
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrição do Produto (opcional)</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                placeholder="Descreva brevemente o que seu produto oferece..."
                className="bg-input border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Público-Alvo (opcional)</Label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="Ex: Empreendedores iniciantes"
                className="bg-input border-border"
              />
            </div>

            <Button 
              onClick={generateOrderBumps} 
              disabled={isGenerating || !productName.trim() || !productPrice.trim()} 
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando OrderBumps...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar 3 OrderBumps
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">OrderBumps Sugeridos</CardTitle>
            <CardDescription>
              {generatedResult ? "3 sugestões de OrderBumps para seu produto" : "Aguardando geração"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!generatedResult ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum OrderBump gerado</h3>
                <p className="text-muted-foreground">Preencha os dados do produto e clique em "Gerar 3 OrderBumps"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedResult.orderBumps.map((orderBump, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-amber-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{orderBump.name}</h3>
                          <div className="flex items-center gap-1 text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold">R$ {orderBump.suggestedPrice}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyOrderBump(orderBump, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 italic">"{orderBump.headline}"</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        O que será entregue:
                      </div>
                      <ul className="space-y-1 pl-6">
                        {orderBump.deliverables.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Check className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 p-2 bg-background/50 rounded border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Texto do checkbox:</p>
                      <p className="text-sm text-foreground">☐ {orderBump.checkboxText}</p>
                    </div>
                  </div>
                ))}

                {/* Tips */}
                <div className="p-4 bg-muted/50 rounded-lg mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">💡 Dicas de Uso</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Escolha o OrderBump que mais complementa seu produto</li>
                    <li>• Preços entre 10-20% do produto principal convertem melhor</li>
                    <li>• Teste diferentes versões para otimizar conversões</li>
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
