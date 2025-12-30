import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Loader2, MessageSquare, Wrench, Image, Copy, Download, X } from "lucide-react";
import { ExecutionLog } from "@/hooks/useAIFlowHistory";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIFlowHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: ExecutionLog[];
  isLoading: boolean;
  onClearHistory: () => void;
  onDeleteLog?: (logId: string) => void;
  isClearing: boolean;
}

const getNodeIcon = (nodeType: string) => {
  if (nodeType === 'apex-ai' || nodeType === 'apex-chat') {
    return <MessageSquare className="h-4 w-4" />;
  }
  if (nodeType === 'generate-image') {
    return <Image className="h-4 w-4" />;
  }
  return <Wrench className="h-4 w-4" />;
};

const getNodeLabel = (nodeType: string) => {
  const labels: Record<string, string> = {
    'apex-ai': 'Apex AI',
    'apex-chat': 'Apex AI',
    'generate-image': 'Gerador de Imagem',
    'headline-generator': 'Gerador de Headlines',
    'copy-generator': 'Gerador de Copy',
    'email-generator': 'Gerador de E-mails',
    'script-generator': 'Gerador de Scripts',
    'offer-generator': 'Gerador de Ofertas',
  };
  return labels[nodeType] || nodeType;
};

// Extract image URL from output
const extractImageUrl = (output: string): string | null => {
  if (output.startsWith('Imagem:')) {
    return output.replace('Imagem:', '').trim();
  }
  const urlMatch = output.match(/(https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp))/i);
  return urlMatch ? urlMatch[0] : null;
};

export function AIFlowHistorySheet({
  open,
  onOpenChange,
  logs,
  isLoading,
  onClearHistory,
  onDeleteLog,
  isClearing,
}: AIFlowHistorySheetProps) {
  // Separate image logs from text logs
  const imageLogs = logs.filter(log => log.node_type === 'generate-image' || extractImageUrl(log.output));
  const textLogs = logs.filter(log => log.node_type !== 'generate-image' && !extractImageUrl(log.output));

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada para a área de transferência");
  };

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download iniciado");
    } catch (error) {
      toast.error("Erro ao fazer download da imagem");
    }
  };

  const handleDelete = (logId: string) => {
    if (onDeleteLog) {
      onDeleteLog(logId);
      toast.success("Registro excluído");
    }
  };

  const renderLogItem = (log: ExecutionLog, showImage: boolean = false) => {
    const imageUrl = extractImageUrl(log.output);
    
    return (
      <div
        key={log.id}
        className="p-4 rounded-lg border border-border bg-muted/30 relative group"
      >
        {/* Delete button */}
        {onDeleteLog && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(log.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded bg-primary/10 text-primary">
            {getNodeIcon(log.node_type)}
          </div>
          <span className="text-sm font-medium">
            {getNodeLabel(log.node_type)}
          </span>
          <span className="text-xs text-muted-foreground ml-auto pr-6">
            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
              locale: ptBR,
            })}
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
            <p className="text-sm bg-background p-2 rounded border border-border line-clamp-2">
              {log.input}
            </p>
          </div>

          {showImage && imageUrl ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Imagem gerada:</p>
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={log.input}
                  className="w-full h-auto rounded-lg border border-border"
                />
                {/* Action buttons */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                          onClick={() => handleCopyUrl(imageUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copiar URL</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                          onClick={() => handleDownload(imageUrl, log.input)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Resultado:</p>
              <p className="text-sm bg-background p-2 rounded border border-border line-clamp-4">
                {log.output}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">
                  Todos ({logs.length})
                </TabsTrigger>
                <TabsTrigger value="images">
                  Imagens ({imageLogs.length})
                </TabsTrigger>
                <TabsTrigger value="text">
                  Texto ({textLogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-4 pr-4">
                    {logs.map((log) => renderLogItem(log, true))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="images">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {imageLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <Image className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma imagem gerada ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-4">
                      {imageLogs.map((log) => renderLogItem(log, true))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="text">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {textLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum texto gerado ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-4">
                      {textLogs.map((log) => renderLogItem(log, false))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
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
