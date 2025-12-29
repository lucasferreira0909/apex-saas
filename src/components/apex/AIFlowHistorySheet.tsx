import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Loader2, MessageSquare, Wrench } from "lucide-react";
import { ExecutionLog } from "@/hooks/useAIFlowHistory";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AIFlowHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: ExecutionLog[];
  isLoading: boolean;
  onClearHistory: () => void;
  isClearing: boolean;
}

const getNodeIcon = (nodeType: string) => {
  if (nodeType === 'apex-ai' || nodeType === 'apex-chat') {
    return <MessageSquare className="h-4 w-4" />;
  }
  return <Wrench className="h-4 w-4" />;
};

const getNodeLabel = (nodeType: string) => {
  const labels: Record<string, string> = {
    'apex-ai': 'Apex AI',
    'apex-chat': 'Apex AI',
    'headline-generator': 'Gerador de Headlines',
    'copy-generator': 'Gerador de Copy',
    'email-generator': 'Gerador de E-mails',
    'script-generator': 'Gerador de Scripts',
    'offer-generator': 'Gerador de Ofertas',
  };
  return labels[nodeType] || nodeType;
};

export function AIFlowHistorySheet({
  open,
  onOpenChange,
  logs,
  isLoading,
  onClearHistory,
  isClearing,
}: AIFlowHistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Histórico de Execuções</SheetTitle>
          <SheetDescription>
            Veja todas as interações e resultados gerados neste fluxo
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma execução registrada ainda
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-4 pr-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        {getNodeIcon(log.node_type)}
                      </div>
                      <span className="text-sm font-medium">
                        {getNodeLabel(log.node_type)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Input:</p>
                        <p className="text-sm bg-background p-2 rounded border border-border line-clamp-3">
                          {log.input}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Output:</p>
                        <p className="text-sm bg-background p-2 rounded border border-border line-clamp-4">
                          {log.output}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </SheetBody>

        {logs.length > 0 && (
          <SheetFooter>
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearHistory}
              disabled={isClearing}
              className="w-full"
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Limpar Histórico
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
