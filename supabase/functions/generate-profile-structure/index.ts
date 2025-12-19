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
    const { businessName, niche, platform, valueProposition, tone } = await req.json();

    if (!businessName || !niche || !platform) {
      return new Response(
        JSON.stringify({ error: "Business name, niche and platform are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const platformLimits: Record<string, { bioLimit: number; highlights: number }> = {
      instagram: { bioLimit: 150, highlights: 5 },
      tiktok: { bioLimit: 80, highlights: 0 },
      youtube: { bioLimit: 1000, highlights: 5 },
      linkedin: { bioLimit: 2600, highlights: 5 },
      twitter: { bioLimit: 160, highlights: 0 },
    };

    const limits = platformLimits[platform] || { bioLimit: 150, highlights: 5 };

    const systemPrompt = `Você é um especialista em marketing digital e branding pessoal.
Sua especialidade é criar estruturas de perfil otimizadas para redes sociais em português brasileiro.
Você conhece profundamente as melhores práticas de cada plataforma.
Sempre retorne o resultado usando a função fornecida.`;

    const userPrompt = `Crie uma estrutura de perfil otimizada para ${platform.toUpperCase()}:

Nome do Negócio/Marca: ${businessName}
Nicho: ${niche}
${valueProposition ? `Proposta de Valor: ${valueProposition}` : ""}
${tone ? `Tom de Comunicação: ${tone}` : "Tom: Profissional"}

REGRAS DA PLATAFORMA:
- Bio: máximo ${limits.bioLimit} caracteres
${limits.highlights > 0 ? `- Destaques/Seções: sugerir ${limits.highlights} tópicos` : "- Não há destaques nesta plataforma"}

A estrutura deve ser prática, persuasiva e adaptada para a plataforma escolhida.`;

    console.log("Generating profile structure for:", platform, businessName);

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
              name: "create_profile_structure",
              description: "Cria uma estrutura de perfil completa para redes sociais",
              parameters: {
                type: "object",
                properties: {
                  bio: { 
                    type: "string", 
                    description: "Bio otimizada para a plataforma, dentro do limite de caracteres" 
                  },
                  highlights: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Sugestões de destaques/seções do perfil (stories highlights, seções do canal, etc)" 
                  },
                  contentPillars: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3 pilares de conteúdo estratégicos para o perfil" 
                  },
                  cta: { 
                    type: "string", 
                    description: "Call-to-action recomendado para a bio ou descrição" 
                  },
                  keywords: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "5-8 palavras-chave relevantes para o perfil" 
                  },
                  tips: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 dicas específicas para otimizar o perfil na plataforma" 
                  }
                },
                required: ["bio", "highlights", "contentPillars", "cta", "keywords", "tips"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_profile_structure" } }
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

    const profileStructure = JSON.parse(toolCall.function.arguments);
    console.log("Profile structure generated successfully");

    return new Response(
      JSON.stringify(profileStructure),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate profile structure error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
