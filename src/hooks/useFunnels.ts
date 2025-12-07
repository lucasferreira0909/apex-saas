import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Funnel {
  id: string;
  name: string;
  description: string | null;
  status: string;
  template_type: string | null;
  folder: string | null;
  thumbnail: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useFunnels() {
  return useQuery({
    queryKey: ['funnels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Funnel[];
    }
  });
}

export function useDeleteFunnel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (funnelId: string) => {
      // First delete all funnel elements
      const { error: elementsError } = await supabase
        .from('funnel_elements')
        .delete()
        .eq('funnel_id', funnelId);
      
      if (elementsError) throw elementsError;
      
      // Then delete the funnel
      const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', funnelId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      toast.success('Funil excluído com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível excluir o funil');
    }
  });
}

export async function checkFunnelNameExists(name: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('funnels')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', name.trim())
    .limit(1);
  
  if (error) {
    console.error('Error checking funnel name:', error);
    return false;
  }
  
  return data && data.length > 0;
}
