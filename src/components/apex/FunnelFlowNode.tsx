import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FunnelElement } from '@/types/funnel';

export const FunnelFlowNode = memo(({ data }: NodeProps) => {
  const elementData = data as FunnelElement;
  const Icon = elementData.icon;
  
  return (
    <Card className="min-w-[250px] bg-card border-border shadow-lg">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#D4A574] !border-2 !border-background"
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <span className="font-semibold text-card-foreground">{elementData.type}</span>
          </div>
          <Badge variant={elementData.configured ? "default" : "secondary"} className="text-xs">
            {elementData.configured ? "Configurado" : "Não configurado"}
          </Badge>
        </div>
        
        {Object.keys(elementData.stats).length > 0 && (
          <div className="space-y-1 text-sm">
            {Object.entries(elementData.stats).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#D4A574] !border-2 !border-background"
      />
    </Card>
  );
});

FunnelFlowNode.displayName = 'FunnelFlowNode';
