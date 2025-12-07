import { useState } from "react";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FunnelTemplates } from "./FunnelTemplates";
import { checkFunnelNameExists } from "@/hooks/useFunnels";
import { useQueryClient } from "@tanstack/react-query";

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType?: 'sales' | 'ltv' | 'blank' | 'remarketing' | null;
}

export function CreateFunnelDialog({ open, onOpenChange, templateType: initialTemplate }: CreateFunnelDialogProps) {
  const [name, setName] = useState("");
  const [templateType, setTemplateType] = useState<'sales' | 'ltv' | 'blank' | 'remarketing' | null>(initialTemplate || null);
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para o funil");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsChecking(true);
    try {
      // Verificar se já existe um funil com o mesmo nome
      const exists = await checkFunnelNameExists(name, user.id);
      if (exists) {
        toast.error("Já existe um funil com este nome. Por favor, escolha outro nome.");
        setIsChecking(false);
        return;
      }

      // Criar o funil diretamente
      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: `Funil ${templateType ? `do tipo ${templateType}` : 'personalizado'}`,
          template_type: templateType && templateType !== 'blank' ? templateType : null,
          status: 'draft'
        })
        .select()
        .single();

      if (funnelError) {
        console.error('Error creating funnel:', funnelError);
        toast.error("Erro ao criar funil");
        setIsChecking(false);
        return;
      }

      // Invalidar cache para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['funnels'] });

      toast.success("Funil criado com sucesso!");
      setName("");
      setTemplateType(null);
      onOpenChange(false);
      
      // Redirecionar para o editor de funil usando o ID do funil
      navigate(`/funnel-editor/${funnelData.id}`);
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast.error("Erro ao criar funil");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSelectTemplate = (template: 'sales' | 'ltv' | 'blank' | 'remarketing') => {
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
      <SheetContent className="sm:max-w-xl md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {!templateType ? 'Escolha um Modelo' : templateType === 'blank' ? 'Criar Funil do Zero' : `Criar Funil - ${
              templateType === 'sales' ? 'Vendas' : 
              templateType === 'ltv' ? 'LTV' : 'Remarketing'
            }`}
          </SheetTitle>
          <SheetDescription>
            {!templateType 
              ? 'Selecione o tipo de funil que deseja criar'
              : templateType === 'blank'
                ? 'Configure as informações básicas do seu funil personalizado'
                : `Configurando um funil do tipo ${templateType === 'sales' ? 'Vendas' : templateType === 'ltv' ? 'LTV' : 'Remarketing'} com elementos pré-selecionados`
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
              <Button variant="outline" onClick={() => setTemplateType(null)} disabled={isChecking}>
                Voltar
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim() || isChecking}>
                {isChecking ? "Verificando..." : "Criar Funil"}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}