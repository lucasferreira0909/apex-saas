import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExecutionLog {
  id: string;
  user_id: string;
  funnel_id: string;
  node_id: string;
  node_type: string;
  input: string;
  output: string;
  created_at: string;
}

interface AIFlowPromptsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: ExecutionLog[] | undefined;
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export function AIFlowPromptsSheet({
  open,
  onOpenChange,
  logs,
  isLoading,
  onSelectPrompt,
}: AIFlowPromptsSheetProps) {
  // Get unique prompts (inputs) from logs
  const uniquePrompts = logs?.reduce((acc, log) => {
    if (!acc.some(p => p.input === log.input)) {
      acc.push(log);
    }
    return acc;
  }, [] as ExecutionLog[]) || [];

  const handleSelectPrompt = (prompt: string) => {
    onSelectPrompt(prompt);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[450px] bg-background border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Reutilizar Prompts
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 h-[calc(100vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : uniquePrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhum prompt salvo ainda</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {uniquePrompts.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-3">
                          {log.input}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shrink-0"
                        onClick={() => handleSelectPrompt(log.input)}
                      >
                        Usar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
