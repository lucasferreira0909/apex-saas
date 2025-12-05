import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFunnelProject(funnelId?: string) {
  const [funnel, setFunnel] = useState<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    template_type: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFunnel = async () => {
    if (!user || !funnelId) {
      setFunnel(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('funnels')
        .select('id, name, description, status, template_type')
        .eq('id', funnelId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching funnel:', error);
        setFunnel(null);
      } else {
        setFunnel(data);
      }
    } catch (error) {
      console.error('Error in fetchFunnel:', error);
      setFunnel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnel();
  }, [user, funnelId]);

  return {
    funnel,
    funnelId: funnel?.id ?? null,
    loading,
    refetch: fetchFunnel
  };
}
