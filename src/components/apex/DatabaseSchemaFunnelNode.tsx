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
  return <DatabaseSchemaNode className="p-0 min-h-[120px] bg-[#0b0b0b]">
      <DatabaseSchemaNodeHeader className="bg-muted">
        {Icon && <Icon className="h-5 w-5" />}
        <span>{data?.label}</span>
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody className="relative">
        {/* Handle de entrada (esquerda) */}
        <Handle id="input" type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !bg-background" style={{
        top: '50%',
        borderColor: '#1c1c1c'
      }} />

        {/* Handle Neutro (topo) */}
        <Handle id="neutral" type="source" position={Position.Right} className="!w-3 !h-3 !border-2" style={{
        backgroundColor: '#9ca3af',
        borderColor: '#1c1c1c',
        top: '25%'
      }} />
        

        {/* Handle Se sim (meio) */}
        <Handle id="positive" type="source" position={Position.Right} className="!w-3 !h-3 !border-2" style={{
        backgroundColor: '#22c55e',
        borderColor: '#1c1c1c',
        top: '50%'
      }} />
        

        {/* Handle Negado (base) */}
        <Handle id="negative" type="source" position={Position.Right} className="!w-3 !h-3 !border-2" style={{
        backgroundColor: '#ef4444',
        borderColor: '#1c1c1c',
        top: '75%'
      }} />
        
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>;
});
DatabaseSchemaFunnelNode.displayName = "DatabaseSchemaFunnelNode";
export default DatabaseSchemaFunnelNode;