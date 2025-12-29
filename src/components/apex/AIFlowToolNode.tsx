import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Box
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

function AIFlowToolNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as Record<string, any>;
  const label = nodeData?.label || 'Ferramenta';
  const toolId = nodeData?.toolId || '';
  const configured = nodeData?.configured || false;
  
  const IconComponent = (toolId && iconMap[toolId]) || Box;

  return (
    <Card className={cn(
      "min-w-[180px] shadow-md transition-all",
      selected && "ring-2 ring-primary",
      configured ? "border-green-500" : "border-border"
    )}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <IconComponent className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{label}</p>
            {configured ? (
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                Configurado
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Não configurado
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
}

export const AIFlowToolNode = memo(AIFlowToolNodeComponent);
