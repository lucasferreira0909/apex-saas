import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Wrench, 
  MessageSquare, 
  Calculator,
  FileText,
  Type,
  Mail,
  Video,
  Tag,
  MessageSquareQuote,
  Users,
  Hash,
  ShoppingBag,
  Image
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "roi-calculator", title: "Calculadora de ROI", icon: Calculator },
  { id: "product-calculator", title: "Calculadora de Produto", icon: ShoppingBag },
  { id: "copy-generator", title: "Gerador de Copy", icon: FileText },
  { id: "headline-generator", title: "Gerador de Headlines", icon: Type },
  { id: "email-generator", title: "Gerador de E-mails", icon: Mail },
  { id: "script-generator", title: "Gerador de Roteiros", icon: Video },
  { id: "image-generator", title: "Gerador de Imagens", icon: Image },
  { id: "offer-generator", title: "Gerador de Oferta", icon: Tag },
  { id: "testimonial-generator", title: "Gerador de Depoimentos", icon: MessageSquareQuote },
  { id: "persona-generator", title: "Gerador de Persona", icon: Users },
  { id: "hashtag-generator", title: "Gerador de Hashtags", icon: Hash },
  { id: "whatsapp-generator", title: "Gerador de Link WhatsApp", icon: MessageSquare },
];

export function AIFlowSidebar() {
  const [toolsPopoverOpen, setToolsPopoverOpen] = useState(false);

  const handleDragStart = (event: React.DragEvent, tool: typeof tools[0]) => {
    event.dataTransfer.setData('application/json', JSON.stringify(tool));
    event.dataTransfer.effectAllowed = 'move';
    setToolsPopoverOpen(false);
  };

  const handleChatDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      id: 'apex-chat',
      title: 'Apex Chat',
      type: 'chat'
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <TooltipProvider>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="bg-background border border-border rounded-2xl shadow-lg p-2 flex flex-col gap-2">
          {/* Tools Button with Popover */}
          <Popover open={toolsPopoverOpen} onOpenChange={setToolsPopoverOpen}>
            <PopoverTrigger asChild>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-xl",
                        toolsPopoverOpen && "bg-accent"
                      )}
                    >
                      <Wrench className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Ferramentas</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </PopoverTrigger>
            <PopoverContent 
              side="right" 
              align="start" 
              className="w-64 p-2"
              sideOffset={8}
            >
              <div className="mb-2 px-2">
                <p className="text-sm font-medium">Ferramentas</p>
                <p className="text-xs text-muted-foreground">Arraste para o canvas</p>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="grid gap-1 pr-2">
                  {tools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <div
                        key={tool.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tool)}
                        className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{tool.title}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Apex Chat Draggable */}
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
              <p>Apex Chat (arraste)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
