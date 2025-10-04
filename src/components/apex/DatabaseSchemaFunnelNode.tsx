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

const DatabaseSchemaFunnelNode = memo((props: NodeProps) => {
  const data = props.data as DatabaseSchemaFunnelNodeData;
  const Icon = data?.icon;
  const statsEntries = Object.entries(data?.stats || {});

  return (
    <DatabaseSchemaNode className="p-0">
      <DatabaseSchemaNodeHeader>
        {Icon && <Icon className="h-5 w-5" />}
        <span>{data?.label}</span>
        <Badge
          variant={data?.configured ? "default" : "secondary"}
          className="ml-auto text-xs"
        >
          {data?.configured ? "Configurado" : "Pendente"}
        </Badge>
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        <DatabaseSchemaTableRow>
          <DatabaseSchemaTableCell className="pl-0 pr-6 font-light w-full">
            <LabeledHandle
              id={`${props.id}-input`}
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
              id={`${props.id}-output`}
              title="Saída"
              type="source"
              position={Position.Right}
              className="w-full justify-end"
            />
          </DatabaseSchemaTableCell>
        </DatabaseSchemaTableRow>
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
});

DatabaseSchemaFunnelNode.displayName = "DatabaseSchemaFunnelNode";

export default DatabaseSchemaFunnelNode;
