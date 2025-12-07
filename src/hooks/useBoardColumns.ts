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
