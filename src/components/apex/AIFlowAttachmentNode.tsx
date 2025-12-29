import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Video, FileText, Image, Link2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

function AIFlowAttachmentNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as Record<string, any>;
  const attachmentType = nodeData?.attachmentType || 'file';
  const title = nodeData?.title || 'Anexo';
  const thumbnailUrl = nodeData?.thumbnailUrl;
  const isVertical = nodeData?.isVertical || false;

  const getIcon = () => {
    switch (attachmentType) {
      case 'video':
        return Video;
      case 'image':
        return Image;
      default:
        return FileText;
    }
  };

  const IconComponent = getIcon();

  // Dimensions based on orientation
  const cardWidth = isVertical ? 180 : 280;
  const cardHeight = isVertical ? 320 : 200;
  const thumbnailHeight = isVertical ? 240 : 140;

  return (
    <Card 
      className={cn(
        "shadow-md transition-all overflow-hidden",
        selected && "ring-2 ring-primary",
        "border-border"
      )}
      style={{ width: cardWidth, height: cardHeight }}
    >
      {/* Thumbnail Area */}
      <div 
        className="relative bg-muted flex items-center justify-center overflow-hidden"
        style={{ height: thumbnailHeight }}
      >
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {attachmentType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="p-3 rounded-full bg-white/90">
                  <Play className="h-6 w-6 text-foreground fill-foreground" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <IconComponent className="h-10 w-10" />
            {attachmentType === 'video' && (
              <span className="text-xs">Vídeo</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10">
            <IconComponent className="h-3 w-3 text-primary" />
          </div>
          <p className="text-xs font-medium truncate flex-1">{title}</p>
        </div>
      </div>

      {/* Output Handle Only - attachments can only connect TO Apex AI */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
}

export const AIFlowAttachmentNode = memo(AIFlowAttachmentNodeComponent);
