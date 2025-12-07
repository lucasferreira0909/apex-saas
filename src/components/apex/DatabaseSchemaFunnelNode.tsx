import { memo } from "react";
import { Position, NodeProps, Handle } from "@xyflow/react";
import { DatabaseSchemaNode, DatabaseSchemaNodeHeader, DatabaseSchemaNodeBody, DatabaseSchemaTableRow, DatabaseSchemaTableCell } from "./DatabaseSchemaNode";

export type DatabaseSchemaFunnelNodeData = {
  label: string;
  icon: any;
  configured: boolean;
  stats: Record<string, string | number>;
};

const DatabaseSchemaFunnelNode = memo((props: NodeProps) => {
  const data = props.data as DatabaseSchemaFunnelNodeData;
  const Icon = data?.icon;
  const statsEntries = Object.entries(data?.stats || {});

  return (
    <DatabaseSchemaNode className="p-0 min-h-[120px]">
      <DatabaseSchemaNodeHeader>
        {Icon && <Icon className="h-5 w-5" />}
        <span>{data?.label}</span>
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

        <DatabaseSchemaTableRow>
          <DatabaseSchemaTableCell className="pl-4 pr-16 w-full">
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
              <span className="text-muted-foreground text-sm py-2 block">Sem estatísticas</span>
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
            top: '25%'
          }}
        />
        <span className="absolute text-[10px] text-muted-foreground" style={{ right: '16px', top: '25%', transform: 'translateY(-50%)' }}>
          Neutro
        </span>

        {/* Handle Se sim (meio) */}
        <Handle 
          id="positive" 
          type="source" 
          position={Position.Right}
          className="!w-3 !h-3 !border-2"
          style={{ 
            backgroundColor: '#22c55e', 
            borderColor: '#16a34a',
            top: '50%'
          }}
        />
        <span className="absolute text-[10px] text-green-600" style={{ right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
          Se sim
        </span>

        {/* Handle Negado (base) */}
        <Handle 
          id="negative" 
          type="source" 
          position={Position.Right}
          className="!w-3 !h-3 !border-2"
          style={{ 
            backgroundColor: '#ef4444', 
            borderColor: '#dc2626',
            top: '75%'
          }}
        />
        <span className="absolute text-[10px] text-red-600" style={{ right: '16px', top: '75%', transform: 'translateY(-50%)' }}>
          Negado
        </span>
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
});

DatabaseSchemaFunnelNode.displayName = "DatabaseSchemaFunnelNode";
export default DatabaseSchemaFunnelNode;
