import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType?: 'sales' | 'ltv' | 'quiz' | null;
}

export function CreateFunnelDialog({ open, onOpenChange, templateType }: CreateFunnelDialogProps) {
  const [name, setName] = useState("");
  const { addProject } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para o funil");
      return;
    }

    try {
      // Primeiro, criar o projeto
      const newProject = await addProject({
        name: name.trim(),
        type: 'funnel',
        status: 'draft',
        templateType: templateType || undefined,
        stats: {
          conversion: "0%",
          visitors: "0",
          revenue: "R$ 0"
        }
      });

      if (!newProject) {
        toast.error("Erro ao criar projeto");
        return;
      }

      // Depois, criar o funnel correspondente
      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          user_id: user!.id,
          name: name.trim(),
          description: `Funil ${templateType ? `do tipo ${templateType}` : 'personalizado'}`
        })
        .select()
        .single();

      if (funnelError) {
        console.error('Error creating funnel:', funnelError);
        toast.error("Erro ao criar funil");
        return;
      }

      toast.success("Funil criado com sucesso!");
      setName("");
      onOpenChange(false);
      
      // Redirecionar para o editor de funil usando o ID do funnel criado
      navigate(`/funnel-editor/${funnelData.id}`);
    } catch (error) {
      console.error('Error in handleCreate:', error);
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
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Funil</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Funil de Vendas Principal"
              className="bg-input border-border"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Criar Funil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}