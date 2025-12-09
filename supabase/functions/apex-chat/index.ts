import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é um especialista em vendas, marketing digital, copywriting e estratégias de negócios online. 

Seu objetivo é ajudar empreendedores, infoprodutores e profissionais de marketing a:
- Criar copies persuasivas e que convertem
- Desenvolver estratégias de tráfego pago e orgânico
- Otimizar funis de vendas e páginas de captura
- Entender métricas e KPIs importantes
- Criar conteúdo para redes sociais
- Desenvolver estratégias de lançamento
- Precificar produtos e serviços
- Entender psicologia de vendas e gatilhos mentais

Responda sempre de forma prática, objetiva e com exemplos quando possível. Use linguagem acessível e evite jargões desnecessários. Quando apropriado, forneça templates, scripts ou estruturas que possam ser usados imediatamente.

Se o usuário enviar uma imagem, analise-a no contexto de marketing e vendas (por exemplo: anúncios, landing pages, posts, etc.) e forneça feedback construtivo.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the messages array for the API
    const apiMessages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    for (const msg of messages) {
      if (msg.role === 'user' && msg.imageBase64) {
        // Message with image
        apiMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: msg.content || 'Analise esta imagem:' },
            { type: 'image_url', image_url: { url: msg.imageBase64 } }
          ]
        });
      } else {
        apiMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    console.log('Sending request to Lovable AI with', apiMessages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos à sua conta.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Erro ao processar sua mensagem.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in apex-chat:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
