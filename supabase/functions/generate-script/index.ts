import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDIT_COST = 1; // Text generation costs 1 credit

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, topic, duration, style, audience } = await req.json();

    if (!platform || !topic || !duration || !style) {
      return new Response(
        JSON.stringify({ error: "Platform, topic, duration and style are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Configuração do Supabase não encontrada');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Erro ao verificar créditos');
    }

    const currentCredits = profile?.credits ?? 0;

    if (currentCredits < CREDIT_COST) {
      return new Response(
        JSON.stringify({ 
          error: `Créditos insuficientes. Você precisa de ${CREDIT_COST} crédito para gerar roteiro.`,
          creditsRequired: CREDIT_COST,
          currentCredits: currentCredits
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformMap: Record<string, string> = {
      "reels": "Instagram Reels",
      "tiktok": "TikTok"
    };

    const styleMap: Record<string, string> = {
      "educational": "educativo (ensinar algo útil)",
      "entertainment": "entretenimento (divertir e engajar)",
      "storytelling": "storytelling (contar uma história)",
      "tutorial": "tutorial (passo a passo)"
    };

    const systemPrompt = `Você é um especialista em criação de roteiros virais para vídeos curtos em português brasileiro.
Você domina as técnicas de gancho, retenção e call-to-action para ${platformMap[platform] || platform}.
Sempre retorne o resultado usando a função fornecida.`;

    const userPrompt = `Crie um roteiro de ${duration} segundos para ${platformMap[platform] || platform} sobre:
Tema: ${topic}
Estilo: ${styleMap[style] || style}
${audience ? `Público-alvo: ${audience}` : ""}

O roteiro deve ter um gancho forte nos primeiros 3 segundos, manter a atenção do espectador e terminar com um CTA claro.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_script",
              description: "Cria um roteiro completo para vídeo curto",
              parameters: {
                type: "object",
                properties: {
                  hook: { type: "string", description: "Gancho inicial (primeiros 3 segundos)" },
                  development: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Pontos do desenvolvimento do conteúdo" 
                  },
                  cta: { type: "string", description: "Call-to-action final" },
                  audioSuggestion: { type: "string", description: "Sugestão de áudio/música trending" },
                  tips: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Dicas de produção e gravação" 
                  }
                },
                required: ["hook", "development", "cta", "audioSuggestion", "tips"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_script" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid response from AI");
    }

    const script = JSON.parse(toolCall.function.arguments);

    // Deduct credits AFTER successful generation
    const newCredits = currentCredits - CREDIT_COST;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
    }

    // Record credit transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -CREDIT_COST,
        transaction_type: 'consumption',
        description: 'Geração de roteiro',
        tool_name: 'script_generator'
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    console.log('Successfully generated script. Credits remaining:', newCredits);

    return new Response(
      JSON.stringify({
        ...script,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newCredits
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate script error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
