import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { FunnelElement } from '@/types/funnel';

export function useFunnelElements(funnelId?: string) {
  const [elements, setElements] = useState<FunnelElement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchElements = async () => {
    if (!user || !funnelId) {
      setElements([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('funnel_elements')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      const mappedElements: FunnelElement[] = (data || []).map(e => ({
        id: e.id,
        type: e.element_type,
        icon: null, // Will be set by the component
        position: { x: e.position_x, y: e.position_y },
        configured: e.configured || false,
        stats: (e.element_config as Record<string, string | number>) || {}
      }));

      setElements(mappedElements);
    } catch (error) {
      console.error('Error fetching funnel elements:', error);
      setElements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElements();
  }, [user, funnelId]);

  const saveElement = async (element: FunnelElement, orderIndex?: number) => {
    if (!user || !funnelId) return null;

    try {
      const { data, error } = await supabase
        .from('funnel_elements')
        .upsert({
          id: element.id,
          funnel_id: funnelId,
          element_type: element.type,
          position_x: element.position.x,
          position_y: element.position.y,
          configured: element.configured,
          element_config: element.stats,
          order_index: orderIndex || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving funnel element:', error);
      return null;
    }
  };

  const deleteElement = async (elementId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('funnel_elements')
        .delete()
        .eq('id', elementId);

      if (error) throw error;

      setElements(prev => prev.filter(e => e.id !== elementId));
    } catch (error) {
      console.error('Error deleting funnel element:', error);
    }
  };

  const saveAllElements = async (elementsToSave: FunnelElement[]) => {
    if (!user || !funnelId || elementsToSave.length === 0) return;

    try {
      // Delete existing elements first
      await supabase
        .from('funnel_elements')
        .delete()
        .eq('funnel_id', funnelId);

      // Insert all elements
      const elementsData = elementsToSave.map((element, index) => ({
        id: element.id,
        funnel_id: funnelId,
        element_type: element.type,
        position_x: element.position.x,
        position_y: element.position.y,
        configured: element.configured,
        element_config: element.stats,
        order_index: index
      }));

      const { error } = await supabase
        .from('funnel_elements')
        .insert(elementsData);

      if (error) throw error;

      setElements(elementsToSave);
    } catch (error) {
      console.error('Error saving all funnel elements:', error);
    }
  };

  return {
    elements,
    loading,
    saveElement,
    deleteElement,
    saveAllElements,
    fetchElements,
  };
}