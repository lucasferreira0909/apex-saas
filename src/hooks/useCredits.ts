import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Credit costs per tool
export const CREDIT_COSTS = {
  text_generation: 2,
  image_generation: 7,
  image_editing: 5,
  headline: 2,
  copy: 2,
  email: 2,
  offer: 2,
  script: 2,
  persona: 2,
  testimonial: 2,
  whatsapp: 2,
  hashtag: 2,
} as const;

export type ToolType = keyof typeof CREDIT_COSTS;

interface UseCreditsReturn {
  credits: number;
  isLoading: boolean;
  refreshCredits: () => Promise<void>;
  checkCredits: (toolType: ToolType) => boolean;
  deductCredits: (toolType: ToolType) => Promise<boolean>;
  hasEnoughCredits: (toolType: ToolType) => boolean;
}

export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshCredits = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching credits:", error);
        return;
      }

      if (data) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Error refreshing credits:", error);
    }
  }, [user]);

  const hasEnoughCredits = useCallback((toolType: ToolType): boolean => {
    const cost = CREDIT_COSTS[toolType];
    return credits >= cost;
  }, [credits]);

  const checkCredits = useCallback((toolType: ToolType): boolean => {
    const cost = CREDIT_COSTS[toolType];
    
    if (credits < cost) {
      toast({
        title: "Créditos insuficientes",
        description: `Você precisa de ${cost} créditos para usar esta ferramenta. Você tem ${credits} créditos.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [credits, toast]);

  const deductCredits = useCallback(async (toolType: ToolType): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para usar esta ferramenta.",
        variant: "destructive",
      });
      return false;
    }

    const cost = CREDIT_COSTS[toolType];

    // First check if user has enough credits
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !profile) {
      console.error("Error fetching profile:", fetchError);
      toast({
        title: "Erro",
        description: "Não foi possível verificar seus créditos.",
        variant: "destructive",
      });
      return false;
    }

    if (profile.credits < cost) {
      toast({
        title: "Créditos insuficientes",
        description: `Você precisa de ${cost} créditos para usar esta ferramenta. Você tem ${profile.credits} créditos.`,
        variant: "destructive",
      });
      return false;
    }

    // Deduct credits
    const newCredits = profile.credits - cost;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error deducting credits:", updateError);
      toast({
        title: "Erro",
        description: "Não foi possível deduzir os créditos.",
        variant: "destructive",
      });
      return false;
    }

    setCredits(newCredits);
    return true;
  }, [user, toast]);

  return {
    credits,
    isLoading,
    refreshCredits,
    checkCredits,
    deductCredits,
    hasEnoughCredits,
  };
}
