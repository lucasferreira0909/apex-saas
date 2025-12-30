import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CREDIT_COST = 4; // Image generation costs 4 credits

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio = '1:1' } = await req.json();

    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Usuário não autenticado');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Configuração do Supabase não encontrada');
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const userId = user.id;
    console.log('User ID:', userId);

    // Check user credits
    const { data: profile, error: profileError } = await supabaseUser
      .from('profiles')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Erro ao verificar créditos');
    }

    const currentCredits = profile?.credits ?? 0;
    console.log('Current credits:', currentCredits);

    if (currentCredits < CREDIT_COST) {
      return new Response(
        JSON.stringify({ 
          error: `Créditos insuficientes. Você precisa de ${CREDIT_COST} créditos para gerar uma imagem.`,
          creditsRequired: CREDIT_COST,
          currentCredits: currentCredits
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating image with prompt:', prompt, 'aspect ratio:', aspectRatio);

    const enhancedPrompt = `${prompt}. Ultra high resolution, professional quality, aspect ratio ${aspectRatio}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: enhancedPrompt }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Erro ao gerar imagem');
    }

    const data = await response.json();
    console.log('AI response received');

    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || '';

    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('Nenhuma imagem foi gerada. Tente novamente com um prompt diferente.');
    }

    // Deduct credits AFTER successful generation
    const newCredits = currentCredits - CREDIT_COST;
    const { error: updateError } = await supabaseUser
      .from('profiles')
      .update({ credits: newCredits })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      // Don't fail the request, image was generated successfully
    }

    // Record credit transaction
    const { error: transactionError } = await supabaseUser
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -CREDIT_COST,
        transaction_type: 'consumption',
        description: 'Geração de imagem',
        tool_name: 'image_generator'
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    // Extract base64 data and upload to storage
    const base64Data = imageData.split(',')[1] || imageData;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const timestamp = Date.now();
    const storagePath = `${userId}/${timestamp}.png`;
    
    const { error: uploadError } = await supabaseUser.storage
      .from('generated-images')
      .upload(storagePath, binaryData, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Erro ao salvar imagem');
    }

    const { data: urlData } = supabaseUser.storage
      .from('generated-images')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;
    console.log('Image uploaded to:', publicUrl);

    // Save to database
    const { error: insertError } = await supabaseUser
      .from('generated_images')
      .insert({
        user_id: userId,
        prompt: prompt,
        aspect_ratio: aspectRatio,
        image_url: publicUrl,
        storage_path: storagePath,
        description: textContent
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    console.log('Successfully generated image. Credits remaining:', newCredits);

    return new Response(
      JSON.stringify({ 
        imageUrl: publicUrl,
        description: textContent,
        creditsUsed: CREDIT_COST,
        creditsRemaining: newCredits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error in generate-image:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
