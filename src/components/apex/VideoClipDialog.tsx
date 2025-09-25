import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VideoClipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoClipDialog({ open, onOpenChange }: VideoClipDialogProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [clipCount, setClipCount] = useState("5");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ferramenta Clip</DialogTitle>
          <DialogDescription>Crie clipes persuasivos do seu vídeo</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">Link do Vídeo</Label>
            <Input id="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="clips">Quantidade de Clips</Label>
            <select value={clipCount} onChange={(e) => setClipCount(e.target.value)} className="w-full p-2 rounded-md bg-input border border-border">
              <option value="3">3 clips</option>
              <option value="5">5 clips</option>
              <option value="7">7 clips</option>
            </select>
          </div>
          <Button className="w-full">Gerar Clips</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}