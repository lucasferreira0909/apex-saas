import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Video, FileText, Image, Play, MoreVertical, Trash2, Copy, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function AIFlowAttachmentNodeComponent({ data, selected, id }: NodeProps) {
  const nodeData = data as Record<string, any>;
  const attachmentType = nodeData?.attachmentType || 'file';
  const title = nodeData?.title || 'Anexo';
  const thumbnailUrl = nodeData?.thumbnailUrl;
  const isVertical = nodeData?.isVertical || false;
  const onDelete = nodeData?.onDelete;
  const onDuplicate = nodeData?.onDuplicate;
  const onRename = nodeData?.onRename;

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleRename = () => {
    if (onRename && newTitle.trim()) {
      onRename(id, newTitle.trim());
      setShowRenameDialog(false);
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "shadow-md transition-all overflow-hidden relative group",
          selected && "ring-2 ring-primary",
          "border-border"
        )}
        style={{ width: cardWidth, height: cardHeight }}
      >
        {/* Menu Button */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-6 w-6 bg-background/80 backdrop-blur-sm">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border z-50">
              <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(id)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      {/* Thumbnail Area */}
      <div 
        className="relative bg-muted flex items-center justify-center overflow-hidden"
        style={{ height: thumbnailHeight }}
      >
        {thumbnailUrl && !imageError ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={title}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-200",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
            />
            {/* Show loading placeholder while image loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconComponent className="h-10 w-10 text-muted-foreground animate-pulse" />
              </div>
            )}
            {/* Play button - only show after image loads */}
            {attachmentType === 'video' && imageLoaded && (
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

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>Renomear anexo</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nome do anexo"
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const AIFlowAttachmentNode = memo(AIFlowAttachmentNodeComponent);
