import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if requesting user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Unauthorized - Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Admin user verified, finding orphaned users...");

    // Find orphaned users (those not linked to doctor, clinic, receptionist, or admin)
    const { data: orphanedUsers, error: queryError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .not("id", "in", `(
        SELECT id FROM doctors
        UNION
        SELECT id FROM clinics
        UNION
        SELECT user_id FROM clinic_receptionists
        UNION
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )`);

    // Use raw query approach instead
    const { data: allProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email");

    const { data: doctors } = await supabaseAdmin
      .from("doctors")
      .select("id");

    const { data: clinics } = await supabaseAdmin
      .from("clinics")
      .select("id");

    const { data: receptionists } = await supabaseAdmin
      .from("clinic_receptionists")
      .select("user_id");

    const { data: admins } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const linkedIds = new Set([
      ...(doctors?.map(d => d.id) || []),
      ...(clinics?.map(c => c.id) || []),
      ...(receptionists?.map(r => r.user_id) || []),
      ...(admins?.map(a => a.user_id) || []),
    ]);

    const orphanedProfiles = allProfiles?.filter(p => !linkedIds.has(p.id)) || [];

    console.log(`Found ${orphanedProfiles.length} orphaned users`);

    const deletedUsers: string[] = [];
    const failedUsers: { email: string; error: string }[] = [];

    for (const profile of orphanedProfiles) {
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(profile.id);
        if (deleteError) {
          console.error(`Failed to delete ${profile.email}:`, deleteError);
          failedUsers.push({ email: profile.email, error: deleteError.message });
        } else {
          console.log(`Deleted user: ${profile.email}`);
          deletedUsers.push(profile.email);
        }
      } catch (e) {
        console.error(`Exception deleting ${profile.email}:`, e);
        failedUsers.push({ email: profile.email, error: String(e) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deletedCount: deletedUsers.length,
      deletedUsers,
      failedCount: failedUsers.length,
      failedUsers,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
