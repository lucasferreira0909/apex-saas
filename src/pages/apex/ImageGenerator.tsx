import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image, Download, ArrowLeft, Trash2, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneratedImage {
  id: string;
  prompt: string;
  aspect_ratio: string;
  image_url: string;
  storage_path: string;
  description: string | null;
  created_at: string;
}

const DAILY_LIMIT = 3;

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [remaining, setRemaining] = useState<number>(DAILY_LIMIT);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch usage and history on mount
  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchTodayUsage();
    }
  }, [user]);

  const fetchTodayUsage = async () => {
    if (!user) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('generated_images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (!error && count !== null) {
      setRemaining(Math.max(0, DAILY_LIMIT - count));
    }
  };

  const fetchHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setHistory(data as GeneratedImage[]);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva a imagem que deseja gerar.",
        variant: "destructive"
      });
      return;
    }

    if (remaining <= 0) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de 3 imagens por dia. Tente novamente amanhã.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setDescription("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, aspectRatio }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        if (data.limitReached) {
          setRemaining(0);
        }
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);
      setDescription(data.description || "");
      
      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }

      // Refresh history
      await fetchHistory();

      toast({
        title: "Imagem gerada!",
        description: `Sua imagem foi criada com sucesso. ${data.remaining} ${data.remaining === 1 ? 'geração restante' : 'gerações restantes'} hoje.`
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

  const downloadImage = (imageUrl: string, imageName?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || `imagem-gerada-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Download iniciado!",
      description: "A imagem está sendo baixada."
    });
  };

  const deleteImage = async (image: GeneratedImage) => {
    setIsDeleting(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('generated-images')
        .remove([image.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      // Update local state
      setHistory(prev => prev.filter(img => img.id !== image.id));
      setSelectedImage(null);

      toast({
        title: "Imagem excluída",
        description: "A imagem foi removida do seu histórico."
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              <Image className="h-8 w-8 mr-3 text-[#e8e8e8]" />
              Gerador de Imagens
            </h1>
            <p className="text-muted-foreground">Crie imagens incríveis com inteligência artificial</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {remaining} de {DAILY_LIMIT} {remaining === 1 ? 'imagem restante' : 'imagens restantes'} hoje
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
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
                onChange={e => setPrompt(e.target.value)}
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
              disabled={isGenerating || !prompt.trim() || remaining <= 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Imagem...
                </>
              ) : remaining <= 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Limite Diário Atingido
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  Gerar Imagem
                </>
              )}
            </Button>

            {remaining <= 0 && (
              <p className="text-xs text-center text-muted-foreground">
                O limite será renovado à meia-noite.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground flex items-center">
                  Imagem Gerada
                </CardTitle>
                <CardDescription>
                  {generatedImage ? "Sua imagem está pronta!" : "Aguardando geração"}
                </CardDescription>
              </div>
              {generatedImage && (
                <Button variant="outline" size="sm" onClick={() => downloadImage(generatedImage)}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
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
                  <img src={generatedImage} alt="Imagem gerada" className="w-full h-auto object-contain max-h-[500px]" />
                </div>
                {description && <p className="text-sm text-muted-foreground italic">{description}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Histórico de Imagens</CardTitle>
            <CardDescription>Suas últimas {history.length} imagens geradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((img) => (
                <div
                  key={img.id}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img.image_url}
                    alt={img.prompt}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs text-center px-2 line-clamp-3">{img.prompt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Imagem</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-border">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Prompt:</span> {selectedImage.prompt}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Proporção:</span> {selectedImage.aspect_ratio}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Data:</span> {formatDate(selectedImage.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => downloadImage(selectedImage.image_url)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteImage(selectedImage)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
