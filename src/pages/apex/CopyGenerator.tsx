import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Copy, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const [copies, setCopies] = useState<CopyResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCopies = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e descrição do produto.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setCopies([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: { productName, productDescription, objective, tone }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setCopies(data.copies);
      toast({
        title: "Copies geradas!",
        description: `${data.copies.length} variações de copy foram criadas.`
      });
    } catch (error) {
      console.error('Error generating copies:', error);
      toast({
        title: "Erro ao gerar copies",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copySingleCopy = (copy: CopyResult) => {
    const text = `${copy.headline}\n\n${copy.body}\n\n${copy.cta}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Copy copiada para a área de transferência."
    });
  };

  const copyAllCopies = () => {
    const text = copies.map((c, i) => 
      `--- COPY ${i + 1} ---\n\n${c.headline}\n\n${c.body}\n\n${c.cta}`
    ).join("\n\n");
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Todas as copies foram copiadas."
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
              <FileText className="h-8 w-8 mr-3 text-primary" />
              Gerador de Copy Persuasiva
            </h1>
            <p className="text-muted-foreground">Crie copies persuasivas que convertem</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Defina os parâmetros para gerar suas copies</CardDescription>
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
              onClick={generateCopies}
              disabled={isGenerating || !productName.trim() || !productDescription.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Copies...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Copies
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
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Copies Geradas
                </CardTitle>
                <CardDescription>
                  {copies.length > 0 ? `${copies.length} variações criadas` : "Aguardando geração"}
                </CardDescription>
              </div>
              {copies.length > 0 && (
                <Button variant="outline" size="sm" onClick={copyAllCopies}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Todas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {copies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma copy gerada</h3>
                <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Copies"</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {copies.map((copy, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        Copy {index + 1}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => copySingleCopy(copy)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="font-bold text-card-foreground mb-2">{copy.headline}</h4>
                    <p className="text-muted-foreground text-sm whitespace-pre-line mb-3">{copy.body}</p>
                    <div className="p-2 bg-primary/10 rounded text-sm font-medium text-primary">
                      {copy.cta}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      {copies.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-card-foreground mb-2">💡 Dicas de Uso:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Teste diferentes variações para encontrar a que melhor converte</li>
                <li>• Adapte o tom da copy para cada canal (email, redes sociais, landing page)</li>
                <li>• Use a copy como base e personalize com dados específicos do seu público</li>
                <li>• Combine elementos de diferentes copies para criar versões híbridas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
