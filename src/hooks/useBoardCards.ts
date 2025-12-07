import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCreateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      board_id: string;
      column_id: string;
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      order_index: number;
    }) => {
      const { data: card, error } = await supabase
        .from('board_cards')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return card;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.board_id] });
      toast.success('Card adicionado com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível criar o card');
    }
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      board_id: string;
      column_id?: string;
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      order_index?: number;
    }) => {
      const { id, board_id, ...updates } = data;
      const { error } = await supabase
        .from('board_cards')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['board', newData.board_id] });

      // Snapshot the previous value
      const previousBoard = queryClient.getQueryData(['board', newData.board_id]);

      // Optimistically update the cache
      queryClient.setQueryData(['board', newData.board_id], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          cards: old.cards.map((card: any) => 
            card.id === newData.id 
              ? { ...card, ...newData }
              : card
          )
        };
      });

      // Return context with the snapshotted value
      return { previousBoard };
    },
    onError: (err, newData, context) => {
      // Rollback to the previous value on error
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', newData.board_id], context.previousBoard);
      }
      toast.error('Não foi possível atualizar o card');
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ['board', variables.board_id] });
    }
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; board_id: string }) => {
      const { error } = await supabase
        .from('board_cards')
        .delete()
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.board_id] });
      toast.success('Card removido com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível excluir o card');
    }
  });
}

export function useUpdateMultipleCards() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      board_id: string;
      updates: Array<{
        id: string;
        column_id: string;
        order_index: number;
      }>;
    }) => {
      const promises = data.updates.map(update =>
        supabase
          .from('board_cards')
          .update({ column_id: update.column_id, order_index: update.order_index })
          .eq('id', update.id)
      );
      
      await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.board_id] });
    }
  });
}
