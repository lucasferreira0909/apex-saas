import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquareQuote, Copy, Sparkles, Star, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
interface Testimonial {
  name: string;
  role: string;
  testimonial: string;
  rating: number;
}
export default function TestimonialGenerator() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [quantity, setQuantity] = useState("3");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const generateTestimonials = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e descrição do produto.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setTestimonials([]);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-testimonials', {
        body: {
          productName,
          productDescription,
          targetAudience,
          quantity: parseInt(quantity)
        }
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data.error) {
        throw new Error(data.error);
      }
      setTestimonials(data.testimonials);
      toast({
        title: "Depoimentos gerados!",
        description: `${data.testimonials.length} depoimentos foram criados com sucesso.`
      });
    } catch (error) {
      console.error('Error generating testimonials:', error);
      toast({
        title: "Erro ao gerar depoimentos",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const copyTestimonial = (testimonial: Testimonial) => {
    const text = `"${testimonial.testimonial}"\n\n— ${testimonial.name}, ${testimonial.role}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Depoimento copiado para a área de transferência."
    });
  };
  const copyAllTestimonials = () => {
    const text = testimonials.map(t => `"${t.testimonial}"\n\n— ${t.name}, ${t.role}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Todos os depoimentos foram copiados."
    });
  };
  const renderStars = (rating: number) => {
    return Array.from({
      length: 5
    }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />);
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
              <Star className="h-8 w-8 mr-3 text-primary" />
              Criador de Depoimentos
            </h1>
            <p className="text-muted-foreground">Gere depoimentos convincentes para seu produto ou serviço</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Configurações
            </CardTitle>
            <CardDescription>Defina os parâmetros para gerar seus depoimentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto/Serviço *</Label>
              <Input id="productName" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ex: Curso de Marketing Digital" className="bg-input border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrição *</Label>
              <Textarea id="productDescription" value={productDescription} onChange={e => setProductDescription(e.target.value)} placeholder="Descreva seu produto ou serviço, seus benefícios e diferenciais..." className="bg-input border-border min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Público-Alvo (opcional)</Label>
              <Input id="targetAudience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Ex: Empreendedores iniciantes, mães que trabalham em casa" className="bg-input border-border" />
            </div>

            <div className="space-y-3">
              <Label>Quantidade de Depoimentos</Label>
              <RadioGroup value={quantity} onValueChange={setQuantity} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="q3" />
                  <Label htmlFor="q3" className="font-normal cursor-pointer">3 depoimentos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="q6" />
                  <Label htmlFor="q6" className="font-normal cursor-pointer">6 depoimentos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="9" id="q9" />
                  <Label htmlFor="q9" className="font-normal cursor-pointer">9 depoimentos</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={generateTestimonials} disabled={isGenerating || !productName.trim() || !productDescription.trim()} className="w-full">
              {isGenerating ? <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Depoimentos...
                </> : <>
                  <MessageSquareQuote className="h-4 w-4 mr-2" />
                  Gerar Depoimentos
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
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Depoimentos Gerados
                </CardTitle>
                <CardDescription>
                  {testimonials.length > 0 ? `${testimonials.length} depoimentos criados` : "Aguardando geração"}
                </CardDescription>
              </div>
              {testimonials.length > 0 && <Button variant="outline" size="sm" onClick={copyAllTestimonials}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Todos
                </Button>}
            </div>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? <div className="text-center py-12">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum depoimento gerado</h3>
                <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Depoimentos"</p>
              </div> : <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {testimonials.map((testimonial, index) => <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyTestimonial(testimonial)} className="shrink-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex mb-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-card-foreground italic">"{testimonial.testimonial}"</p>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      {testimonials.length > 0 && <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-card-foreground mb-2">💡 Dicas de Uso:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personalize os depoimentos com fotos reais de clientes para maior autenticidade</li>
                <li>• Use os depoimentos em landing pages, redes sociais e materiais de marketing</li>
                <li>• Varie os depoimentos para diferentes canais de comunicação</li>
                <li>• Combine com provas sociais reais para aumentar a credibilidade</li>
              </ul>
            </div>
          </CardContent>
        </Card>}
    </div>;
}