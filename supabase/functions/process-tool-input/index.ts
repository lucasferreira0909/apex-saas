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
  "apex-ai": "Você é o Apex AI, um assistente de IA especializado em marketing digital, copywriting, vendas e automação. Você tem a capacidade de analisar imagens, vídeos e outros anexos que o usuário compartilhar. Quando o usuário perguntar sobre o conteúdo de um anexo (vídeo, imagem, link), analise-o detalhadamente e forneça informações úteis. Ajude o usuário com suas dúvidas de forma clara, objetiva e profissional. Forneça insights valiosos e acionáveis.",
  "apex-chat": "Você é o Apex AI, um assistente de IA especializado em marketing digital, copywriting e automação. Você pode analisar imagens, vídeos e outros anexos. Ajude o usuário com suas dúvidas de forma clara e objetiva."
};

// Helper to determine media type from URL
function getMediaType(url: string): string | null {
  const lowercaseUrl = url.toLowerCase();
  
  // Video formats
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowercaseUrl.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (lowercaseUrl.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/)) {
    return 'video';
  }
  
  // Image formats
  if (lowercaseUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/)) {
    return 'image';
  }
  
  // PDF
  if (lowercaseUrl.match(/\.pdf(\?|$)/)) {
    return 'pdf';
  }
  
  return null;
}

// Build content array for multimodal messages
function buildMultimodalContent(text: string, attachments: any[]): any[] {
  const content: any[] = [];
  
  // Add text content first
  content.push({ type: "text", text });
  
  // Process each attachment
  for (const attachment of attachments) {
    const url = attachment.url;
    const mediaType = getMediaType(url);
    
    if (mediaType === 'image') {
      // For images, add as image_url
      content.push({
        type: "image_url",
        image_url: { url }
      });
    } else if (mediaType === 'video' || mediaType === 'youtube' || mediaType === 'vimeo') {
      // For videos, add as video reference with metadata
      content.push({
        type: "text",
        text: `\n[Vídeo anexado: "${attachment.title}" - URL: ${url}]\nPor favor, analise este vídeo e descreva seu conteúdo.`
      });
      // Also try to include as video_url if supported
      content.push({
        type: "video_url",
        video_url: { url }
      });
    } else if (url) {
      // For other types (links, files), include as text reference
      content.push({
        type: "text",
        text: `\n[Anexo: "${attachment.title}" (${attachment.type}) - URL: ${url}]`
      });
    }
  }
  
  return content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolId, input, messages, attachments } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = toolPrompts[toolId] || "Você é um assistente útil. Responda de forma clara e objetiva.";
    const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;

    let aiMessages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    if (messages && Array.isArray(messages)) {
      // For chat mode, include conversation history
      const processedMessages = messages.map((m: any, index: number) => {
        // For the last user message, include attachments if available
        if (m.role === 'user' && index === messages.length - 1 && hasAttachments) {
          return {
            role: m.role,
            content: buildMultimodalContent(m.content, attachments)
          };
        }
        return { role: m.role, content: m.content };
      });
      
      aiMessages = [
        { role: "system", content: systemPrompt },
        ...processedMessages
      ];
    } else if (hasAttachments) {
      // Single input with attachments
      aiMessages.push({
        role: "user",
        content: buildMultimodalContent(input, attachments)
      });
    } else {
      aiMessages.push({ role: "user", content: input });
    }

    console.log(`Processing tool: ${toolId}, input length: ${input?.length || 0}, attachments: ${attachments?.length || 0}`);

    // Use gemini-2.5-pro for better multimodal understanding when attachments are present
    const model = hasAttachments ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
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

    console.log(`Tool ${toolId} processed successfully with model ${model}`);

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
