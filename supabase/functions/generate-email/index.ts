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
    const { emailType, productName, productDescription, tone, cta } = await req.json();

    if (!emailType || !productName || !productDescription) {
      return new Response(
        JSON.stringify({ error: "Email type, product name and description are required" }),
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
          error: `Créditos insuficientes. Você precisa de ${CREDIT_COST} crédito para gerar email.`,
          creditsRequired: CREDIT_COST,
          currentCredits: currentCredits
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailTypeMap: Record<string, string> = {
      "welcome": "boas-vindas para novos clientes/assinantes",
      "followup": "follow-up após interesse ou contato",
      "promotion": "promoção/oferta especial",
      "cart": "recuperação de carrinho abandonado",
      "launch": "lançamento de produto ou serviço"
    };

    const toneMap: Record<string, string> = {
      "formal": "formal e profissional",
      "casual": "casual e amigável",
      "urgent": "urgente e persuasivo",
      "friendly": "caloroso e acolhedor"
    };

    const systemPrompt = `Você é um especialista em email marketing que cria emails de alta conversão em português brasileiro.
Seu trabalho é criar emails persuasivos, claros e que geram ação.
Sempre retorne o resultado usando a função fornecida.`;

    const userPrompt = `Crie um email de ${emailTypeMap[emailType] || emailType} para:
Produto/Serviço: ${productName}
Descrição: ${productDescription}
Tom: ${toneMap[tone] || tone}
${cta ? `CTA desejado: ${cta}` : ""}

O email deve ser persuasivo, direto e focado em conversão.`;

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
              name: "create_email",
              description: "Cria um email de marketing completo",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Assunto do email (máx 60 caracteres)" },
                  preheader: { type: "string", description: "Texto de prévia do email (máx 100 caracteres)" },
                  body: { type: "string", description: "Corpo completo do email em texto" }
                },
                required: ["subject", "preheader", "body"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_email" } }
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

    const email = JSON.parse(toolCall.function.arguments);

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
        description: 'Geração de email',
        tool_name: 'email_generator'
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    console.log('Successfully generated email. Credits remaining:', newCredits);

    return new Response(
      JSON.stringify({
        ...email,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newCredits
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
