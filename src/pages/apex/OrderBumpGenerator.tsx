import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, ArrowLeft, Copy, Check, DollarSign, Tag, CheckSquare, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedOrderBump {
  headline: string;
  description: string;
  benefits: string[];
  checkboxText: string;
  savingsArgument: string;
}

export default function OrderBumpGenerator() {
  const [mainProductName, setMainProductName] = useState("");
  const [mainProductPrice, setMainProductPrice] = useState("");
  const [orderBumpName, setOrderBumpName] = useState("");
  const [orderBumpPrice, setOrderBumpPrice] = useState("");
  const [mainBenefit, setMainBenefit] = useState("");
  const [tone, setTone] = useState("");
  const [generatedOrderBump, setGeneratedOrderBump] = useState<GeneratedOrderBump | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateOrderBump = async () => {
    if (!mainProductName.trim() || !mainProductPrice.trim() || !orderBumpName.trim() || !orderBumpPrice.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedOrderBump(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-orderbump', {
        body: { mainProductName, mainProductPrice, orderBumpName, orderBumpPrice, mainBenefit, tone }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedOrderBump(data);
      toast({
        title: "OrderBump gerado!",
        description: "Seu OrderBump persuasivo está pronto."
      });
    } catch (error) {
      console.error('Error generating order bump:', error);
      toast({
        title: "Erro ao gerar OrderBump",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyOrderBump = async () => {
    if (!generatedOrderBump) return;
    const orderBumpText = `ORDERBUMP - ${orderBumpName}

HEADLINE
${generatedOrderBump.headline}

DESCRIÇÃO
${generatedOrderBump.description}

BENEFÍCIOS
${generatedOrderBump.benefits.map(b => `• ${b}`).join('\n')}

TEXTO DO CHECKBOX
☐ ${generatedOrderBump.checkboxText}

ARGUMENTO DE ECONOMIA
${generatedOrderBump.savingsArgument}`;

    await navigator.clipboard.writeText(orderBumpText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <p className="text-muted-foreground">Crie OrderBumps persuasivos que aumentam seu ticket médio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Informe sobre o produto e OrderBump</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mainProductName">Produto Principal *</Label>
                <Input
                  id="mainProductName"
                  value={mainProductName}
                  onChange={e => setMainProductName(e.target.value)}
                  placeholder="Ex: Curso de Marketing"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mainProductPrice">Preço (R$) *</Label>
                <Input
                  id="mainProductPrice"
                  value={mainProductPrice}
                  onChange={e => setMainProductPrice(e.target.value)}
                  placeholder="Ex: 497"
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderBumpName">Nome do OrderBump *</Label>
                <Input
                  id="orderBumpName"
                  value={orderBumpName}
                  onChange={e => setOrderBumpName(e.target.value)}
                  placeholder="Ex: Kit de Templates"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderBumpPrice">Preço OrderBump (R$) *</Label>
                <Input
                  id="orderBumpPrice"
                  value={orderBumpPrice}
                  onChange={e => setOrderBumpPrice(e.target.value)}
                  placeholder="Ex: 47"
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainBenefit">Benefício Principal do OrderBump (opcional)</Label>
              <Textarea
                id="mainBenefit"
                value={mainBenefit}
                onChange={e => setMainBenefit(e.target.value)}
                placeholder="Qual o principal benefício que o OrderBump oferece ao cliente?"
                className="bg-input border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tom da Oferta</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="exclusivo">Exclusivo</SelectItem>
                  <SelectItem value="complementar">Complementar</SelectItem>
                  <SelectItem value="economico">Econômico</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateOrderBump} 
              disabled={isGenerating || !mainProductName.trim() || !mainProductPrice.trim() || !orderBumpName.trim() || !orderBumpPrice.trim()} 
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando OrderBump...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Gerar OrderBump
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
                <CardTitle className="text-card-foreground">OrderBump Gerado</CardTitle>
                <CardDescription>{generatedOrderBump ? "Seu OrderBump está pronto!" : "Aguardando geração"}</CardDescription>
              </div>
              {generatedOrderBump && (
                <Button variant="outline" size="sm" onClick={copyOrderBump}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedOrderBump ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum OrderBump gerado</h3>
                <p className="text-muted-foreground">Configure e clique em "Gerar OrderBump"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview Card */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border-2 border-dashed border-amber-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 uppercase">Oferta Especial</span>
                  </div>
                  
                  {/* Headline */}
                  <h3 className="text-lg font-bold text-foreground mb-2">{generatedOrderBump.headline}</h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3">{generatedOrderBump.description}</p>
                  
                  {/* Benefits */}
                  <div className="space-y-1 mb-4">
                    {generatedOrderBump.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Checkbox Preview */}
                  <div className="p-3 bg-background/50 rounded-lg border border-border flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{generatedOrderBump.checkboxText}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-bold text-green-600">R$ {orderBumpPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings Argument */}
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-green-600 font-medium">ARGUMENTO DE ECONOMIA/VALOR</Label>
                  </div>
                  <p className="text-foreground">{generatedOrderBump.savingsArgument}</p>
                </div>

                {/* Tips */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">💡 Dicas de Uso</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Posicione o OrderBump logo acima do botão de compra</li>
                    <li>• Use cores que contrastem com o fundo da página</li>
                    <li>• Mantenha o preço visível e destacado</li>
                    <li>• Teste diferentes versões da headline</li>
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
