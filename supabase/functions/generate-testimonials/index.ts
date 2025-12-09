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
    const { productName, productDescription, targetAudience, quantity } = await req.json();

    if (!productName || !productDescription) {
      throw new Error('Nome do produto e descrição são obrigatórios');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('Generating testimonials for:', productName, 'quantity:', quantity);

    const systemPrompt = `Você é um especialista em marketing e copywriting. Sua tarefa é gerar depoimentos fictícios, mas realistas e convincentes, de clientes satisfeitos.

IMPORTANTE: 
- Os depoimentos devem parecer autênticos e naturais
- Use linguagem informal e espontânea
- Inclua detalhes específicos sobre a experiência
- Varie o estilo, tom e tamanho de cada depoimento
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

    const userPrompt = `Gere ${quantity} depoimentos para:

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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos esgotados. Adicione mais créditos para continuar.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    console.log('Successfully generated', testimonials.length, 'testimonials');

    return new Response(
      JSON.stringify({ testimonials }),
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
