import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCardAttachments, useUploadAttachment, useDeleteAttachment, CardAttachment } from '@/hooks/useCardAttachments';
import { Paperclip, X, Upload, FileText, Image, File, Loader2 } from 'lucide-react';

interface CardAttachmentsProps {
  cardId: string;
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.startsWith('image/')) return Image;
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return FileText;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CardAttachments({ cardId }: CardAttachmentsProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { data: attachments, isLoading } = useCardAttachments(cardId);
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await uploadAttachment.mutateAsync({ cardId, file });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (attachment: CardAttachment) => {
    deleteAttachment.mutate({
      attachmentId: attachment.id,
      cardId: attachment.card_id,
      fileUrl: attachment.file_url
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Anexos</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadAttachment.isPending}
        >
          {uploadAttachment.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Anexar
            </>
          )}
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : attachments && attachments.length > 0 ? (
        <ScrollArea className="max-h-[200px]">
          <div className="flex flex-col gap-2">
            {attachments.map(attachment => {
              const FileIcon = getFileIcon(attachment.file_type);
              const isImage = attachment.file_type?.startsWith('image/');
              
              return (
                <div 
                  key={attachment.id} 
                  className="flex items-center gap-2 p-2 rounded-md border bg-muted/30 group"
                >
                  {isImage ? (
                    <img 
                      src={attachment.file_url} 
                      alt={attachment.file_name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <a 
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium truncate block hover:underline"
                    >
                      {attachment.file_name}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file_size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(attachment)}
                    disabled={deleteAttachment.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Nenhum anexo
        </p>
      )}
    </div>
  );
}