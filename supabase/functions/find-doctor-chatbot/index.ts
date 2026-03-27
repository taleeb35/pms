import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, city, specialization, name } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "get_cities") {
      // Return distinct cities from seo_doctor_listings
      const { data, error } = await supabase
        .from("seo_doctor_listings")
        .select("city")
        .eq("is_published", true)
        .not("city", "is", null);

      if (error) throw error;

      const uniqueCities = [...new Set((data || []).map((d: any) => d.city).filter(Boolean))].sort();
      return new Response(JSON.stringify({ cities: uniqueCities }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_specializations") {
      // Return distinct specializations, optionally filtered by city
      let query = supabase
        .from("seo_doctor_listings")
        .select("specialization")
        .eq("is_published", true);

      if (city) {
        query = query.ilike("city", city);
      }

      const { data, error } = await query;
      if (error) throw error;

      const uniqueSpecs = [...new Set((data || []).map((d: any) => d.specialization).filter(Boolean))].sort();
      return new Response(JSON.stringify({ specializations: uniqueSpecs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search_doctors") {
      let query = supabase
        .from("seo_doctor_listings")
        .select("id, full_name, specialization, city, qualification, experience_years, avatar_url, clinic_name, clinic_location")
        .eq("is_published", true);

      if (city) query = query.ilike("city", city);
      if (specialization) query = query.ilike("specialization", specialization);
      if (name) query = query.ilike("full_name", `%${name}%`);

      query = query.order("full_name").limit(20);

      const { data, error } = await query;
      if (error) throw error;

      // Also search registered doctors
      let regQuery = supabase
        .from("doctors")
        .select("id, specialization, city, qualification, experience_years, consultation_fee, profiles!inner(full_name, avatar_url)")
        .eq("approved", true);

      if (city) regQuery = regQuery.ilike("city", city);
      if (specialization) regQuery = regQuery.ilike("specialization", specialization);
      if (name) regQuery = regQuery.ilike("profiles.full_name", `%${name}%`);

      regQuery = regQuery.limit(20);

      const { data: regData } = await regQuery;

      const seoDoctors = (data || []).map((d: any) => ({
        ...d,
        source: "seo",
      }));

      const registeredDoctors = (regData || []).map((d: any) => ({
        id: d.id,
        full_name: d.profiles?.full_name || "Doctor",
        specialization: d.specialization,
        city: d.city,
        qualification: d.qualification,
        experience_years: d.experience_years,
        avatar_url: d.profiles?.avatar_url,
        consultation_fee: d.consultation_fee,
        source: "registered",
      }));

      // Merge and deduplicate by name
      const allDoctors = [...seoDoctors, ...registeredDoctors];
      const seen = new Set<string>();
      const unique = allDoctors.filter(d => {
        const key = d.full_name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return new Response(JSON.stringify({ doctors: unique.slice(0, 20) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AI-powered natural language search
    if (action === "ai_search") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userMessage = name || "";

      const systemPrompt = `You are a doctor finder assistant for a healthcare platform in Pakistan. 
Users ask you to help find doctors. Extract the intent from their message and return a JSON response.

Available cities: Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala, Hyderabad, Bahawalpur, Sargodha, Sukkur, Abbottabad

Available specializations: Aesthetic Physician, Allergist, Audiologist, Bariatric / Weight Loss Surgeon, Cancer Surgeon, Cardiologist, Chest Respiratory Specialist, Clinical Nutritionist, Dentist, Dermatologist, Endocrinologist, ENT Specialist, Eye Surgeon, Family Medicine, Gastroenterologist, General Physician, General Practitioner, General Surgeon, Geriatrician, Gynecologist, Hematologist, Infectious Disease Specialist, Internal Medicine Specialist, Interventional Cardiologist, Laparoscopic Surgeon, Liver Specialist, Medical Specialist, Nephrologist, Neurologist, Neurosurgeon, Nutritionist, Oncologist, Ophthalmologist, Optometrist, Oral and Maxillofacial Surgeon, Orthopedic Surgeon, Pain Management Specialist, Pediatric Surgeon, Pediatrician, Physiotherapist, Plastic Surgeon, Psychiatrist, Psychologist, Pulmonologist, Radiologist, Rheumatologist, Speech Therapist, Sports Medicine Specialist, Urologist, Vascular Surgeon

Based on the user's message, return ONLY a JSON object:
{
  "city": "<extracted city or null>",
  "specialization": "<extracted specialization or null>", 
  "doctor_name": "<extracted doctor name or null>",
  "response_text": "<friendly response to show the user>"
}

If the user is just chatting or greeting, set all search fields to null and provide a friendly response guiding them to find a doctor.
Match specializations flexibly (e.g., "heart doctor" = "Cardiologist", "skin doctor" = "Dermatologist", "bone doctor" = "Orthopedic Surgeon", "child specialist" = "Pediatrician", "eye doctor" = "Ophthalmologist").`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI request failed");
      }

      const aiData = await aiResponse.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { city: null, specialization: null, doctor_name: null, response_text: "I'd be happy to help you find a doctor! Please tell me which city and type of doctor you're looking for." };
      }

      // If we got search params, do the actual search
      if (parsed.city || parsed.specialization || parsed.doctor_name) {
        let searchQuery = supabase
          .from("seo_doctor_listings")
          .select("id, full_name, specialization, city, qualification, experience_years, avatar_url, clinic_name")
          .eq("is_published", true);

        if (parsed.city) searchQuery = searchQuery.ilike("city", parsed.city);
        if (parsed.specialization) searchQuery = searchQuery.ilike("specialization", `%${parsed.specialization}%`);
        if (parsed.doctor_name) searchQuery = searchQuery.ilike("full_name", `%${parsed.doctor_name}%`);

        const { data: searchResults } = await searchQuery.limit(10);

        // Also check registered doctors
        let regSearch = supabase
          .from("doctors")
          .select("id, specialization, city, qualification, experience_years, consultation_fee, profiles!inner(full_name, avatar_url)")
          .eq("approved", true);

        if (parsed.city) regSearch = regSearch.ilike("city", parsed.city);
        if (parsed.specialization) regSearch = regSearch.ilike("specialization", `%${parsed.specialization}%`);
        if (parsed.doctor_name) regSearch = regSearch.ilike("profiles.full_name", `%${parsed.doctor_name}%`);

        const { data: regResults } = await regSearch.limit(10);

        const allResults = [
          ...(searchResults || []).map((d: any) => ({ ...d, source: "seo" })),
          ...(regResults || []).map((d: any) => ({
            id: d.id,
            full_name: d.profiles?.full_name || "Doctor",
            specialization: d.specialization,
            city: d.city,
            qualification: d.qualification,
            experience_years: d.experience_years,
            avatar_url: d.profiles?.avatar_url,
            consultation_fee: d.consultation_fee,
            source: "registered",
          })),
        ];

        // Deduplicate
        const seen = new Set<string>();
        const unique = allResults.filter(d => {
          const key = d.full_name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        return new Response(JSON.stringify({
          response_text: parsed.response_text,
          doctors: unique.slice(0, 10),
          search_params: { city: parsed.city, specialization: parsed.specialization, doctor_name: parsed.doctor_name },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        response_text: parsed.response_text,
        doctors: [],
        search_params: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Doctor finder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
