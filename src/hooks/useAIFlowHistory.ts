import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ExecutionLog {
  id: string;
  user_id: string;
  funnel_id: string;
  node_id: string;
  node_type: string;
  input: string;
  output: string;
  created_at: string;
}

export function useAIFlowHistory(funnelId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['ai-flow-history', funnelId],
    queryFn: async () => {
      if (!funnelId) return [];
      
      const { data, error } = await supabase
        .from('ai_flow_execution_logs')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI flow history:', error);
        return [];
      }

      return data as ExecutionLog[];
    },
    enabled: !!funnelId,
  });

  const addLogMutation = useMutation({
    mutationFn: async (log: Omit<ExecutionLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('ai_flow_execution_logs')
        .insert(log)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-flow-history', funnelId] });
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('ai_flow_execution_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-flow-history', funnelId] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !funnelId) return;
      
      const { error } = await supabase
        .from('ai_flow_execution_logs')
        .delete()
        .eq('funnel_id', funnelId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-flow-history', funnelId] });
    },
  });

  const addLog = async (log: Omit<ExecutionLog, 'id' | 'created_at' | 'user_id' | 'funnel_id'>) => {
    if (!user?.id || !funnelId) return;
    
    await addLogMutation.mutateAsync({
      ...log,
      user_id: user.id,
      funnel_id: funnelId,
    });
  };

  const deleteLog = async (logId: string) => {
    await deleteLogMutation.mutateAsync(logId);
  };

  const clearHistory = async () => {
    await clearHistoryMutation.mutateAsync();
  };

  return {
    logs,
    isLoading,
    addLog,
    deleteLog,
    clearHistory,
    isClearing: clearHistoryMutation.isPending,
    isDeleting: deleteLogMutation.isPending,
  };
}
