import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import { LabeledHandle } from "./LabeledHandle";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "./DatabaseSchemaNode";
import { FunnelElement } from "@/types/funnel";

export interface FunnelNodeData {
  element: FunnelElement;
}

const FunnelSchemaNode = memo((props: NodeProps) => {
  const element = props.data.element as FunnelElement;

  const getElementSchema = () => {
    const schema = [];
    
    if (element.configured !== undefined) {
      schema.push({ 
        title: "Configurado", 
        type: element.configured ? "Sim" : "Não" 
      });
    }
    
    schema.push({ 
      title: "Tipo", 
      type: element.type 
    });
    
    if (element.stats) {
      Object.entries(element.stats).forEach(([key, value]) => {
        schema.push({ 
          title: key, 
          type: String(value) 
        });
      });
    }
    
    return schema;
  };

  const schema = getElementSchema();

  return (
    <DatabaseSchemaNode className="p-0 min-w-[280px]">
      <DatabaseSchemaNodeHeader className="flex items-center gap-2">
        {element.icon && <element.icon className="h-5 w-5" />}
        <span>{element.type}</span>
      </DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        {schema.map((entry, index) => (
          <DatabaseSchemaTableRow key={`${entry.title}-${index}`}>
            <DatabaseSchemaTableCell className="pl-0 pr-6 font-light">
              <LabeledHandle
                id={`${element.id}-${entry.title}-target`}
                title={entry.title}
                type="target"
                position="left"
              />
            </DatabaseSchemaTableCell>
            <DatabaseSchemaTableCell className="pr-0 font-thin">
              <LabeledHandle
                id={`${element.id}-${entry.title}-source`}
                title={entry.type}
                type="source"
                position="right"
                className="p-0"
                handleClassName="p-0"
                labelClassName="p-0 w-full pr-3 text-right"
              />
            </DatabaseSchemaTableCell>
          </DatabaseSchemaTableRow>
        ))}
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
});

FunnelSchemaNode.displayName = "FunnelSchemaNode";

export default FunnelSchemaNode;
