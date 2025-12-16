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
    const { topic, platform, style } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'O tema/assunto é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
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

    const prompt = `Você é um especialista em criação de headlines virais para redes sociais. Crie 8 headlines para o seguinte tema:

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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    console.log('Successfully generated', parsedContent.headlines?.length, 'headlines');

    return new Response(
      JSON.stringify(parsedContent),
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
