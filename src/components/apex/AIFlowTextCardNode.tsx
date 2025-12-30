import { memo, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIFlowContext } from "@/contexts/AIFlowContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AIFlowTextCardNodeComponent({ data, selected, id }: NodeProps) {
  const { handleDeleteNode, handleDuplicateNode } = useAIFlowContext();

  const title = (data as any)?.title || 'Resultado Exportado';
  const content = (data as any)?.content || '';

  const handleDelete = useCallback(() => {
    handleDeleteNode(id);
  }, [handleDeleteNode, id]);

  const handleDuplicate = useCallback(() => {
    handleDuplicateNode(id);
  }, [handleDuplicateNode, id]);

  const handleCopyContent = useCallback(() => {
    navigator.clipboard.writeText(content);
  }, [content]);

  return (
    <Card className={cn(
      "w-[300px] h-[250px] shadow-md transition-all flex flex-col relative group",
      selected && "ring-2 ring-primary",
      "border-border bg-card"
    )}>
      {/* Menu Button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-6 w-6 bg-background/80 backdrop-blur-sm">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border z-50">
            <DropdownMenuItem onClick={handleCopyContent}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar conteúdo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="p-2 rounded-lg bg-secondary">
          <FileText className="h-4 w-4 text-secondary-foreground" />
        </div>
        <p className="text-sm font-medium truncate">{title}</p>
      </div>

      {/* Content Area */}
      <CardContent className="flex-1 p-3 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="text-xs text-foreground whitespace-pre-wrap pr-2">
            {content || 'Sem conteúdo.'}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-secondary border-2 border-background"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-secondary border-2 border-background"
      />
    </Card>
  );
}

export const AIFlowTextCardNode = memo(AIFlowTextCardNodeComponent);
