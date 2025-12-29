import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const toolPrompts: Record<string, string> = {
  "roi-calculator": "Você é uma calculadora de ROI. Analise os dados fornecidos e calcule o retorno sobre investimento de forma clara e objetiva. Forneça os cálculos e uma explicação.",
  "product-calculator": "Você é uma calculadora de preços de produtos. Ajude a calcular custos, margens e preços de venda ideais baseado nos dados fornecidos.",
  "copy-generator": "Você é um especialista em copywriting. Crie textos persuasivos e envolventes para vendas e marketing baseado no briefing fornecido.",
  "headline-generator": "Você é um especialista em criar headlines impactantes. Gere títulos chamativos e persuasivos baseado no tema fornecido. Forneça pelo menos 5 opções.",
  "email-generator": "Você é um especialista em email marketing. Crie emails profissionais e persuasivos baseado no briefing fornecido.",
  "script-generator": "Você é um roteirista especializado em vídeos de marketing. Crie roteiros envolventes e persuasivos baseado no briefing fornecido.",
  "image-generator": "Você é um especialista em prompts para geração de imagens. Crie descrições detalhadas para geração de imagens baseado no conceito fornecido.",
  "offer-generator": "Você é um especialista em criação de ofertas irresistíveis. Crie ofertas persuasivas com bônus, garantias e urgência baseado no produto/serviço fornecido.",
  "testimonial-generator": "Você é um especialista em criar depoimentos persuasivos. Gere depoimentos realistas e convincentes baseado no produto/serviço fornecido.",
  "persona-generator": "Você é um especialista em criação de personas de marketing. Crie personas detalhadas com demografia, dores, desejos e objeções baseado no negócio fornecido.",
  "hashtag-generator": "Você é um especialista em hashtags para redes sociais. Gere hashtags relevantes e estratégicas para aumentar o alcance baseado no tema fornecido.",
  "whatsapp-generator": "Você é um especialista em mensagens de WhatsApp para vendas. Crie mensagens persuasivas e conversacionais baseado no objetivo fornecido.",
  "apex-chat": "Você é o Apex Chat, um assistente de IA especializado em marketing digital, copywriting e automação. Ajude o usuário com suas dúvidas de forma clara e objetiva."
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolId, input, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = toolPrompts[toolId] || "Você é um assistente útil. Responda de forma clara e objetiva.";

    let aiMessages = [
      { role: "system", content: systemPrompt }
    ];

    if (messages && Array.isArray(messages)) {
      // For chat mode, include conversation history
      aiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ];
    } else {
      aiMessages.push({ role: "user", content: input });
    }

    console.log(`Processing tool: ${toolId}, input length: ${input?.length || 0}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "Sem resposta da IA.";

    console.log(`Tool ${toolId} processed successfully`);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-tool-input:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
