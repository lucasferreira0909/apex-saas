import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";

interface CreateMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMessageDialog({ open, onOpenChange }: CreateMessageDialogProps) {
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const { addProject } = useProjects();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para a campanha");
      return;
    }

    addProject({
      name: name.trim(),
      type: 'message',
      folder: folder.trim() || undefined,
      status: 'draft',
      stats: {
        sent: "0",
        delivered: "0%",
        opened: "0%",
        responded: "0%"
      }
    });

    toast.success("Campanha criada com sucesso!");
    setName("");
    setFolder("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Campanha</DialogTitle>
          <DialogDescription>Configure sua campanha de mensagens WhatsApp</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Campanha</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="folder">Pasta (Opcional)</Label>
            <Input id="folder" value={folder} onChange={(e) => setFolder(e.target.value)} />
          </div>
          <Button onClick={handleCreate} className="w-full">Criar Campanha</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}