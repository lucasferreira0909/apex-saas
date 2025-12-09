import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image, Download, Sparkles, ArrowLeft, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva a imagem que deseja gerar.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setDescription("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          aspectRatio
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);
      setDescription(data.description || "");
      toast({
        title: "Imagem gerada!",
        description: "Sua imagem foi criada com sucesso."
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Erro ao gerar imagem",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `imagem-gerada-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado!",
      description: "A imagem está sendo baixada."
    });
  };

  const copyImageUrl = () => {
    if (!generatedImage) return;
    navigator.clipboard.writeText(generatedImage);
    toast({
      title: "Copiado!",
      description: "URL da imagem copiada para a área de transferência."
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
              <Image className="h-8 w-8 mr-3 text-primary" />
              Gerador de Imagens
            </h1>
            <p className="text-muted-foreground">Crie imagens incríveis com inteligência artificial</p>
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
            <CardDescription>Descreva a imagem que deseja criar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Descrição da Imagem *</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Um gato laranja fofo dormindo em uma poltrona vintage, estilo aquarela, luz suave..."
                className="bg-input border-border min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Seja detalhado: inclua estilo artístico, cores, iluminação e composição.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Proporção da Imagem</Label>
              <RadioGroup value={aspectRatio} onValueChange={setAspectRatio} className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1:1" id="1:1" />
                  <Label htmlFor="1:1" className="font-normal cursor-pointer">1:1 (Quadrado)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="16:9" id="16:9" />
                  <Label htmlFor="16:9" className="font-normal cursor-pointer">16:9 (Paisagem)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="9:16" id="9:16" />
                  <Label htmlFor="9:16" className="font-normal cursor-pointer">9:16 (Retrato)</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={generateImage} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Imagem...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  Gerar Imagem
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
                <CardTitle className="text-card-foreground flex items-center">
                  <Image className="h-5 w-5 mr-2 text-primary" />
                  Imagem Gerada
                </CardTitle>
                <CardDescription>
                  {generatedImage ? "Sua imagem está pronta!" : "Aguardando geração"}
                </CardDescription>
              </div>
              {generatedImage && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyImageUrl}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar URL
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadImage}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedImage ? (
              <div className="text-center py-12">
                <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhuma imagem gerada</h3>
                <p className="text-muted-foreground">Descreva a imagem e clique em "Gerar Imagem"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={generatedImage} 
                    alt="Imagem gerada" 
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground italic">{description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-card-foreground mb-2">💡 Dicas para melhores resultados:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Seja específico: descreva cores, estilos, iluminação e composição</li>
              <li>• Mencione o estilo artístico desejado (realista, cartoon, aquarela, etc.)</li>
              <li>• Inclua detalhes sobre o ambiente e atmosfera</li>
              <li>• Use termos como "alta qualidade", "detalhado", "profissional"</li>
              <li>• Evite instruções negativas (o que NÃO quer ver)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
