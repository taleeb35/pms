import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting monthly clinic payment status reset...');

    // Reset all active clinics' fee_status to 'unpaid'
    const { data, error } = await supabase
      .from('clinics')
      .update({ fee_status: 'unpaid' })
      .eq('status', 'active');

    if (error) {
      console.error('Error resetting clinic payment statuses:', error);
      throw error;
    }

    console.log('Successfully reset all active clinic payment statuses to unpaid');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All active clinic payment statuses reset to unpaid',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in reset-clinic-payments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
