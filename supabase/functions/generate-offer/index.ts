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
    const { productName, originalPrice, offerPrice, deadline, bonuses, targetPain } = await req.json();

    if (!productName || !originalPrice || !offerPrice || !targetPain) {
      return new Response(
        JSON.stringify({ error: 'Preencha todos os campos obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    console.log('Successfully generated offer');

    return new Response(
      JSON.stringify(parsedContent),
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
