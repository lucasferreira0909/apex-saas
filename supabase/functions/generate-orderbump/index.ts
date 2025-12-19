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
    const { productName, productPrice, productDescription, targetAudience } = await req.json();

    if (!productName || !productPrice) {
      return new Response(
        JSON.stringify({ error: "Nome e preço do produto são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em estratégias de vendas e OrderBumps.
Sua especialidade é criar OrderBumps complementares que aumentam o ticket médio.
Você conhece todas as técnicas de upsell e cross-sell.
Sempre crie OrderBumps que façam sentido com o produto principal.
Sempre escreva em português brasileiro.
Sempre retorne o resultado usando a função fornecida.`;

    const userPrompt = `Com base no produto principal abaixo, crie 3 sugestões de OrderBumps DIFERENTES e COMPLEMENTARES:

PRODUTO PRINCIPAL: ${productName}
PREÇO: R$ ${productPrice}
${productDescription ? `DESCRIÇÃO: ${productDescription}` : ""}
${targetAudience ? `PÚBLICO-ALVO: ${targetAudience}` : ""}

Para cada OrderBump, defina:
1. Um nome criativo e atrativo
2. Um preço sugerido (geralmente entre 10-20% do valor do produto principal)
3. O que exatamente será entregue (3-4 itens específicos)
4. Uma headline persuasiva curta
5. Um texto para o checkbox de seleção

Os OrderBumps devem ser complementares ao produto principal e agregar valor real ao cliente.
Varie os tipos: pode ser material de apoio, acesso a comunidade, templates, ferramentas, mentoria express, etc.`;

    console.log("Generating order bumps for:", productName);

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
              name: "create_orderbumps",
              description: "Cria 3 sugestões de OrderBumps complementares ao produto principal",
              parameters: {
                type: "object",
                properties: {
                  orderBumps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { 
                          type: "string", 
                          description: "Nome criativo do OrderBump" 
                        },
                        suggestedPrice: { 
                          type: "string", 
                          description: "Preço sugerido (apenas números, ex: 47)" 
                        },
                        deliverables: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "3-4 itens específicos do que será entregue" 
                        },
                        headline: { 
                          type: "string", 
                          description: "Headline persuasiva curta" 
                        },
                        checkboxText: { 
                          type: "string", 
                          description: "Texto que aparece no checkbox para adicionar o OrderBump" 
                        }
                      },
                      required: ["name", "suggestedPrice", "deliverables", "headline", "checkboxText"],
                      additionalProperties: false
                    },
                    description: "Array com 3 sugestões de OrderBumps"
                  }
                },
                required: ["orderBumps"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_orderbumps" } }
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

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Order bumps generated successfully:", result.orderBumps?.length);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate order bumps error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
