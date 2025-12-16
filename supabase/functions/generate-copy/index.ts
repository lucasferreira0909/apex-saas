import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productDescription, objective, tone } = await req.json();

    if (!productName || !productDescription) {
      return new Response(
        JSON.stringify({ error: 'Nome e descrição do produto são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const objectiveMap: Record<string, string> = {
      'venda': 'gerar vendas diretas',
      'engajamento': 'aumentar engajamento e interação',
      'captacao': 'captar leads e contatos',
      'lancamento': 'gerar buzz para lançamento'
    };

    const toneMap: Record<string, string> = {
      'urgente': 'com senso de urgência e escassez',
      'exclusivo': 'transmitindo exclusividade e valor premium',
      'emocional': 'apelando para emoções e sentimentos',
      'racional': 'com argumentos lógicos e benefícios práticos'
    };

    const prompt = `Você é um copywriter expert em persuasão e vendas. Crie 3 variações de copy persuasiva para o seguinte produto/serviço:

Produto/Serviço: ${productName}
Descrição: ${productDescription}
Objetivo: ${objectiveMap[objective] || 'gerar vendas'}
Tom: ${toneMap[tone] || 'persuasivo'}

Para cada copy, crie:
1. Um título/headline chamativo
2. O corpo da copy (2-3 parágrafos)
3. Uma chamada para ação (CTA) irresistível

Responda APENAS com um JSON válido no seguinte formato, sem nenhum texto adicional:
{
  "copies": [
    {
      "headline": "título chamativo aqui",
      "body": "corpo da copy aqui com parágrafos separados por \\n\\n",
      "cta": "chamada para ação aqui"
    }
  ]
}`;

    console.log('Generating copies for:', productName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um copywriter profissional brasileiro. Sempre responda em português do Brasil com JSON válido.' },
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Erro ao gerar copies');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Invalid JSON response:', content);
      throw new Error('Formato de resposta inválido');
    }

    const parsedContent = JSON.parse(jsonMatch[0]);
    console.log('Successfully generated', parsedContent.copies?.length, 'copies');

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-copy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
