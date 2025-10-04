import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { FunnelElement } from '@/types/funnel';
import { Megaphone, FileText, MousePointer, ShoppingCart, CreditCard, TrendingUp, TrendingDown, Video, Users, ThumbsUp, MessageSquare, Target, HelpCircle, Gift, Star, Play, Tag } from "lucide-react";

// Map element types to their corresponding icons
export const getElementIcon = (elementType: string) => {
  const iconMap: Record<string, any> = {
    "Anúncio": Megaphone,
    "Presell": FileText,
    "Captura": MousePointer,
    "Página de Vendas": ShoppingCart,
    "Checkout": CreditCard,
    "Upsell": TrendingUp,
    "Downsell": TrendingDown,
    "TikTok": Video,
    "Instagram": ThumbsUp,
    "YouTube": Video,
    "Webinar": Users,
    "Página de Obrigado": ThumbsUp,
    "Mensagem": MessageSquare,
    "Remarketing": Target,
    "Página de Pergunta": HelpCircle,
    "Benefícios": Gift,
    "Depoimento": Star,
    "Página de VSL": Play,
    "Oferta": Tag
  };
  
  return iconMap[elementType] || HelpCircle; // Default fallback icon
};

export function useFunnelElements(funnelId?: string) {
  const [elements, setElements] = useState<FunnelElement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchElements = async () => {
    if (!user || !funnelId) {
      console.log('No user or funnelId, skipping fetch');
      setElements([]);
      setLoading(false);
      return;
    }

    console.log('Fetching elements for funnel ID:', funnelId);
    
    try {
      const { data, error } = await supabase
        .from('funnel_elements')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      console.log('Raw data from database:', data);

      const mappedElements: FunnelElement[] = (data || []).map(e => {
        const position = { x: Number(e.position_x), y: Number(e.position_y) };
        console.log(`Element ${e.element_type} loaded with position:`, position);
        
        return {
          id: e.id,
          type: e.element_type,
          icon: getElementIcon(e.element_type),
          position,
          configured: e.configured || false,
          stats: (e.element_config as Record<string, string | number>) || {}
        };
      });

      console.log('Mapped elements:', mappedElements);
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
      console.log('Saving element to database:', {
        id: element.id,
        type: element.type,
        position: element.position
      });

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
      console.log('Element saved successfully');
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
    if (!user || !funnelId) {
      console.log('Cannot save: missing user or funnelId');
      return;
    }

    console.log('Saving elements to database:', elementsToSave);

    try {
      // Delete existing elements first
      const { error: deleteError } = await supabase
        .from('funnel_elements')
        .delete()
        .eq('funnel_id', funnelId);

      if (deleteError) throw deleteError;

      // Only insert if there are elements to save
      if (elementsToSave.length > 0) {
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

        console.log('Data being inserted:', elementsData);

        const { error: insertError } = await supabase
          .from('funnel_elements')
          .insert(elementsData);

        if (insertError) throw insertError;
      }

      setElements(elementsToSave);
      console.log('Elements saved successfully');
    } catch (error) {
      console.error('Error saving all funnel elements:', error);
      throw error; // Re-throw to handle in the component
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