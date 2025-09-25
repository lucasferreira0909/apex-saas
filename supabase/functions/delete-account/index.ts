import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Security: Only allow POST method for account deletion
  if (req.method !== 'POST') {
    console.warn(`Invalid method attempted: ${req.method} from ${req.headers.get('x-forwarded-for') || 'unknown'}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization');
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    console.log(`Account deletion request received from IP: ${clientIP}`);
    
    if (!authHeader) {
      console.warn(`Account deletion attempt without authorization header from IP: ${clientIP}`);
      throw new Error('No authorization header provided');
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client to get user info
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { authorization: authHeader }
        }
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error(`Authentication failed from IP ${clientIP}:`, userError?.message || 'Unknown error');
      throw new Error('User not authenticated');
    }

    // Security audit log: Record account deletion attempt
    console.log(`SECURITY AUDIT: Account deletion initiated for user ${user.id} (${user.email}) from IP: ${clientIP} at ${new Date().toISOString()}`);

    // Additional security check: Ensure user exists in profiles
    const { data: profile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('user_id', user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error(`Profile verification failed for user ${user.id}:`, profileCheckError);
      throw new Error('Profile verification failed');
    }

    console.log(`SECURITY AUDIT: Profile verified for user ${user.id}`);

    // Delete user profile first with detailed logging
    console.log(`Attempting to delete profile for user ${user.id}`);
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (profileError) {
      console.error(`Profile deletion failed for user ${user.id}:`, profileError);
      // Continue with auth deletion even if profile deletion fails
    } else {
      console.log(`Profile successfully deleted for user ${user.id}`);
    }

    // Delete the user from auth.users using admin client
    console.log(`Attempting to delete auth user ${user.id}`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error(`Auth user deletion failed for user ${user.id}:`, deleteError);
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    // Final security audit log
    console.log(`SECURITY AUDIT: Account deletion completed successfully for user ${user.id} at ${new Date().toISOString()}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});