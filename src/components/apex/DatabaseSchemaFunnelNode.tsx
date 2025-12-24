import { memo, useState } from "react";
import { Position, NodeProps, Handle } from "@xyflow/react";
import { X } from "lucide-react";
import { DatabaseSchemaNode, DatabaseSchemaNodeHeader, DatabaseSchemaNodeBody, DatabaseSchemaTableRow, DatabaseSchemaTableCell } from "./DatabaseSchemaNode";
import { Button } from "@/components/ui/button";

export type DatabaseSchemaFunnelNodeData = {
  label: string;
  icon: any;
  configured: boolean;
  stats: Record<string, string | number>;
  onDelete?: (nodeId: string) => void;
};

const DatabaseSchemaFunnelNode = memo((props: NodeProps) => {
  const data = props.data as DatabaseSchemaFunnelNodeData;
  const Icon = data?.icon;
  const statsEntries = Object.entries(data?.stats || {});
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(props.id);
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button on hover */}
      {isHovered && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-3 -right-3 h-6 w-6 rounded-full z-50 shadow-lg"
          onClick={handleDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <DatabaseSchemaNode className="p-0 min-h-[120px] bg-muted">
        <DatabaseSchemaNodeHeader className="relative bg-[#131313]">
          {Icon && <Icon className="h-5 w-5" />}
          <span className="flex-1">{data?.label}</span>
        </DatabaseSchemaNodeHeader>
        <DatabaseSchemaNodeBody className="relative">
          {/* Handle de entrada (esquerda) */}
          <Handle
            id="input"
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 !border-2 !border-primary !bg-background"
            style={{ top: '50%' }}
          />

          <DatabaseSchemaTableRow className="bg-muted">
            <DatabaseSchemaTableCell className="pl-4 pr-16 w-full bg-muted">
              {statsEntries.length > 0 ? (
                <div className="flex flex-col gap-1 py-2">
                  {statsEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm py-2 block">​ </span>
              )}
            </DatabaseSchemaTableCell>
          </DatabaseSchemaTableRow>

          {/* Handle Neutro (topo) */}
          <Handle
            id="neutral"
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !border-2"
            style={{
              backgroundColor: '#9ca3af',
              borderColor: '#6b7280',
              top: '25%',
            }}
          />

          {/* Handle Se sim (meio) */}
          <Handle
            id="positive"
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !border-2"
            style={{
              backgroundColor: '#22c55e',
              borderColor: '#16a34a',
              top: '50%',
            }}
          />

          {/* Handle Negado (base) */}
          <Handle
            id="negative"
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !border-2"
            style={{
              backgroundColor: '#ef4444',
              borderColor: '#dc2626',
              top: '75%',
            }}
          />
        </DatabaseSchemaNodeBody>
      </DatabaseSchemaNode>
    </div>
  );
});

DatabaseSchemaFunnelNode.displayName = "DatabaseSchemaFunnelNode";
export default DatabaseSchemaFunnelNode;