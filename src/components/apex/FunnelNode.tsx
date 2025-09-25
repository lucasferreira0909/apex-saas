import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";

interface FunnelNodeProps {
  element: {
    id: string;
    type: string;
    icon: any;
    configured: boolean;
    stats: any;
  };
  position: { x: number; y: number };
  onPositionChange?: (id: string, newPosition: { x: number; y: number }) => void;
}

export function FunnelNode({ element, position, onPositionChange }: FunnelNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onPositionChange) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const startX = e.clientX - currentPosition.x;
    const startY = e.clientY - currentPosition.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: Math.max(0, e.clientX - startX),
        y: Math.max(0, e.clientY - startY)
      };
      
      setCurrentPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onPositionChange(element.id, currentPosition);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={nodeRef}
      className={`absolute bg-card border-2 rounded-lg p-4 w-48 shadow-lg transition-all duration-200 select-none ${
        isDragging 
          ? "border-primary shadow-xl cursor-grabbing scale-105 z-50" 
          : "border-border cursor-grab hover:shadow-md"
      }`}
      style={{ 
        left: currentPosition.x, 
        top: currentPosition.y,
        transform: isDragging ? 'rotate(2deg)' : 'rotate(0deg)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center space-x-2 mb-2">
        <element.icon className="h-5 w-5 text-primary" />
        <Badge variant={element.configured ? "default" : "outline"}>
          {element.configured ? "Configurado" : "Pendente"}
        </Badge>
      </div>
      <h4 className="font-medium text-card-foreground mb-2">{element.type}</h4>
      <div className="text-xs text-muted-foreground">
        {Object.entries(element.stats).map(([key, value], i) => (
          <div key={key}>{key}: {String(value)}</div>
        ))}
      </div>
      
      {isDragging && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
          Movendo...
        </div>
      )}
    </div>
  );
}