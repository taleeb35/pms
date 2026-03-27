import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { patientId } = await req.json();
    if (!patientId) {
      return new Response(JSON.stringify({ error: "patientId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Fetch patient data
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();

    if (patientError || !patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch visit history (appointments with details)
    const { data: appointments } = await supabase
      .from("appointments")
      .select("*, doctors(id, specialization)")
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: false })
      .limit(50);

    // Fetch medical records
    const { data: medicalRecords } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("visit_date", { ascending: false })
      .limit(30);

    // Fetch prescriptions
    const { data: prescriptions } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(50);

    // Calculate age
    const birthDate = new Date(patient.date_of_birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Build visit summary for AI
    const visitSummaries = (appointments || []).map((a: any) => {
      return `- ${a.appointment_date}: ${a.status || 'unknown'} | Complaint: ${a.reason || 'N/A'} | Notes: ${a.notes || 'N/A'} | Fee: ${a.total_fee || a.consultation_fee || 'N/A'}`;
    }).join("\n");

    const medicalSummaries = (medicalRecords || []).map((r: any) => {
      const vitals = r.vital_signs ? JSON.stringify(r.vital_signs) : 'N/A';
      return `- ${r.visit_date}: Symptoms: ${r.symptoms || 'N/A'} | Diagnosis: ${r.diagnosis || 'N/A'} | Vitals: ${vitals} | Tests: ${r.test_results || 'N/A'}`;
    }).join("\n");

    const prescriptionSummaries = (prescriptions || []).map((p: any) => {
      return `- ${p.created_at?.split('T')[0]}: ${p.medication_name} ${p.dosage} ${p.frequency} for ${p.duration} ${p.instructions ? '(' + p.instructions + ')' : ''}`;
    }).join("\n");

    const systemPrompt = `You are an expert clinical data analyst generating patient insights for doctors in Pakistan. 

IMPORTANT RULES:
- Analyze ALL provided data to generate actionable clinical insights
- Use clear sections with markdown headers and bullet points
- Highlight concerning trends or risk factors with ⚠️
- Use ✅ for positive findings
- Use 📊 for trend analysis
- Use 💊 for medication insights
- Use 🔄 for visit pattern analysis
- Be concise but thorough — aim for 300-400 words
- Do NOT invent data — only analyze what is provided
- If insufficient data, mention what's missing and what would be helpful
- Tailor insights to the patient's age, gender, and medical profile
- Include actionable recommendations at the end`;

    const userPrompt = `Generate comprehensive clinical insights for this patient:

**PATIENT PROFILE:**
- Name: ${patient.full_name}
- Age: ${age} years | Gender: ${patient.gender}
- Blood Group: ${patient.blood_group || 'Unknown'}
- Allergies: ${patient.allergies || 'None reported'}
- Chronic Conditions: ${patient.major_diseases || 'None reported'}
- Medical History: ${patient.medical_history || 'None recorded'}

**VISIT HISTORY (${(appointments || []).length} visits):**
${visitSummaries || 'No visits recorded'}

**MEDICAL RECORDS:**
${medicalSummaries || 'No medical records'}

**PRESCRIPTION HISTORY:**
${prescriptionSummaries || 'No prescriptions'}

Please analyze and provide:
1. 📊 **Health Trends** — vital signs trends, weight changes, recurring complaints
2. ⚠️ **Risk Alerts** — drug interactions, missed follow-ups, worsening patterns
3. 🔄 **Visit Patterns** — frequency, compliance, no-shows
4. 💊 **Medication Review** — ongoing vs discontinued, polypharmacy risks
5. 🩺 **Clinical Recommendations** — proactive suggestions based on the full picture`;

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
    console.error("Patient insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
