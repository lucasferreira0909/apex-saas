import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Edge } from '@xyflow/react';

export interface FunnelEdge {
  id: string;
  funnel_id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle: string | null;
  target_handle: string | null;
  edge_style: Record<string, any>;
}

export function useFunnelEdges(funnelId?: string) {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEdges = async () => {
    if (!user || !funnelId) {
      setEdges([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('funnel_edges')
        .select('*')
        .eq('funnel_id', funnelId);

      if (error) throw error;

      const mappedEdges: Edge[] = (data || []).map(e => {
        const edgeStyle = e.edge_style as Record<string, any> | null;
        return {
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
          sourceHandle: e.source_handle,
          targetHandle: e.target_handle,
          type: 'default',
          animated: true,
          style: edgeStyle?.style || {},
          markerEnd: edgeStyle?.markerEnd || undefined,
        };
      });

      setEdges(mappedEdges);
    } catch (error) {
      console.error('Error fetching funnel edges:', error);
      setEdges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdges();
  }, [user, funnelId]);

  const saveAllEdges = async (edgesToSave: Edge[]) => {
    if (!user || !funnelId) {
      console.log('Cannot save edges: missing user or funnelId');
      return;
    }

    try {
      // Delete existing edges first
      const { error: deleteError } = await supabase
        .from('funnel_edges')
        .delete()
        .eq('funnel_id', funnelId);

      if (deleteError) throw deleteError;

      // Only insert if there are edges to save
      if (edgesToSave.length > 0) {
        const edgesData = edgesToSave.map(edge => ({
          id: edge.id,
          funnel_id: funnelId,
          source_node_id: edge.source,
          target_node_id: edge.target,
          source_handle: edge.sourceHandle || null,
          target_handle: edge.targetHandle || null,
          edge_style: JSON.parse(JSON.stringify({
            style: edge.style || {},
            markerEnd: edge.markerEnd || null,
          })),
        }));

        const { error: insertError } = await supabase
          .from('funnel_edges')
          .insert(edgesData);

        if (insertError) throw insertError;
      }

      setEdges(edgesToSave);
      console.log('Edges saved successfully');
    } catch (error) {
      console.error('Error saving funnel edges:', error);
      throw error;
    }
  };

  return {
    edges,
    loading,
    saveAllEdges,
    fetchEdges,
  };
}
