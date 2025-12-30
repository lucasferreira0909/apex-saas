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
    const { productName, productDescription, targetAudience, quantity, style = 'informal' } = await req.json();

    if (!productName || !productDescription) {
      throw new Error('Nome do produto e descrição são obrigatórios');
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
          error: `Créditos insuficientes. Você precisa de ${CREDIT_COST} crédito para gerar depoimentos.`,
          creditsRequired: CREDIT_COST,
          currentCredits: currentCredits
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating testimonials for:', productName, 'quantity:', quantity, 'style:', style);

    const styleInstructions: Record<string, string> = {
      formal: `
- Use linguagem formal e profissional
- Evite gírias e expressões coloquiais
- Foque em resultados e métricas quando possível
- Tom mais sério e corporativo
- Estruture bem os argumentos`,
      informal: `
- Use linguagem informal e espontânea
- Inclua gírias e expressões do dia a dia
- Tom leve e descontraído
- Pareça uma conversa natural entre amigos
- Use emojis moderadamente no texto quando apropriado`,
      emocional: `
- Foque na transformação pessoal e emocional
- Descreva sentimentos antes e depois de usar o produto
- Use palavras que evoquem emoções fortes
- Inclua histórias pessoais e momentos de superação
- Tom inspirador e motivacional`,
      tecnico: `
- Foque em especificações técnicas e funcionalidades
- Use termos técnicos apropriados ao nicho
- Mencione comparações com concorrentes
- Descreva processos e metodologias
- Tom analítico e detalhista`
    };

    const systemPrompt = `Você é um especialista em marketing e copywriting. Sua tarefa é gerar depoimentos fictícios, mas realistas e convincentes, de clientes satisfeitos.

ESTILO DO DEPOIMENTO: ${style.toUpperCase()}
${styleInstructions[style] || styleInstructions.informal}

IMPORTANTE: 
- Os depoimentos devem parecer autênticos e naturais
- Inclua detalhes específicos sobre a experiência
- Varie o tamanho de cada depoimento
- Alguns depoimentos devem ser curtos (1-2 frases), outros mais detalhados
- Gere nomes brasileiros variados (masculinos e femininos)
- Inclua profissões ou contextos variados

Responda APENAS com um array JSON válido no seguinte formato:
[
  {
    "name": "Nome Completo",
    "role": "Profissão ou contexto",
    "testimonial": "Texto do depoimento",
    "rating": 5
  }
]`;

    const userPrompt = `Gere ${quantity} depoimentos no estilo ${style.toUpperCase()} para:

Produto/Serviço: ${productName}
Descrição: ${productDescription}
${targetAudience ? `Público-alvo: ${targetAudience}` : ''}

Gere depoimentos variados, autênticos e convincentes.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Erro ao gerar depoimentos');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('AI response received, parsing JSON...');

    // Parse the JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Could not find JSON array in response:', content);
      throw new Error('Formato de resposta inválido');
    }

    const testimonials = JSON.parse(jsonMatch[0]);

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
        description: 'Geração de depoimentos',
        tool_name: 'testimonial_generator'
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    console.log('Successfully generated', testimonials.length, 'testimonials. Credits remaining:', newCredits);

    return new Response(
      JSON.stringify({ 
        testimonials,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newCredits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error in generate-testimonials:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
