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
    const { business, productDescription, currentAudience, priceRange } = await req.json();

    if (!business || !productDescription) {
      return new Response(
        JSON.stringify({ error: "Business and product description are required" }),
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
          error: `Créditos insuficientes. Você precisa de ${CREDIT_COST} crédito para gerar persona.`,
          creditsRequired: CREDIT_COST,
          currentCredits: currentCredits
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é um especialista em marketing e comportamento do consumidor.
Sua especialidade é criar personas detalhadas e realistas para negócios em português brasileiro.
As personas que você cria são baseadas em dados demográficos e psicográficos reais.
Sempre retorne o resultado usando a função fornecida.`;

    const userPrompt = `Crie uma persona ideal de cliente para:
Tipo de Negócio: ${business}
Produto/Serviço: ${productDescription}
${currentAudience ? `Público atual: ${currentAudience}` : ""}
${priceRange ? `Faixa de preço: ${priceRange}` : ""}

A persona deve ser detalhada, realista e útil para estratégias de marketing.`;

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
              name: "create_persona",
              description: "Cria uma persona de cliente completa",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Nome fictício da persona" },
                  age: { type: "number", description: "Idade da persona" },
                  profession: { type: "string", description: "Profissão" },
                  income: { type: "string", description: "Faixa de renda" },
                  location: { type: "string", description: "Cidade/região onde mora" },
                  education: { type: "string", description: "Nível de escolaridade" },
                  pains: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Principais dores e problemas" 
                  },
                  desires: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Desejos e aspirações" 
                  },
                  buyingBehavior: { type: "string", description: "Comportamento de compra" },
                  preferredChannels: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Canais de comunicação preferidos" 
                  },
                  objections: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Objeções comuns na hora da compra" 
                  },
                  triggers: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Gatilhos que levam à compra" 
                  },
                  quote: { type: "string", description: "Uma frase que essa persona diria" }
                },
                required: ["name", "age", "profession", "income", "pains", "desires", "buyingBehavior", "preferredChannels", "objections", "triggers", "quote"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_persona" } }
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

    const persona = JSON.parse(toolCall.function.arguments);

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
        description: 'Geração de persona',
        tool_name: 'persona_generator'
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    console.log('Successfully generated persona. Credits remaining:', newCredits);

    return new Response(
      JSON.stringify({
        ...persona,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newCredits
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate persona error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
