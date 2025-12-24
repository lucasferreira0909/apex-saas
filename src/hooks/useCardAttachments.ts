import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CardAttachment {
  id: string;
  card_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export function useCardAttachments(cardId: string | null) {
  return useQuery({
    queryKey: ['card-attachments', cardId],
    queryFn: async () => {
      if (!cardId) return [];
      const { data, error } = await supabase
        .from('card_attachments')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CardAttachment[];
    },
    enabled: !!cardId
  });
}

export function useBoardCardAttachments(cardIds: string[]) {
  return useQuery({
    queryKey: ['board-card-attachments', cardIds],
    queryFn: async () => {
      if (!cardIds.length) return {};
      const { data, error } = await supabase
        .from('card_attachments')
        .select('*')
        .in('card_id', cardIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group attachments by card_id
      const grouped: Record<string, CardAttachment[]> = {};
      for (const attachment of data as CardAttachment[]) {
        if (!grouped[attachment.card_id]) {
          grouped[attachment.card_id] = [];
        }
        grouped[attachment.card_id].push(attachment);
      }
      return grouped;
    },
    enabled: cardIds.length > 0
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cardId, file }: { cardId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${cardId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('card-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('card-attachments')
        .getPublicUrl(filePath);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('card_attachments')
        .insert({
          card_id: cardId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size
        });

      if (dbError) throw dbError;

      return publicUrl;
    },
    onSuccess: (_, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ['card-attachments', cardId] });
      toast.success('Arquivo anexado');
    },
    onError: () => {
      toast.error('Erro ao anexar arquivo');
    }
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attachmentId, cardId, fileUrl }: { attachmentId: string; cardId: string; fileUrl: string }) => {
      // Extract file path from URL
      const urlParts = fileUrl.split('/card-attachments/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('card-attachments')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('card_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
      return cardId;
    },
    onSuccess: (cardId) => {
      queryClient.invalidateQueries({ queryKey: ['card-attachments', cardId] });
      toast.success('Anexo removido');
    },
    onError: () => {
      toast.error('Erro ao remover anexo');
    }
  });
}