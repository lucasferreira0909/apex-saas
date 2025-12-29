import { memo, useEffect, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calculator, 
  FileText, 
  Type, 
  Mail, 
  Video, 
  Tag, 
  MessageSquareQuote, 
  Users, 
  Hash, 
  MessageSquare,
  ShoppingBag,
  Image,
  Box,
  Loader2,
  Plug
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<any>> = {
  "roi-calculator": Calculator,
  "product-calculator": ShoppingBag,
  "copy-generator": FileText,
  "headline-generator": Type,
  "email-generator": Mail,
  "script-generator": Video,
  "image-generator": Image,
  "offer-generator": Tag,
  "testimonial-generator": MessageSquareQuote,
  "persona-generator": Users,
  "hashtag-generator": Hash,
  "whatsapp-generator": MessageSquare,
};

function AIFlowToolNodeComponent({ data, selected, id }: NodeProps) {
  const nodeData = data as Record<string, any>;
  const label = nodeData?.label || 'Ferramenta';
  const toolId = nodeData?.toolId || '';
  const externalOutput = nodeData?.output || '';
  const isProcessing = nodeData?.isProcessing || false;
  
  const IconComponent = (toolId && iconMap[toolId]) || Box;

  const [output, setOutput] = useState(externalOutput);

  // Update output when received from Apex AI
  useEffect(() => {
    if (externalOutput) {
      setOutput(externalOutput);
    }
  }, [externalOutput]);

  return (
    <Card className={cn(
      "w-[300px] h-[250px] shadow-md transition-all flex flex-col",
      selected && "ring-2 ring-primary",
      "border-border"
    )}>
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <IconComponent className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm font-medium truncate flex-1">{label}</p>
      </div>

      {/* Output Area */}
      <CardContent className="flex-1 p-3 overflow-hidden">
        <ScrollArea className="h-full w-full">
          {isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Processando...</p>
            </div>
          ) : output ? (
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {output}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
              <Plug className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                Conecte ao Apex AI para<br />receber resultados
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input Handle - receives from Apex AI */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />

      {/* Output Handle - can connect to Apex AI */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
}

export const AIFlowToolNode = memo(AIFlowToolNodeComponent);
