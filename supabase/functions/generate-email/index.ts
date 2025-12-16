import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailType, productName, productDescription, tone, cta } = await req.json();

    if (!emailType || !productName || !productDescription) {
      return new Response(
        JSON.stringify({ error: "Email type, product name and description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const emailTypeMap: Record<string, string> = {
      "welcome": "boas-vindas para novos clientes/assinantes",
      "followup": "follow-up após interesse ou contato",
      "promotion": "promoção/oferta especial",
      "cart": "recuperação de carrinho abandonado",
      "launch": "lançamento de produto ou serviço"
    };

    const toneMap: Record<string, string> = {
      "formal": "formal e profissional",
      "casual": "casual e amigável",
      "urgent": "urgente e persuasivo",
      "friendly": "caloroso e acolhedor"
    };

    const systemPrompt = `Você é um especialista em email marketing que cria emails de alta conversão em português brasileiro.
Seu trabalho é criar emails persuasivos, claros e que geram ação.
Sempre retorne o resultado usando a função fornecida.`;

    const userPrompt = `Crie um email de ${emailTypeMap[emailType] || emailType} para:
Produto/Serviço: ${productName}
Descrição: ${productDescription}
Tom: ${toneMap[tone] || tone}
${cta ? `CTA desejado: ${cta}` : ""}

O email deve ser persuasivo, direto e focado em conversão.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_email",
              description: "Cria um email de marketing completo",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Assunto do email (máx 60 caracteres)" },
                  preheader: { type: "string", description: "Texto de prévia do email (máx 100 caracteres)" },
                  body: { type: "string", description: "Corpo completo do email em texto" }
                },
                required: ["subject", "preheader", "body"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_email" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid response from AI");
    }

    const email = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(email),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
