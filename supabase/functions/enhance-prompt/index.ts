import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ENHANCE_SYSTEM_PROMPT = `Você é um especialista em criar prompts eficazes para obter as melhores respostas sobre marketing digital e vendas.

Sua tarefa é pegar uma pergunta simples ou mal formulada e transformá-la em um prompt mais detalhado e específico que gerará uma resposta mais útil e completa.

Regras:
1. Mantenha a intenção original da pergunta
2. Adicione contexto relevante quando apropriado
3. Seja específico sobre o que se espera na resposta
4. Mantenha o prompt em português
5. Não adicione informações que o usuário não mencionou
6. Retorne APENAS o prompt aprimorado, sem explicações adicionais`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Enhancing prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: ENHANCE_SYSTEM_PROMPT },
          { role: 'user', content: `Aprimore este prompt: "${prompt}"` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Erro ao aprimorar o prompt');
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content || prompt;

    console.log('Enhanced prompt:', enhancedPrompt);

    return new Response(JSON.stringify({ enhancedPrompt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhance-prompt:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
