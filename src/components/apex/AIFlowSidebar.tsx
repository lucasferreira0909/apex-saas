import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Paperclip } from "lucide-react";

interface AIFlowSidebarProps {
  onOpenAttachmentSheet?: () => void;
}

export function AIFlowSidebar({ onOpenAttachmentSheet }: AIFlowSidebarProps) {
  const handleChatDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      id: 'apex-ai',
      title: 'Apex AI',
      type: 'chat'
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <TooltipProvider>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="bg-background border border-border rounded-2xl shadow-lg p-2 flex flex-col gap-2">
          {/* Apex AI Draggable */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={handleChatDragStart}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Apex AI (arraste)</p>
            </TooltipContent>
          </Tooltip>

          {/* Attachment Button - Clickable, not draggable */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl"
                onClick={onOpenAttachmentSheet}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Anexos</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
