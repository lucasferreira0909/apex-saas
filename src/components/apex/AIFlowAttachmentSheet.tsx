import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Upload, Loader2, Video, FileText, Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

// Fetch metadata using noembed.com as fallback (supports many platforms)
const fetchFromNoembed = async (url: string): Promise<{
  title: string;
  thumbnailUrl: string;
} | null> => {
  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        return {
          title: data.title || '',
          thumbnailUrl: data.thumbnail_url || ''
        };
      }
    }
  } catch (error) {
    console.error('Erro ao buscar metadados do noembed:', error);
  }
  return null;
};

// Fetch real video metadata from oEmbed APIs
const fetchVideoMetadata = async (url: string): Promise<{
  thumbnailUrl: string;
  isVertical: boolean;
  title: string;
  platform: string;
} | null> => {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    const isShort = url.includes('/shorts/');
    
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          isVertical: isShort,
          title: data.title || 'Vídeo do YouTube',
          platform: 'youtube'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar metadados do YouTube:', error);
    }
    
    return {
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      isVertical: isShort,
      title: 'Vídeo do YouTube',
      platform: 'youtube'
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    try {
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return {
          thumbnailUrl: data.thumbnail_url || `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
          isVertical: false,
          title: data.title || 'Vídeo do Vimeo',
          platform: 'vimeo'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar metadados do Vimeo:', error);
    }
    
    return {
      thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      isVertical: false,
      title: 'Vídeo do Vimeo',
      platform: 'vimeo'
    };
  }

  // TikTok
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)|tiktok\.com\/t\/(\w+)|vm\.tiktok\.com\/(\w+)/);
  if (tiktokMatch) {
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return {
          thumbnailUrl: data.thumbnail_url || '',
          isVertical: true,
          title: data.title || 'Vídeo do TikTok',
          platform: 'tiktok'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar metadados do TikTok:', error);
    }
    
    // Try noembed as fallback
    const noembedData = await fetchFromNoembed(url);
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: true,
      title: noembedData?.title || 'Vídeo do TikTok',
      platform: 'tiktok'
    };
  }

  // Instagram (Reels, Posts, Stories)
  const instagramMatch = url.match(/instagram\.com\/(p|reel|reels|tv|stories)\/([a-zA-Z0-9_-]+)/);
  if (instagramMatch) {
    const contentType = instagramMatch[1];
    const isVertical = contentType === 'reel' || contentType === 'reels' || contentType === 'stories';
    
    let typeLabel = 'Post do Instagram';
    if (contentType === 'reel' || contentType === 'reels') typeLabel = 'Reel do Instagram';
    else if (contentType === 'tv') typeLabel = 'IGTV do Instagram';
    else if (contentType === 'stories') typeLabel = 'Story do Instagram';
    
    // Use edge function to fetch Instagram metadata (noembed doesn't support Instagram)
    try {
      const { data, error } = await supabase.functions.invoke('fetch-social-metadata', {
        body: { url }
      });
      
      if (!error && data?.success) {
        return {
          thumbnailUrl: data.thumbnailUrl || '',
          isVertical: isVertical,
          title: data.title || typeLabel,
          platform: 'instagram'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar metadados do Instagram:', error);
    }
    
    return {
      thumbnailUrl: '',
      isVertical: isVertical,
      title: typeLabel,
      platform: 'instagram'
    };
  }

  // Facebook (Videos, Reels, Posts)
  const facebookMatch = url.match(/facebook\.com\/(watch|reel|.*\/videos|.*\/posts)\/|fb\.watch\//);
  if (facebookMatch) {
    const isReel = url.includes('/reel/') || url.includes('fb.watch');
    
    // Try noembed for Facebook
    const noembedData = await fetchFromNoembed(url);
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: isReel,
      title: noembedData?.title || (isReel ? 'Reel do Facebook' : 'Vídeo do Facebook'),
      platform: 'facebook'
    };
  }

  // Twitter/X
  const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (twitterMatch) {
    // Try noembed for Twitter
    const noembedData = await fetchFromNoembed(url);
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: false,
      title: noembedData?.title || 'Post do Twitter/X',
      platform: 'twitter'
    };
  }

  // LinkedIn Posts/Videos
  const linkedinMatch = url.match(/linkedin\.com\/(posts|feed|video)/);
  if (linkedinMatch) {
    const noembedData = await fetchFromNoembed(url);
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: false,
      title: noembedData?.title || 'Post do LinkedIn',
      platform: 'linkedin'
    };
  }

  // Pinterest
  const pinterestMatch = url.match(/pinterest\.(com|pt|co\.uk)\/pin\/(\d+)/);
  if (pinterestMatch) {
    const noembedData = await fetchFromNoembed(url);
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: true,
      title: noembedData?.title || 'Pin do Pinterest',
      platform: 'pinterest'
    };
  }

  // Spotify
  const spotifyMatch = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    const contentType = spotifyMatch[1];
    const noembedData = await fetchFromNoembed(url);
    
    let typeLabel = 'Conteúdo do Spotify';
    if (contentType === 'track') typeLabel = 'Música do Spotify';
    else if (contentType === 'album') typeLabel = 'Álbum do Spotify';
    else if (contentType === 'playlist') typeLabel = 'Playlist do Spotify';
    else if (contentType === 'episode') typeLabel = 'Episódio do Spotify';
    else if (contentType === 'show') typeLabel = 'Podcast do Spotify';
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: false,
      title: noembedData?.title || typeLabel,
      platform: 'spotify'
    };
  }

  // SoundCloud
  const soundcloudMatch = url.match(/soundcloud\.com\/[\w-]+\/[\w-]+/);
  if (soundcloudMatch) {
    const noembedData = await fetchFromNoembed(url);
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: false,
      title: noembedData?.title || 'Áudio do SoundCloud',
      platform: 'soundcloud'
    };
  }

  // Twitch
  const twitchMatch = url.match(/twitch\.tv\/(videos\/\d+|[\w]+\/clip\/[\w-]+|[\w]+)/);
  if (twitchMatch) {
    const noembedData = await fetchFromNoembed(url);
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: false,
      title: noembedData?.title || 'Conteúdo da Twitch',
      platform: 'twitch'
    };
  }

  // Dailymotion
  const dailymotionMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dailymotionMatch) {
    const noembedData = await fetchFromNoembed(url);
    
    return {
      thumbnailUrl: noembedData?.thumbnailUrl || '',
      isVertical: false,
      title: noembedData?.title || 'Vídeo do Dailymotion',
      platform: 'dailymotion'
    };
  }

  // Generic fallback - try noembed for any URL
  const genericData = await fetchFromNoembed(url);
  if (genericData && genericData.title) {
    return {
      thumbnailUrl: genericData.thumbnailUrl || '',
      isVertical: false,
      title: genericData.title,
      platform: 'other'
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
      const videoInfo = await fetchVideoMetadata(linkUrl);
      
      if (videoInfo) {
        onAddAttachment({
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
