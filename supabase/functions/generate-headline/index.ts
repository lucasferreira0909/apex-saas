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
    const { topic, platform, style } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'O tema/assunto é obrigatório' }),
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
          error: `Créditos insuficientes. Você precisa de ${CREDIT_COST} crédito para gerar headlines.`,
          creditsRequired: CREDIT_COST,
          currentCredits: currentCredits
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const platformInstructions: Record<string, string> = {
      'instagram': `Para Instagram:
- Headlines curtas e impactantes (máx 125 caracteres)
- Use emojis estrategicamente
- Ganchos visuais que funcionam com imagens
- Perguntas que geram comentários
- Formato que incentiva o "salvar" e compartilhar`,
      'tiktok': `Para TikTok:
- Headlines virais e curiosas
- Ganchos de "você não vai acreditar"
- Linguagem jovem e descontraída
- Referências a tendências
- Formato que prende nos primeiros 3 segundos`,
      'youtube': `Para YouTube:
- Headlines otimizadas para SEO
- Títulos que aumentam CTR
- Palavras-chave no início
- Números e listas funcionam bem
- Evite clickbait exagerado`
    };

    const styleInstructions: Record<string, string> = {
      'curiosidade': 'Use ganchos de curiosidade que fazem o leitor querer saber mais',
      'beneficio': 'Foque nos benefícios claros e tangíveis para o leitor',
      'problema': 'Aborde uma dor ou problema que o leitor enfrenta',
      'numero': 'Use números, listas e dados específicos para credibilidade'
    };

    const prompt = `Você é um especialista em criação de headlines virais para redes sociais. Crie 5 headlines para o seguinte tema:

Tema/Assunto: ${topic}
Plataforma: ${platform}
Estilo: ${style}

${platformInstructions[platform] || platformInstructions['instagram']}

Estilo de abordagem: ${styleInstructions[style] || styleInstructions['curiosidade']}

Responda APENAS com um JSON válido no seguinte formato, sem nenhum texto adicional:
{
  "headlines": [
    {
      "text": "headline aqui",
      "tip": "dica breve de por que essa headline funciona"
    }
  ]
}`;

    console.log('Generating headlines for:', topic, 'platform:', platform);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em marketing digital e criação de conteúdo viral. Sempre responda em português do Brasil com JSON válido.' },
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
      throw new Error('Erro ao gerar headlines');
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
        description: 'Geração de headlines',
        tool_name: 'headline_generator'
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    console.log('Successfully generated', parsedContent.headlines?.length, 'headlines. Credits remaining:', newCredits);

    return new Response(
      JSON.stringify({
        ...parsedContent,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newCredits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-headline:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
