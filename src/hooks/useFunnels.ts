import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Funnel {
  id: string;
  name: string;
  description: string | null;
  status: string;
  template_type: string | null;
  thumbnail: string | null;
  folder: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
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

export function useUpdateFunnelFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ funnelId, folder }: { funnelId: string; folder: string | null }) => {
      const { error } = await supabase
        .from('funnels')
        .update({ folder })
        .eq('id', funnelId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
    onError: () => {
      toast.error('Não foi possível atualizar a pasta do funil');
    }
  });
}
