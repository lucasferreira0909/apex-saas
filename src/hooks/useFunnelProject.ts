import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Edge } from '@xyflow/react';

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

  const saveFlowData = async (edges: Edge[]) => {
    if (!funnelId) return;

    try {
      const { error } = await supabase
        .from('funnels')
        .update({ flow_data: { edges: JSON.parse(JSON.stringify(edges)) } })
        .eq('id', funnelId);

      if (error) {
        console.error('Error saving flow data:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveFlowData:', error);
      throw error;
    }
  };

  const loadFlowData = async (): Promise<Edge[]> => {
    if (!funnelId) return [];

    try {
      const { data, error } = await supabase
        .from('funnels')
        .select('flow_data')
        .eq('id', funnelId)
        .single();

      if (error) {
        console.error('Error loading flow data:', error);
        return [];
      }

      const flowData = data?.flow_data as { edges?: Edge[] } | null;
      return flowData?.edges || [];
    } catch (error) {
      console.error('Error in loadFlowData:', error);
      return [];
    }
  };

  return {
    funnelId,
    loading,
    refetch: fetchFunnelId,
    saveFlowData,
    loadFlowData
  };
}