import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/apex/DatabaseSchemaNode";
import { FunnelElement } from "@/types/funnel";

type FunnelFlowNodeData = {
  element: FunnelElement;
};

const FunnelFlowNode = memo((props: NodeProps) => {
  const data = props.data as FunnelFlowNodeData;
  const element = data?.element;

  if (!element) return null;

  // Get element properties based on type
  const getElementSchema = () => {
    const baseSchema = [
      { title: "Status", type: element.configured ? "Configurado" : "Pendente" },
    ];

    // Add stats if available
    if (element.stats && Object.keys(element.stats).length > 0) {
      Object.entries(element.stats).forEach(([key, value]) => {
        baseSchema.push({ title: key, type: String(value) });
      });
    }

    return baseSchema;
  };

  const schema = getElementSchema();

  return (
    <DatabaseSchemaNode className="p-0 shadow-lg hover:shadow-xl transition-shadow min-w-[250px]">
      <DatabaseSchemaNodeHeader className="flex items-center gap-2">
        {element.icon && <element.icon className="h-4 w-4" />}
        {element.type}
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        {schema.map((entry, index) => (
          <DatabaseSchemaTableRow key={index} className="relative">
            <DatabaseSchemaTableCell className="pl-4 pr-6 font-light relative">
              <Handle
                type="target"
                position={Position.Left}
                id={`${element.id}-${entry.title}-target`}
                className="!w-3 !h-3 !bg-background !border-2 !border-primary hover:!scale-110 transition-transform"
                style={{ left: -6 }}
              />
              <span className="text-xs">{entry.title}</span>
            </DatabaseSchemaTableCell>
            <DatabaseSchemaTableCell className="pr-4 font-thin text-right relative">
              <span className="text-xs text-muted-foreground">{entry.type}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`${element.id}-${entry.title}-source`}
                className="!w-3 !h-3 !bg-background !border-2 !border-primary hover:!scale-110 transition-transform"
                style={{ right: -6 }}
              />
            </DatabaseSchemaTableCell>
          </DatabaseSchemaTableRow>
        ))}
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
});

FunnelFlowNode.displayName = "FunnelFlowNode";

export default FunnelFlowNode;
