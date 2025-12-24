import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Copy, ArrowLeft, Sparkles, Check, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
interface OfferResult {
  headline: string;
  subheadline: string;
  benefits: string[];
  bonuses: string[];
  urgency: string;
  cta: string;
  guarantee: string;
  priceAnchor: string;
}
export default function OfferGenerator() {
  const [productName, setProductName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [targetPain, setTargetPain] = useState("");
  const [offer, setOffer] = useState<OfferResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const generateOffer = async () => {
    if (!productName.trim() || !originalPrice || !offerPrice || !targetPain.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setOffer(null);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-offer', {
        body: {
          productName,
          originalPrice: parseFloat(originalPrice),
          offerPrice: parseFloat(offerPrice),
          deadline,
          bonuses,
          targetPain
        }
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      setOffer(data.offer);
      toast({
        title: "Oferta gerada!",
        description: "Sua oferta persuasiva foi criada com sucesso."
      });
    } catch (error) {
      console.error('Error generating offer:', error);
      toast({
        title: "Erro ao gerar oferta",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const copyFullOffer = () => {
    if (!offer) return;
    const text = `🔥 ${offer.headline}

${offer.subheadline}

✅ BENEFÍCIOS:
${offer.benefits.map(b => `• ${b}`).join('\n')}

🎁 BÔNUS EXCLUSIVOS:
${offer.bonuses.map(b => `• ${b}`).join('\n')}

💰 ${offer.priceAnchor}

⏰ ${offer.urgency}

🛡️ ${offer.guarantee}

👉 ${offer.cta}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Oferta completa copiada para a área de transferência."
    });
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
              <Tag className="h-8 w-8 mr-3 text-[#e8e8e8]" />
              Gerador de Oferta Persuasiva
            </h1>
            <p className="text-muted-foreground">Crie ofertas irresistíveis que convertem</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Defina os parâmetros para gerar sua oferta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto/Serviço *</Label>
              <Input id="productName" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ex: Mentoria de Marketing Digital" className="bg-input border-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Preço Original (R$) *</Label>
                <Input id="originalPrice" type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="997" className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerPrice">Preço Promocional (R$) *</Label>
                <Input id="offerPrice" type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="497" className="bg-input border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo da Oferta (opcional)</Label>
              <Input id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="Ex: Válido até sexta-feira" className="bg-input border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonuses">Bônus Inclusos (opcional)</Label>
              <Textarea id="bonuses" value={bonuses} onChange={e => setBonuses(e.target.value)} placeholder="Liste os bônus que serão inclusos na oferta..." className="bg-input border-border min-h-[80px]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPain">Principal Dor do Público *</Label>
              <Textarea id="targetPain" value={targetPain} onChange={e => setTargetPain(e.target.value)} placeholder="Descreva o principal problema que seu produto resolve..." className="bg-input border-border min-h-[80px]" />
            </div>

            <Button onClick={generateOffer} disabled={isGenerating || !productName.trim() || !originalPrice || !offerPrice || !targetPain.trim()} className="w-full">
              {isGenerating ? <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Oferta...
                </> : <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Oferta
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
                  
                  Oferta Gerada
                </CardTitle>
                <CardDescription>
                  {offer ? "Oferta pronta para uso" : "Aguardando geração"}
                </CardDescription>
              </div>
              {offer && <Button variant="outline" size="sm" onClick={copyFullOffer}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Tudo
                </Button>}
            </div>
          </CardHeader>
          <CardContent>
            {!offer ? <div className="text-center py-12">
                <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma oferta gerada</h3>
                <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Oferta"</p>
              </div> : <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {/* Headline */}
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h3 className="font-bold text-lg text-card-foreground">{offer.headline}</h3>
                  <p className="text-muted-foreground mt-1">{offer.subheadline}</p>
                </div>

                {/* Benefits */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-medium text-card-foreground mb-3 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Benefícios
                  </h4>
                  <ul className="space-y-2">
                    {offer.benefits.map((benefit, index) => <li key={index} className="flex items-start text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                        {benefit}
                      </li>)}
                  </ul>
                </div>

                {/* Bonuses */}
                {offer.bonuses.length > 0 && <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-medium text-card-foreground mb-3">🎁 Bônus Exclusivos</h4>
                    <ul className="space-y-2">
                      {offer.bonuses.map((bonus, index) => <li key={index} className="text-sm text-muted-foreground">• {bonus}</li>)}
                    </ul>
                  </div>}

                {/* Price Anchor */}
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                  <p className="font-bold text-lg text-green-600">{offer.priceAnchor}</p>
                </div>

                {/* Urgency */}
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-sm font-medium text-orange-600 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {offer.urgency}
                  </p>
                </div>

                {/* Guarantee */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
                    {offer.guarantee}
                  </p>
                </div>

                {/* CTA */}
                <div className="p-4 bg-primary rounded-lg text-center">
                  <p className="font-bold text-primary-foreground">{offer.cta}</p>
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      {offer && <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-card-foreground mb-2">💡 Dicas de Uso:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use esta estrutura em landing pages, emails e anúncios</li>
                <li>• Teste diferentes ancoragens de preço para maximizar conversões</li>
                <li>• Adicione provas sociais reais para aumentar credibilidade</li>
                <li>• Crie urgência real com prazos e quantidades limitadas</li>
              </ul>
            </div>
          </CardContent>
        </Card>}
    </div>;
}