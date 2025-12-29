import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type CreditToolType = 'text_generation' | 'image_edit' | 'image_generation';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string;
  tool_name: string | null;
  created_at: string;
}

const CREDIT_COSTS: Record<CreditToolType, number> = {
  text_generation: 1,
  image_edit: 2,
  image_generation: 4,
};

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setCredits(data?.credits ?? 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }, [user]);

  const fetchTransactions = useCallback(async (days: number = 30) => {
    if (!user) return;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [user]);

  const getCreditCost = (toolType: CreditToolType): number => {
    return CREDIT_COSTS[toolType];
  };

  const hasEnoughCredits = (toolType: CreditToolType): boolean => {
    return credits >= CREDIT_COSTS[toolType];
  };

  const consumeCredits = async (
    toolType: CreditToolType,
    toolName: string,
    description: string
  ): Promise<boolean> => {
    if (!user) return false;

    const cost = CREDIT_COSTS[toolType];
    if (credits < cost) return false;

    try {
      // Update credits in profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: credits - cost })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: insertError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -cost,
          transaction_type: 'consumption',
          description,
          tool_name: toolName,
        });

      if (insertError) throw insertError;

      setCredits((prev) => prev - cost);
      return true;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  };

  const addCredits = async (
    amount: number,
    transactionType: string,
    description: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Update credits in profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: credits + amount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: insertError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: transactionType,
          description,
          tool_name: null,
        });

      if (insertError) throw insertError;

      setCredits((prev) => prev + amount);
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCredits(), fetchTransactions()]);
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchCredits, fetchTransactions]);

  return {
    credits,
    transactions,
    isLoading,
    getCreditCost,
    hasEnoughCredits,
    consumeCredits,
    addCredits,
    refreshCredits: fetchCredits,
    refreshTransactions: fetchTransactions,
  };
};
