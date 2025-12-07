import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookAudio, Play, Download, Loader2, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const voices = [{
  id: "EXAVITQu4vr4xnSDxMaL",
  name: "Sarah (Feminina)"
}, {
  id: "9BWtsMINqrJLrRacOk9x",
  name: "Aria (Feminina)"
}, {
  id: "FGY2WhTYpPnrIDTdsKH5",
  name: "Laura (Feminina)"
}, {
  id: "XB0fDUnXU5powFXDhCwa",
  name: "Charlotte (Feminina)"
}, {
  id: "pFZP5JQG7iQjIQuC4Bku",
  name: "Lily (Feminina)"
}, {
  id: "CwhRBWXzGAHq8TQ4Fs17",
  name: "Roger (Masculina)"
}, {
  id: "JBFqnCBsd6RMkjVDRZzb",
  name: "George (Masculina)"
}, {
  id: "TX3LPaxmHKxFdv7VOQHJ",
  name: "Liam (Masculina)"
}, {
  id: "nPczCjzI2devNBz1zQrb",
  name: "Brian (Masculina)"
}, {
  id: "onwK4e9ZLuTAKqWW03F9",
  name: "Daniel (Masculina)"
}];
export default function AudiobookGenerator() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const generateAudio = async () => {
    if (!text.trim()) {
      toast.error("Por favor, insira um texto para converter");
      return;
    }
    if (text.length > 5000) {
      toast.error("O texto deve ter no máximo 5000 caracteres");
      return;
    }
    setIsGenerating(true);
    setAudioUrl(null);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text.trim(),
          voice: selectedVoice
        }
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data.error) {
        throw new Error(data.error);
      }

      // Convert base64 to audio URL
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], {
        type: 'audio/mpeg'
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      toast.success("Áudio gerado com sucesso!");
    } catch (error: any) {
      console.error('Error generating audio:', error);
      toast.error(error.message || "Erro ao gerar áudio");
    } finally {
      setIsGenerating(false);
    }
  };
  const playAudio = () => {
    if (!audioUrl) return;
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
      setAudioElement(audio);
    }
  };
  const downloadAudio = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'audiobook.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado!");
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <BookAudio className="h-6 w-6 text-primary mr-2" />
            Gerador de Audiobook
          </h1>
          <p className="text-muted-foreground">Transforme seu texto em áudio de alta qualidade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Áudio</CardTitle>
            <CardDescription>Insira o texto e escolha a voz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="text">Texto para Conversão</Label>
                <span className="text-xs text-muted-foreground">
                  {text.length}/5000 caracteres
                </span>
              </div>
              <Textarea id="text" placeholder="Cole ou digite o texto que deseja converter em áudio..." value={text} onChange={e => setText(e.target.value)} rows={10} maxLength={5000} />
              <p className="text-xs text-muted-foreground">
                O texto será convertido em áudio usando a voz selecionada
              </p>
            </div>

            <Button onClick={generateAudio} className="w-full" disabled={isGenerating || !text.trim()}>
              {isGenerating ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Áudio...
                </> : <>
                  <BookAudio className="h-4 w-4 mr-2" />
                  Gerar Audiobook
                </>}
            </Button>
          </CardContent>
        </Card>

        {/* Preview & Result */}
        <Card>
          <CardHeader>
            <CardTitle>Prévia do Áudio</CardTitle>
            <CardDescription>Ouça e baixe seu audiobook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!audioUrl ? <div className="text-center py-8">
                <Volume2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isGenerating ? "Gerando seu áudio..." : "Preencha o texto acima para gerar seu audiobook"}
                </p>
              </div> : <div className="space-y-4">
                {/* Audio Player */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center gap-4">
                    <Button onClick={playAudio} variant="outline" size="lg" className="w-16 h-16 rounded-full">
                      <Play className={`h-6 w-6 ${isPlaying ? 'text-primary' : ''}`} />
                    </Button>
                    <div className="flex-1">
                      <audio src={audioUrl} controls className="w-full" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Voz:</span>
                    <span className="font-medium">
                      {voices.find(v => v.id === selectedVoice)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Caracteres:</span>
                    <span className="font-medium">{text.length}</span>
                  </div>
                </div>

                {/* Download Button */}
                <Button onClick={downloadAudio} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Audiobook
                </Button>

                {/* Instructions */}
                <div className="mt-4 p-4 rounded-lg bg-muted/10">
                  <h4 className="font-medium text-foreground mb-2">Como usar:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Use o player acima para ouvir o áudio gerado</p>
                    <p>• Clique em "Baixar" para salvar o arquivo MP3</p>
                    <p>• Você pode gerar novos áudios alterando o texto</p>
                  </div>
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}