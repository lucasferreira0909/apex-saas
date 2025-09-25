import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportTicketRequest {
  subject: string;
  description: string;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, description, priority }: SupportTicketRequest = await req.json();

    // Get authorization header for user info
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Create Supabase client to get user info
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('User not authenticated');
    }

    console.log('User authenticated:', user.email);

    // Try to get additional user profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone')
      .eq('user_id', user.id)
      .maybeSingle();

    const userName = profile?.first_name 
      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
      : user.email?.split('@')[0] || 'Usuário';

    // Create ticket ID
    const ticketId = `APEX-${Date.now().toString().slice(-6)}`;

    console.log('Sending support ticket email...');

    const emailResponse = await resend.emails.send({
      from: "Apex Support <suporte@apex-platform.com>",
      to: ["apex.suporte.br@gmail.com"],
      replyTo: [user.email!],
      subject: `[${ticketId}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Novo Ticket de Suporte</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Ticket ID: ${ticketId}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none;">
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">Informações do Autor</h2>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${userName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${user.email}" style="color: #667eea;">${user.email}</a></p>
              ${profile?.phone ? `<p style="margin: 5px 0;"><strong>Telefone:</strong> ${profile.phone}</p>` : ''}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">Detalhes do Ticket</h2>
              <p style="margin: 5px 0;"><strong>Assunto:</strong> ${subject}</p>
              <p style="margin: 5px 0;"><strong>Prioridade:</strong> 
                <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                  ${priority === 'critica' ? 'background: #dc3545; color: white;' : 
                    priority === 'alta' ? 'background: #fd7e14; color: white;' :
                    priority === 'media' ? 'background: #ffc107; color: #333;' :
                    'background: #28a745; color: white;'}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
              </p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <h2 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">Descrição do Problema</h2>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
                ${description.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          
          <div style="background: #343a40; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              Para responder a este ticket, responda diretamente para 
              <a href="mailto:${user.email}" style="color: #007bff; text-decoration: none;">${user.email}</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Support ticket sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      ticketId,
      message: "Ticket enviado com sucesso!"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-ticket function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);