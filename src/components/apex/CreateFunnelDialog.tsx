import { useState } from "react";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/hooks/useProjects";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FunnelTemplates } from "./FunnelTemplates";

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType?: 'sales' | 'ltv' | 'quiz' | 'blank' | null;
}

export function CreateFunnelDialog({ open, onOpenChange, templateType: initialTemplate }: CreateFunnelDialogProps) {
  const [name, setName] = useState("");
  const [templateType, setTemplateType] = useState<'sales' | 'ltv' | 'quiz' | 'blank' | null>(initialTemplate || null);
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
        templateType: templateType && templateType !== 'blank' ? templateType : undefined,
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
          project_id: newProject.id,
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
      setTemplateType(null);
      onOpenChange(false);
      
      // Redirecionar para o editor de funil usando o ID do projeto
      navigate(`/funnel-editor/${newProject.id}`);
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast.error("Erro ao criar funil");
    }
  };

  const handleSelectTemplate = (template: 'sales' | 'ltv' | 'quiz' | 'blank') => {
    setTemplateType(template);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setTemplateType(null);
        setName("");
      }
    }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {!templateType ? 'Escolha um Modelo' : templateType === 'blank' ? 'Criar Funil do Zero' : `Criar Funil - ${
              templateType === 'sales' ? 'Vendas' : 
              templateType === 'ltv' ? 'LTV' : 'Quiz'
            }`}
          </SheetTitle>
          <SheetDescription>
            {!templateType 
              ? 'Selecione o tipo de funil que deseja criar'
              : templateType === 'blank'
                ? 'Configure as informações básicas do seu funil personalizado'
                : `Configurando um funil do tipo ${templateType === 'sales' ? 'Vendas' : templateType === 'ltv' ? 'LTV' : 'Quiz'} com elementos pré-selecionados`
            }
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {!templateType ? (
            <FunnelTemplates onSelectTemplate={handleSelectTemplate} />
          ) : (
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
          )}
        </SheetBody>
        <SheetFooter>
          {templateType && (
            <>
              <Button variant="outline" onClick={() => setTemplateType(null)}>
                Voltar
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim()}>
                Criar Funil
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}