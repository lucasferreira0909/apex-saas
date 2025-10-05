import { memo } from "react";
import { Position, NodeProps } from "@xyflow/react";
import { LabeledHandle } from "./LabeledHandle";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "./DatabaseSchemaNode";
import { Badge } from "@/components/ui/badge";

export type DatabaseSchemaFunnelNodeData = {
  label: string;
  icon: any;
  configured: boolean;
  stats: Record<string, string | number>;
};

const DatabaseSchemaFunnelNode = memo(({ data, dragging, selected }: NodeProps) => {
  const nodeData = data as DatabaseSchemaFunnelNodeData;
  const Icon = nodeData?.icon;
  const statsEntries = Object.entries(nodeData?.stats || {});

  return (
    <DatabaseSchemaNode 
      className={`p-0 transition-all duration-200 ${
        dragging
          ? "shadow-xl scale-105"
          : selected
          ? "shadow-lg"
          : ""
      }`}
    >
      <DatabaseSchemaNodeHeader>
        {Icon && <Icon className="h-5 w-5" />}
        <span>{nodeData?.label}</span>
        <Badge
          variant={nodeData?.configured ? "default" : "secondary"}
          className="ml-auto text-xs"
        >
          {nodeData?.configured ? "Configurado" : "Pendente"}
        </Badge>
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        <DatabaseSchemaTableRow>
          <DatabaseSchemaTableCell className="pl-0 pr-6 font-light w-full">
            <LabeledHandle
              id="input"
              title="Entrada"
              type="target"
              position={Position.Left}
            />
          </DatabaseSchemaTableCell>
        </DatabaseSchemaTableRow>

        {statsEntries.length > 0 && (
          <>
            {statsEntries.map(([key, value]) => (
              <DatabaseSchemaTableRow key={key}>
                <DatabaseSchemaTableCell className="pl-4 text-muted-foreground">
                  {key}:
                </DatabaseSchemaTableCell>
                <DatabaseSchemaTableCell className="pr-4 font-medium ml-auto">
                  {String(value)}
                </DatabaseSchemaTableCell>
              </DatabaseSchemaTableRow>
            ))}
          </>
        )}

        <DatabaseSchemaTableRow>
          <DatabaseSchemaTableCell className="pr-0 font-thin w-full justify-end">
            <LabeledHandle
              id="output"
              title="Saída"
              type="source"
              position={Position.Right}
              className="w-full justify-end"
            />
          </DatabaseSchemaTableCell>
        </DatabaseSchemaTableRow>
      </DatabaseSchemaNodeBody>
      
      {dragging && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
          Movendo...
        </div>
      )}
    </DatabaseSchemaNode>
  );
});

DatabaseSchemaFunnelNode.displayName = "DatabaseSchemaFunnelNode";

export default DatabaseSchemaFunnelNode;
