import { memo, useRef, useState, useEffect } from "react";
import { LabeledHandle } from "@/components/apex/LabeledHandle";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/apex/DatabaseSchemaNode";
import { FunnelElement } from "@/types/funnel";

// Simulating Position enum since we're not using @xyflow/react
const Position = {
  Left: "left" as const,
  Right: "right" as const,
  Top: "top" as const,
  Bottom: "bottom" as const,
};

interface FunnelSchemaNodeProps {
  element: FunnelElement;
  position: { x: number; y: number };
  onPositionChange?: (elementId: string, newPosition: { x: number; y: number }) => void;
}

export const FunnelSchemaNode = memo(({ element, position, onPositionChange }: FunnelSchemaNodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!nodeRef.current) return;
    
    const rect = nodeRef.current.getBoundingClientRect();
    const parentRect = nodeRef.current.parentElement?.getBoundingClientRect();
    
    if (!parentRect) return;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!nodeRef.current?.parentElement) return;

      const parentRect = nodeRef.current.parentElement.getBoundingClientRect();
      
      const newX = e.clientX - parentRect.left - dragOffset.x;
      const newY = e.clientY - parentRect.top - dragOffset.y;

      setCurrentPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (onPositionChange) {
        onPositionChange(element.id, currentPosition);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, element.id, currentPosition, onPositionChange]);

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
    <div
      ref={nodeRef}
      className={`absolute ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab z-10'}`}
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        transition: isDragging ? 'none' : 'all 0.2s ease-out'
      }}
      onMouseDown={handleMouseDown}
    >
      <DatabaseSchemaNode className="p-0 shadow-lg hover:shadow-xl transition-shadow">
        <DatabaseSchemaNodeHeader className="flex items-center gap-2">
          {element.icon && <element.icon className="h-4 w-4" />}
          {element.type}
        </DatabaseSchemaNodeHeader>
        <DatabaseSchemaNodeBody>
          {schema.map((entry, index) => (
            <DatabaseSchemaTableRow key={index}>
              <DatabaseSchemaTableCell className="pl-0 pr-6 font-light">
                <LabeledHandle
                  id={`${element.id}-${entry.title}-target`}
                  title={entry.title}
                  type="target"
                  position={Position.Left}
                />
              </DatabaseSchemaTableCell>
              <DatabaseSchemaTableCell className="pr-0 font-thin">
                <LabeledHandle
                  id={`${element.id}-${entry.title}-source`}
                  title={entry.type}
                  type="source"
                  position={Position.Right}
                  className="p-0"
                  handleClassName="p-0"
                  labelClassName="p-0 w-full pr-3 text-right"
                />
              </DatabaseSchemaTableCell>
            </DatabaseSchemaTableRow>
          ))}
        </DatabaseSchemaNodeBody>
      </DatabaseSchemaNode>
    </div>
  );
});

FunnelSchemaNode.displayName = "FunnelSchemaNode";
