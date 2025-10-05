import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFunnelProject(projectId?: string) {
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFunnelId = async () => {
    if (!user || !projectId) {
      setFunnelId(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('funnels')
        .select('id')
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error('Error fetching funnel by project_id:', error);
        setFunnelId(null);
      } else {
        setFunnelId(data.id);
      }
    } catch (error) {
      console.error('Error in fetchFunnelId:', error);
      setFunnelId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelId();
  }, [user, projectId]);

  return {
    funnelId,
    loading,
    refetch: fetchFunnelId
  };
}