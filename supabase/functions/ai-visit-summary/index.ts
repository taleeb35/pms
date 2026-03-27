import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      patientName,
      patientAge,
      patientGender,
      bloodGroup,
      allergies,
      diseases,
      chiefComplaint,
      diagnosis,
      prescription,
      vitalSigns,
      testReports,
      nextVisitNotes,
      nextVisitDate,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert medical documentation specialist generating professional clinical visit summaries for doctors in Pakistan.

IMPORTANT RULES:
- Generate a concise, structured clinical summary in professional medical language
- Use clear sections with headers
- Include all relevant clinical findings from the provided data
- Highlight any concerning findings or risk factors with ⚠️
- Include follow-up recommendations if next visit info is provided
- Keep the tone professional and suitable for medical records
- Format using markdown with clear headings and bullet points
- If allergies or diseases are present, mention them in context of the treatment plan
- This summary should be suitable for printing and filing in patient records
- Do NOT invent or assume any data not provided — only summarize what is given
- Keep it concise — ideally under 300 words`;

    const userPrompt = `Generate a professional clinical visit summary for the following patient encounter:

**Patient:** ${patientName || 'Unknown'}
**Age:** ${patientAge || 'Unknown'} years | **Gender:** ${patientGender || 'Unknown'}
${bloodGroup ? `**Blood Group:** ${bloodGroup}` : ''}
${allergies ? `**Known Allergies:** ${allergies}` : '**Known Allergies:** None reported'}
${diseases ? `**Chronic Conditions:** ${diseases}` : ''}

**CLINICAL FINDINGS:**
${vitalSigns ? `**Vital Signs:** ${vitalSigns}` : '**Vital Signs:** Not recorded'}
${chiefComplaint ? `**Chief Complaint:** ${chiefComplaint}` : '**Chief Complaint:** Not specified'}
${diagnosis ? `**Diagnosis:** ${diagnosis}` : ''}

**TREATMENT:**
${prescription ? `**Prescription:** ${prescription}` : '**Prescription:** None prescribed'}
${testReports ? `**Tests Ordered:** ${testReports}` : ''}

**FOLLOW-UP:**
${nextVisitDate ? `**Next Visit:** ${nextVisitDate}` : '**Next Visit:** Not scheduled'}
${nextVisitNotes ? `**Follow-up Instructions:** ${nextVisitNotes}` : ''}

Please generate a comprehensive clinical visit summary.`;

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
    console.error("Visit summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
