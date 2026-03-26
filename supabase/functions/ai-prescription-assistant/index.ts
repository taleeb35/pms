import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { diagnosis, chiefComplaint, patientAge, patientGender, allergies, diseases, vitalSigns } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert clinical pharmacologist and prescription assistant for doctors in Pakistan.
Your role is to SUGGEST medications based on the diagnosis and patient profile. The doctor will review and modify your suggestions.

IMPORTANT RULES:
- Always consider patient age, gender, allergies, and existing conditions
- Flag any drug interactions or contraindications clearly with ⚠️
- Use generic drug names with common brand names in Pakistan in brackets
- Include dosage, frequency, duration, and route
- Format output as a clean prescription list
- Add important instructions/warnings at the end
- Keep it concise and clinically relevant
- If patient has allergies, ALWAYS check for cross-reactivity
- For pediatric patients (age < 12), use weight-based dosing guidelines
- For elderly patients (age > 65), suggest reduced doses where appropriate
- NEVER suggest controlled substances without clear clinical indication
- This is a SUGGESTION only — always remind this is for doctor review`;

    const userPrompt = `Generate prescription suggestions for the following case:

**Diagnosis/Chief Complaint:** ${chiefComplaint || 'Not specified'}
${diagnosis ? `**ICD Diagnosis:** ${diagnosis}` : ''}
**Patient:** ${patientAge} year old ${patientGender}
${allergies ? `**Known Allergies:** ${allergies}` : '**Known Allergies:** None reported'}
${diseases ? `**Existing Conditions:** ${diseases}` : ''}
${vitalSigns ? `**Vital Signs:** ${vitalSigns}` : ''}

Please suggest appropriate medications with dosage, frequency, and duration. Include any warnings based on the patient profile.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Prescription assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
