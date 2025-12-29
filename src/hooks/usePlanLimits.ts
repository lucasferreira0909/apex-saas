import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PlanType = 'growth' | 'advanced';

export interface PlanLimits {
  maxFunnels: number;
  maxBoards: number;
  maxAIFlows: number;
  features: string[];
}

export interface PlanInfo {
  name: PlanType;
  displayName: string;
  priceCents: number;
  initialCredits: number;
  limits: PlanLimits;
}

const PLANS: Record<PlanType, PlanInfo> = {
  growth: {
    name: 'growth',
    displayName: 'Plano Growth',
    priceCents: 8700,
    initialCredits: 100,
    limits: {
      maxFunnels: 7,
      maxBoards: 14,
      maxAIFlows: 3,
      features: [
        'checklists_unlimited',
        'whatsapp_link',
        'roi_calculator',
        'product_calculator',
        'hashtag_generator',
        'copy_generator',
        'headline_generator',
        'email_generator',
        'script_generator',
      ],
    },
  },
  advanced: {
    name: 'advanced',
    displayName: 'Plano Advanced',
    priceCents: 16700,
    initialCredits: 200,
    limits: {
      maxFunnels: -1, // unlimited
      maxBoards: -1, // unlimited
      maxAIFlows: -1, // unlimited
      features: [
        'checklists_unlimited',
        'whatsapp_link',
        'roi_calculator',
        'product_calculator',
        'hashtag_generator',
        'copy_generator',
        'headline_generator',
        'email_generator',
        'script_generator',
        'image_generator',
        'testimonial_generator',
        'offer_generator',
        'persona_generator',
      ],
    },
  },
};

export const usePlanLimits = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanType>('growth');
  const [planStartedAt, setPlanStartedAt] = useState<string | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({ funnels: 0, boards: 0, aiFlows: 0 });

  const fetchPlanData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_type, plan_started_at, plan_expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentPlan((data.plan_type as PlanType) || 'growth');
        setPlanStartedAt(data.plan_started_at);
        setPlanExpiresAt(data.plan_expires_at);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  }, [user]);

  const fetchCounts = useCallback(async () => {
    if (!user) return;

    try {
      const [funnelsRes, boardsRes, aiFlowsRes] = await Promise.all([
        supabase.from('funnels').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('boards').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('funnels')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('template_type', 'ai_flow'),
      ]);

      setCounts({
        funnels: funnelsRes.count || 0,
        boards: boardsRes.count || 0,
        aiFlows: aiFlowsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, [user]);

  const getPlanInfo = (planType?: PlanType): PlanInfo => {
    return PLANS[planType || currentPlan];
  };

  const canCreateFunnel = (): boolean => {
    const limits = PLANS[currentPlan].limits;
    if (limits.maxFunnels === -1) return true;
    return counts.funnels < limits.maxFunnels;
  };

  const canCreateBoard = (): boolean => {
    const limits = PLANS[currentPlan].limits;
    if (limits.maxBoards === -1) return true;
    return counts.boards < limits.maxBoards;
  };

  const canCreateAIFlow = (): boolean => {
    const limits = PLANS[currentPlan].limits;
    if (limits.maxAIFlows === -1) return true;
    return counts.aiFlows < limits.maxAIFlows;
  };

  const hasFeature = (featureName: string): boolean => {
    return PLANS[currentPlan].limits.features.includes(featureName);
  };

  const isPlanActive = (): boolean => {
    if (!planExpiresAt) return true;
    return new Date(planExpiresAt) > new Date();
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlanData(), fetchCounts()]);
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchPlanData, fetchCounts]);

  return {
    currentPlan,
    planInfo: getPlanInfo(),
    planStartedAt,
    planExpiresAt,
    counts,
    isLoading,
    canCreateFunnel,
    canCreateBoard,
    canCreateAIFlow,
    hasFeature,
    isPlanActive,
    getPlanInfo,
    allPlans: PLANS,
    refreshPlanData: fetchPlanData,
    refreshCounts: fetchCounts,
  };
};
