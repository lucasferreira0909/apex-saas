import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, FileText, Pen, Play, Clock, Download, Upload, Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { VideoClipDialog } from "@/components/apex/VideoClipDialog";
export default function Videos() {
  const [isClipDialogOpen, setIsClipDialogOpen] = useState(false);
  const {
    getProjectsByType
  } = useProjects();
  const videoProjects = getProjectsByType('video');
  // Video tools removed - moved to Tools page
  const recentProjects = [{
    id: 1,
    name: "Tutorial React - Clipes",
    type: "clip",
    status: "completed",
    duration: "45s",
    created: "2h atrás"
  }, {
    id: 2,
    name: "Transcrição - Webinar Marketing",
    type: "transcription",
    status: "processing",
    duration: "1h 20m",
    created: "4h atrás"
  }, {
    id: 3,
    name: "Roteiros Virais - TikTok",
    type: "script",
    status: "completed",
    duration: "10 roteiros",
    created: "1d atrás"
  }];
  const handleToolClick = (toolId: string, action: string) => {
    if (action === "dashboard") {
      // Navigate to respective dashboard
      if (toolId === "transcriptor") {
        window.location.href = "/video-transcriptor";
      }
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Concluído</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-warning border-warning">Processando</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transcription':
        return <FileText className="h-4 w-4" />;
      case 'script':
        return <Pen className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meus Vídeos</h1>
        <p className="text-muted-foreground">Edição avançada com inteligência artificial</p>
      </div>

      {/* Video Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border hover:shadow-lg transition-all cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-card-foreground">Gerador de Clips</CardTitle>
                <CardDescription>Crie clips persuasivos do seu vídeo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground flex items-center">
                <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                Upload de vídeo ou link YouTube
              </li>
              <li className="text-sm text-muted-foreground flex items-center">
                <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                3, 5 ou 7 clips por vídeo
              </li>
              <li className="text-sm text-muted-foreground flex items-center">
                <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                IA para clips persuasivos
              </li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => setIsClipDialogOpen(true)}
            >
              Abrir Ferramenta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Video Library Shortcut */}
      <div className="flex justify-center">
        <Link to="/library">
          <Button variant="outline" className="px-8 py-3">
            <Video className="h-5 w-5 mr-2" />
            Ir para Biblioteca de Vídeos
          </Button>
        </Link>
      </div>

      <VideoClipDialog 
        open={isClipDialogOpen} 
        onOpenChange={setIsClipDialogOpen} 
      />

      {/* Recent Projects */}
      

      {/* Upload Section */}
      

    </div>;
}