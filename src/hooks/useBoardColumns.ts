import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateColumnOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ columnId, orderIndex }: { columnId: string; orderIndex: number }) => {
      const { error } = await supabase
        .from('board_columns')
        .update({ order_index: orderIndex })
        .eq('id', columnId);

      if (error) throw error;
    },
    onError: () => {
      toast.error('Erro ao atualizar ordem da coluna');
    }
  });
}

export function useUpdateMultipleColumnsOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      const promises = updates.map(({ id, order_index }) =>
        supabase
          .from('board_columns')
          .update({ order_index })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
    onError: () => {
      toast.error('Erro ao reordenar colunas');
    }
  });
}

export function useUpdateColumnTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
      const { error } = await supabase
        .from('board_columns')
        .update({ title })
        .eq('id', columnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
      toast.success('Coluna atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar coluna');
    }
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columnId: string) => {
      // First delete all cards in this column
      const { error: cardsError } = await supabase
        .from('board_cards')
        .delete()
        .eq('column_id', columnId);

      if (cardsError) throw cardsError;

      // Then delete the column
      const { error } = await supabase
        .from('board_columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
      toast.success('Coluna excluída');
    },
    onError: () => {
      toast.error('Erro ao excluir coluna');
    }
  });
}
