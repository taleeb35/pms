import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAILY_API_URL = "https://api.daily.co/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const DAILY_API_KEY = Deno.env.get("DAILY_API_KEY");
    if (!DAILY_API_KEY) {
      throw new Error("DAILY_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { appointment_id, doctor_id, patient_id, patient_name, patient_phone, enable_recording } = await req.json();

    if (!appointment_id || !doctor_id || !patient_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a unique room name
    const roomName = `consult-${appointment_id.substring(0, 8)}-${Date.now()}`;

    // Create Daily.co room
    const roomResponse = await fetch(`${DAILY_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          enable_recording: enable_recording ? "cloud" : undefined,
          enable_chat: true,
          enable_screenshare: true,
          exp: Math.floor(Date.now() / 1000) + 7200, // 2 hour expiry
          max_participants: 4,
          enable_knocking: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!roomResponse.ok) {
      const errData = await roomResponse.text();
      throw new Error(`Daily.co room creation failed: ${errData}`);
    }

    const room = await roomResponse.json();

    // Create doctor meeting token
    const doctorTokenRes = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: true,
          enable_recording: enable_recording ? "cloud" : undefined,
          exp: Math.floor(Date.now() / 1000) + 7200,
        },
      }),
    });

    const doctorToken = await doctorTokenRes.json();

    // Create patient meeting token
    const patientTokenRes = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: false,
          exp: Math.floor(Date.now() / 1000) + 7200,
          user_name: patient_name || "Patient",
        },
      }),
    });

    const patientToken = await patientTokenRes.json();

    const patientJoinUrl = `${room.url}?t=${patientToken.token}`;

    // Save to database using service role for insert
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: videoConsultation, error: dbError } = await serviceClient
      .from("video_consultations")
      .insert({
        appointment_id,
        doctor_id,
        patient_id,
        room_name: roomName,
        room_url: room.url,
        patient_join_url: patientJoinUrl,
        doctor_token: doctorToken.token,
        patient_token: patientToken.token,
        status: "waiting",
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Generate WhatsApp link
    const cleanPhone = (patient_phone || "").replace(/[^0-9]/g, "");
    const whatsappMessage = encodeURIComponent(
      `Your video consultation is ready! Join here: ${patientJoinUrl}`
    );
    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${whatsappMessage}`
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        video_consultation: videoConsultation,
        room_url: room.url,
        doctor_token: doctorToken.token,
        patient_join_url: patientJoinUrl,
        whatsapp_url: whatsappUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error creating video room:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
