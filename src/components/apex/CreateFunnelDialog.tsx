import { useState } from "react";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { checkFunnelNameExists } from "@/hooks/useFunnels";
import { useQueryClient } from "@tanstack/react-query";

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFunnelDialog({ open, onOpenChange }: CreateFunnelDialogProps) {
  const [name, setName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Por favor, insira um nome para o funil");
      return;
    }
    
    if (trimmedName.length > 50) {
      toast.error("Nome muito longo", {
        description: "O nome do funil deve ter no máximo 50 caracteres.",
      });
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsChecking(true);
    try {
      const exists = await checkFunnelNameExists(trimmedName, user.id);
      if (exists) {
        toast.error("Nome já existe", {
          description: "Já existe um funil com este nome. Escolha outro nome.",
        });
        setIsChecking(false);
        return;
      }

      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          user_id: user.id,
          name: trimmedName,
          description: 'Funil personalizado',
          template_type: null,
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

      queryClient.invalidateQueries({ queryKey: ['funnels'] });

      toast.success("Funil criado com sucesso!");
      setName("");
      onOpenChange(false);
      
      navigate(`/funnel-editor/${funnelData.id}`);
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast.error("Erro ao criar funil");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setName("");
      }
    }}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Criar Novo Funil</SheetTitle>
          <SheetDescription>
            Configure as informações básicas do seu funil
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
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
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isChecking}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isChecking}>
            {isChecking ? "Verificando..." : "Criar Funil"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}