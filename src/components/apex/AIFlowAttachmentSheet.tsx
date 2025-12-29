import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Upload, Loader2, Video, FileText, Image } from "lucide-react";
import { toast } from "sonner";

interface AIFlowAttachmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAttachment: (attachment: AttachmentData) => void;
}

export interface AttachmentData {
  id: string;
  type: 'video' | 'image' | 'file';
  title: string;
  url: string;
  thumbnailUrl?: string;
  isVertical?: boolean;
}

// Extract video ID and get thumbnail
const getVideoThumbnail = (url: string): { thumbnailUrl: string; isVertical: boolean; title: string } | null => {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    const isShort = url.includes('/shorts/');
    return {
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      isVertical: isShort,
      title: 'Vídeo do YouTube'
    };
  }

  // Vimeo - simplified approach
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      isVertical: false,
      title: 'Vídeo do Vimeo'
    };
  }

  return null;
};

export function AIFlowAttachmentSheet({ open, onOpenChange, onAddAttachment }: AIFlowAttachmentSheetProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLink = async () => {
    if (!linkUrl.trim()) {
      toast.error("Digite um link válido");
      return;
    }

    setIsLoading(true);

    try {
      const videoInfo = getVideoThumbnail(linkUrl);
      
      if (videoInfo) {
        onAddAttachment({
          id: `attachment-${Date.now()}`,
          type: 'video',
          title: videoInfo.title,
          url: linkUrl,
          thumbnailUrl: videoInfo.thumbnailUrl,
          isVertical: videoInfo.isVertical,
        });
        toast.success("Vídeo adicionado ao canvas!");
      } else {
        // Treat as generic link/file
        onAddAttachment({
          id: `attachment-${Date.now()}`,
          type: 'file',
          title: 'Link externo',
          url: linkUrl,
        });
        toast.success("Link adicionado ao canvas!");
      }

      setLinkUrl("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding attachment:', error);
      toast.error("Erro ao adicionar anexo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      onAddAttachment({
        id: `attachment-${Date.now()}`,
        type: isImage ? 'image' : isVideo ? 'video' : 'file',
        title: file.name,
        url: dataUrl,
        thumbnailUrl: isImage ? dataUrl : undefined,
      });
      
      toast.success("Arquivo adicionado ao canvas!");
      onOpenChange(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>Adicionar Anexo</SheetTitle>
          <SheetDescription>
            Adicione um arquivo ou link de vídeo ao seu fluxo
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="gap-2">
                <Link2 className="h-4 w-4" />
                Link
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL do vídeo ou arquivo</Label>
                <Input
                  id="link-url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                />
                <p className="text-xs text-muted-foreground">
                  Suporta YouTube, YouTube Shorts e Vimeo
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                  <Video className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">YouTube</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                  <Video className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Vimeo</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Links</span>
                </div>
              </div>

              <Button 
                onClick={handleAddLink} 
                disabled={isLoading || !linkUrl.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Adicionar Link
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-4 rounded-full bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Clique para fazer upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Imagens, vídeos e documentos
                    </p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                  <Image className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Imagens</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                  <Video className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Vídeos</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Docs</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
