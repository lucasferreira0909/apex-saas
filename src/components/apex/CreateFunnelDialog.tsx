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
import { cn } from "@/lib/utils";
import { Workflow, Bot } from "lucide-react";

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FlowType = 'funnel' | 'ai_flow';

export function CreateFunnelDialog({ open, onOpenChange }: CreateFunnelDialogProps) {
  const [name, setName] = useState("");
  const [flowType, setFlowType] = useState<FlowType>('funnel');
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Por favor, insira um nome para o fluxo");
      return;
    }
    
    if (trimmedName.length > 50) {
      toast.error("Nome muito longo", {
        description: "O nome do fluxo deve ter no máximo 50 caracteres.",
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
          description: "Já existe um fluxo com este nome. Escolha outro nome.",
        });
        setIsChecking(false);
        return;
      }

      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          user_id: user.id,
          name: trimmedName,
          description: flowType === 'ai_flow' ? 'Fluxo de IA' : 'Funil de vendas',
          template_type: flowType,
          status: 'draft'
        })
        .select()
        .single();

      if (funnelError) {
        console.error('Error creating funnel:', funnelError);
        toast.error("Erro ao criar fluxo");
        setIsChecking(false);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['funnels'] });

      toast.success(flowType === 'ai_flow' ? "Fluxo de IA criado com sucesso!" : "Funil criado com sucesso!");
      setName("");
      setFlowType('funnel');
      onOpenChange(false);
      
      if (flowType === 'ai_flow') {
        navigate(`/ai-flow-editor/${funnelData.id}`);
      } else {
        navigate(`/funnel-editor/${funnelData.id}`);
      }
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast.error("Erro ao criar fluxo");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setName("");
        setFlowType('funnel');
      }
    }}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Criar Novo Fluxo</SheetTitle>
          <SheetDescription>
            Selecione o tipo de fluxo e configure as informações básicas
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-3">
              <Label>Tipo de Fluxo</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFlowType('ai_flow')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
                    flowType === 'ai_flow'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-lg",
                    flowType === 'ai_flow' ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Bot className={cn(
                      "h-6 w-6",
                      flowType === 'ai_flow' ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "font-medium text-sm",
                      flowType === 'ai_flow' ? "text-primary" : "text-foreground"
                    )}>
                      Fluxo de IA
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automações inteligentes
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFlowType('funnel')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
                    flowType === 'funnel'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-lg",
                    flowType === 'funnel' ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Workflow className={cn(
                      "h-6 w-6",
                      flowType === 'funnel' ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "font-medium text-sm",
                      flowType === 'funnel' ? "text-primary" : "text-foreground"
                    )}>
                      Funil
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Funis de vendas
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name">Nome do Fluxo</Label>
                <span className={cn(
                  "text-xs",
                  name.length > 50 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {name.length}/50
                </span>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={flowType === 'ai_flow' ? "Ex: Automação de Atendimento" : "Ex: Funil de Vendas Principal"}
                className={cn(
                  "bg-input border-border",
                  name.length > 50 && "border-destructive focus-visible:ring-destructive"
                )}
                maxLength={60}
              />
              {name.length > 50 && (
                <p className="text-xs text-destructive">O nome deve ter no máximo 50 caracteres</p>
              )}
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isChecking}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || name.length > 50 || isChecking}>
            {isChecking ? "Verificando..." : `Criar ${flowType === 'ai_flow' ? 'Fluxo de IA' : 'Funil'}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
