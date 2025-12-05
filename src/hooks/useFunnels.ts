import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Funnel {
  id: string;
  name: string;
  description: string | null;
  status: string;
  template_type: string | null;
  thumbnail: string | null;
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
      // Note: The funnels table doesn't have a folder column yet
      // This is a placeholder for when we add it
      console.log('Update funnel folder:', funnelId, folder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    }
  });
}
