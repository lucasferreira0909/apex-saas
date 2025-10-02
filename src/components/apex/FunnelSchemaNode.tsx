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

interface FunnelSchemaNodeProps {
  element: FunnelElement;
  position: { x: number; y: number };
  onPositionChange?: (elementId: string, newPosition: { x: number; y: number }) => void;
  onConnectionStart?: (elementId: string, handleId: string, position: { x: number; y: number }) => void;
  onConnectionEnd?: (elementId: string, handleId: string) => void;
}

export const FunnelSchemaNode = memo(({ element, position, onPositionChange, onConnectionStart, onConnectionEnd }: FunnelSchemaNodeProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if clicking on a handle
    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-handleid')) {
      return; // Let handle events handle this
    }

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

  const handleHandleMouseDown = (handleId: string, type: 'source' | 'target') => (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (type === 'source' && onConnectionStart && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const parentRect = nodeRef.current.parentElement?.getBoundingClientRect();
      
      if (!parentRect) return;

      const handleElement = e.currentTarget as HTMLElement;
      const handleRect = handleElement.getBoundingClientRect();
      
      onConnectionStart(element.id, handleId, {
        x: handleRect.left + handleRect.width / 2 - parentRect.left,
        y: handleRect.top + handleRect.height / 2 - parentRect.top
      });
    }
  };

  const handleHandleMouseUp = (handleId: string, type: 'source' | 'target') => (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (type === 'target' && onConnectionEnd) {
      onConnectionEnd(element.id, handleId);
    }
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
      { title: "Tipo", type: element.type },
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
              <DatabaseSchemaTableCell className="pl-4 pr-6 font-medium">
                <LabeledHandle
                  id={`${element.id}-${entry.title}-target`}
                  title={entry.title}
                  type="target"
                  position="left"
                  className="justify-start"
                  onMouseUp={handleHandleMouseUp(`${element.id}-${entry.title}-target`, 'target')}
                />
              </DatabaseSchemaTableCell>
              <DatabaseSchemaTableCell className="pr-4 text-muted-foreground">
                <LabeledHandle
                  id={`${element.id}-${entry.title}-source`}
                  title={entry.type}
                  type="source"
                  position="right"
                  className="justify-end"
                  labelClassName="text-right"
                  onMouseDown={handleHandleMouseDown(`${element.id}-${entry.title}-source`, 'source')}
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
