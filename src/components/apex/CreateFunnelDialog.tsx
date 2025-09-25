import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType?: 'sales' | 'ltv' | 'quiz' | null;
}

export function CreateFunnelDialog({ open, onOpenChange, templateType }: CreateFunnelDialogProps) {
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const { addProject } = useProjects();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para o funil");
      return;
    }

    const newProject = await addProject({
      name: name.trim(),
      type: 'funnel',
      folder: folder.trim() || undefined,
      status: 'draft',
      templateType: templateType || undefined,
      stats: {
        conversion: "0%",
        visitors: "0",
        revenue: "R$ 0"
      }
    });

    if (newProject) {
      toast.success("Funil criado com sucesso!");
      setName("");
      setFolder("");
      onOpenChange(false);
      
      // Redirecionar para o editor de funil
      navigate(`/funnel-editor/${newProject.id}`);
    } else {
      toast.error("Erro ao criar funil");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {templateType ? `Criar Funil - ${
              templateType === 'sales' ? 'Vendas' : 
              templateType === 'ltv' ? 'LTV' : 'Quiz'
            }` : 'Criar Novo Funil'}
          </DialogTitle>
          <DialogDescription>
            {templateType 
              ? `Configurando um funil do tipo ${templateType === 'sales' ? 'Vendas' : templateType === 'ltv' ? 'LTV' : 'Quiz'} com elementos pré-selecionados`
              : 'Configure as informações básicas do seu funil de vendas'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="folder">Pasta (Opcional)</Label>
            <Input id="folder" value={folder} onChange={(e) => setFolder(e.target.value)} />
          </div>
          <Button onClick={handleCreate} className="w-full">Criar Funil</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}