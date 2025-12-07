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

        {/* 3 Handles de saída (direita) - empilhados verticalmente */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around py-3 pr-1">
          {/* Neutro */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Neutro</span>
            <Handle 
              id="neutral" 
              type="source" 
              position={Position.Right}
              className="!relative !transform-none !w-3 !h-3 !border-2"
              style={{ backgroundColor: '#9ca3af', borderColor: '#6b7280' }}
            />
          </div>
          {/* Se sim (positivo) */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-green-600">Se sim</span>
            <Handle 
              id="positive" 
              type="source" 
              position={Position.Right}
              className="!relative !transform-none !w-3 !h-3 !border-2"
              style={{ backgroundColor: '#22c55e', borderColor: '#16a34a' }}
            />
          </div>
          {/* Negado */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-red-600">Negado</span>
            <Handle 
              id="negative" 
              type="source" 
              position={Position.Right}
              className="!relative !transform-none !w-3 !h-3 !border-2"
              style={{ backgroundColor: '#ef4444', borderColor: '#dc2626' }}
            />
          </div>
        </div>
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
});

DatabaseSchemaFunnelNode.displayName = "DatabaseSchemaFunnelNode";
export default DatabaseSchemaFunnelNode;
