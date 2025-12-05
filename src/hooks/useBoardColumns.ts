import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateColumnOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      board_id: string;
      updates: Array<{
        id: string;
        order_index: number;
      }>;
    }) => {
      const promises = data.updates.map(update =>
        supabase
          .from('board_columns')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      );
      
      await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.board_id] });
    }
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      board_id: string;
      title: string;
      order_index: number;
    }) => {
      const { data: column, error } = await supabase
        .from('board_columns')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return column;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.board_id] });
      toast.success('Coluna adicionada');
    },
    onError: () => {
      toast.error('Erro ao criar coluna');
    }
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; board_id: string }) => {
      const { error } = await supabase
        .from('board_columns')
        .delete()
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.board_id] });
      toast.success('Coluna removida');
    },
    onError: () => {
      toast.error('Erro ao remover coluna');
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
