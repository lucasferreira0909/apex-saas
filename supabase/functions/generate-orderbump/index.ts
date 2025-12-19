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
    const { mainProductName, mainProductPrice, orderBumpName, orderBumpPrice, mainBenefit, tone } = await req.json();

    if (!mainProductName || !mainProductPrice || !orderBumpName || !orderBumpPrice) {
      return new Response(
        JSON.stringify({ error: "Main product name, price, order bump name and price are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneInstructions: Record<string, string> = {
      urgente: "Use gatilhos de urgência e escassez. Destaque que a oferta é limitada.",
      exclusivo: "Enfatize a exclusividade e o acesso especial. Faça o cliente se sentir privilegiado.",
      complementar: "Mostre como o OrderBump complementa e potencializa o produto principal.",
      economico: "Destaque a economia e o custo-benefício. Compare com o valor real.",
      premium: "Use linguagem sofisticada e enfatize a qualidade superior.",
    };

    const toneInstruction = tone ? toneInstructions[tone] || "" : "";

    const systemPrompt = `Você é um especialista em copywriting e otimização de conversão.
Sua especialidade é criar OrderBumps persuasivos que aumentam o ticket médio.
Você conhece todas as técnicas de persuasão e gatilhos mentais.
Sempre escreva em português brasileiro.
Sempre retorne o resultado usando a função fornecida.`;

    const userPrompt = `Crie um OrderBump persuasivo:

PRODUTO PRINCIPAL: ${mainProductName}
PREÇO PRINCIPAL: R$ ${mainProductPrice}

ORDERBUMP: ${orderBumpName}
PREÇO ORDERBUMP: R$ ${orderBumpPrice}
${mainBenefit ? `BENEFÍCIO PRINCIPAL: ${mainBenefit}` : ""}
${toneInstruction ? `TOM: ${toneInstruction}` : ""}

O OrderBump deve:
- Ter uma headline chamativa (máximo 10 palavras)
- Ter uma descrição persuasiva e curta (máximo 2 frases)
- Listar 3-4 benefícios específicos
- Ter um texto de checkbox irresistível
- Ter um argumento forte de economia/valor`;

    console.log("Generating order bump for:", orderBumpName);

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
              name: "create_orderbump",
              description: "Cria um OrderBump persuasivo completo",
              parameters: {
                type: "object",
                properties: {
                  headline: { 
                    type: "string", 
                    description: "Headline chamativa e curta (máximo 10 palavras)" 
                  },
                  description: { 
                    type: "string", 
                    description: "Descrição persuasiva e curta (máximo 2 frases)" 
                  },
                  benefits: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-4 benefícios específicos e concretos" 
                  },
                  checkboxText: { 
                    type: "string", 
                    description: "Texto que aparece no checkbox para adicionar o OrderBump" 
                  },
                  savingsArgument: { 
                    type: "string", 
                    description: "Argumento de economia ou valor que justifica a compra" 
                  }
                },
                required: ["headline", "description", "benefits", "checkboxText", "savingsArgument"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_orderbump" } }
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
      console.error("Invalid response structure:", JSON.stringify(data));
      throw new Error("Invalid response from AI");
    }

    const orderBump = JSON.parse(toolCall.function.arguments);
    console.log("Order bump generated successfully");

    return new Response(
      JSON.stringify(orderBump),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate order bump error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
