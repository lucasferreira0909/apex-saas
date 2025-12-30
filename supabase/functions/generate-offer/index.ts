import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 1; // Text generation costs 1 credit

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, originalPrice, offerPrice, deadline, bonuses, targetPain } = await req.json();

    if (!productName || !originalPrice || !offerPrice || !targetPain) {
      return new Response(
        JSON.stringify({ error: 'Preencha todos os campos obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
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
          error: `Créditos insuficientes. Você precisa de ${CREDIT_COST} crédito para gerar oferta.`,
          creditsRequired: CREDIT_COST,
          currentCredits: currentCredits
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const discount = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);

    const prompt = `Você é um expert em criação de ofertas irresistíveis e copywriting de alta conversão. Crie uma oferta persuasiva completa para o seguinte produto:

Produto/Serviço: ${productName}
Preço Original: R$ ${originalPrice}
Preço Promocional: R$ ${offerPrice}
Desconto: ${discount}%
${deadline ? `Prazo da Oferta: ${deadline}` : ''}
${bonuses ? `Bônus Inclusos: ${bonuses}` : ''}
Principal Dor do Público: ${targetPain}

Crie uma estrutura de oferta persuasiva completa com:
1. Headline principal (impactante e focada no benefício)
2. Subheadline (reforça a promessa)
3. Lista de 5 benefícios principais (transformadores, não features)
4. Seção de bônus formatada (se houver bônus)
5. Elemento de urgência/escassez
6. Call-to-action irresistível
7. Garantia (sugestão de garantia)

Responda APENAS com um JSON válido no seguinte formato, sem nenhum texto adicional:
{
  "offer": {
    "headline": "headline principal aqui",
    "subheadline": "subheadline aqui",
    "benefits": ["benefício 1", "benefício 2", "benefício 3", "benefício 4", "benefício 5"],
    "bonuses": ["bônus 1 formatado", "bônus 2 formatado"],
    "urgency": "texto de urgência/escassez aqui",
    "cta": "texto do botão de ação aqui",
    "guarantee": "texto da garantia aqui",
    "priceAnchor": "texto de ancoragem de preço (de R$X por R$Y)"
  }
}`;

    console.log('Generating offer for:', productName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um copywriter especialista em ofertas de alta conversão. Sempre responda em português do Brasil com JSON válido.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Erro ao gerar oferta');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Invalid JSON response:', content);
      throw new Error('Formato de resposta inválido');
    }

    const parsedContent = JSON.parse(jsonMatch[0]);

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
        description: 'Geração de oferta',
        tool_name: 'offer_generator'
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    console.log('Successfully generated offer. Credits remaining:', newCredits);

    return new Response(
      JSON.stringify({
        ...parsedContent,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newCredits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-offer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
