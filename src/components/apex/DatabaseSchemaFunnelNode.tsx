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
  return <DatabaseSchemaNode className="p-0">
      <DatabaseSchemaNodeHeader>
        {Icon && <Icon className="h-5 w-5" />}
        <span>{data?.label}</span>
        
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        <DatabaseSchemaTableRow className="relative">
          <Handle id="left" type="source" position={Position.Left} className="!w-3 !h-3 !border-2 !border-primary !bg-background" />
          <DatabaseSchemaTableCell className="pl-4 pr-4 w-full">
            {statsEntries.length > 0 ? (
              <div className="flex flex-col gap-1 py-1">
                {statsEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Sem estatísticas</span>
            )}
          </DatabaseSchemaTableCell>
          <Handle id="right" type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !border-primary !bg-background" />
        </DatabaseSchemaTableRow>
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>;
});
DatabaseSchemaFunnelNode.displayName = "DatabaseSchemaFunnelNode";
export default DatabaseSchemaFunnelNode;