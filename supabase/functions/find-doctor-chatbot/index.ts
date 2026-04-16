import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Related specialty groups for fuzzy matching
const SPECIALTY_GROUPS: Record<string, string[]> = {
  "pediatric": ["Pediatrician", "Pediatric Surgeon", "Child Specialist"],
  "heart": ["Cardiologist", "Interventional Cardiologist", "Cardiac Surgeon"],
  "skin": ["Dermatologist", "Aesthetic Physician"],
  "bone": ["Orthopedic Surgeon", "Sports Medicine Specialist", "Physiotherapist"],
  "eye": ["Ophthalmologist", "Eye Surgeon", "Optometrist"],
  "brain": ["Neurologist", "Neurosurgeon", "Psychiatrist"],
  "stomach": ["Gastroenterologist", "Liver Specialist"],
  "kidney": ["Nephrologist", "Urologist"],
  "lung": ["Pulmonologist", "Chest Respiratory Specialist"],
  "cancer": ["Oncologist", "Cancer Surgeon"],
  "women": ["Gynecologist", "Obstetrician"],
  "ent": ["ENT Specialist", "Audiologist"],
  "surgery": ["General Surgeon", "Laparoscopic Surgeon", "Vascular Surgeon"],
  "teeth": ["Dentist", "Oral and Maxillofacial Surgeon"],
  "mental": ["Psychiatrist", "Psychologist"],
  "weight": ["Bariatric / Weight Loss Surgeon", "Clinical Nutritionist", "Nutritionist"],
};

function getRelatedSpecializations(spec: string): string[] {
  const lower = spec.toLowerCase();
  const related: Set<string> = new Set();
  related.add(spec);
  
  for (const [, group] of Object.entries(SPECIALTY_GROUPS)) {
    const match = group.some(g => 
      g.toLowerCase().includes(lower) || lower.includes(g.toLowerCase()) ||
      g.toLowerCase().split(/\s+/).some(w => lower.includes(w)) ||
      lower.split(/\s+/).some(w => w.length > 3 && g.toLowerCase().includes(w))
    );
    if (match) {
      group.forEach(g => related.add(g));
    }
  }
  return Array.from(related);
}

async function searchAllDoctors(
  supabase: any,
  city: string | null,
  specialization: string | null,
  name: string | null,
  limit = 20
) {
  // Build flexible specialization search
  const relatedSpecs = specialization ? getRelatedSpecializations(specialization) : [];

  // SEO doctors search
  let seoQuery = supabase
    .from("seo_doctor_listings")
    .select("id, full_name, specialization, city, qualification, experience_years, avatar_url, clinic_name, clinic_location")
    .eq("is_published", true);

  if (city) seoQuery = seoQuery.ilike("city", city);
  if (name) seoQuery = seoQuery.ilike("full_name", `%${name}%`);
  
  // For specialization, use OR filter for all related specialties
  if (relatedSpecs.length > 1) {
    const orFilter = relatedSpecs.map(s => `specialization.ilike.%${s}%`).join(",");
    seoQuery = seoQuery.or(orFilter);
  } else if (specialization) {
    // Also do partial match
    seoQuery = seoQuery.ilike("specialization", `%${specialization}%`);
  }

  seoQuery = seoQuery.order("full_name").limit(limit);
  const { data: seoData } = await seoQuery;

  // Registered doctors search
  let regQuery = supabase
    .from("doctors")
    .select("id, specialization, city, qualification, experience_years, consultation_fee, profiles!inner(full_name, avatar_url)")
    .eq("approved", true);

  if (city) regQuery = regQuery.ilike("city", city);
  if (name) regQuery = regQuery.ilike("profiles.full_name", `%${name}%`);
  
  if (relatedSpecs.length > 1) {
    const orFilter = relatedSpecs.map(s => `specialization.ilike.%${s}%`).join(",");
    regQuery = regQuery.or(orFilter);
  } else if (specialization) {
    regQuery = regQuery.ilike("specialization", `%${specialization}%`);
  }

  regQuery = regQuery.limit(limit);
  const { data: regData } = await regQuery;

  const seoDoctors = (seoData || []).map((d: any) => ({ ...d, source: "seo" }));
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

  // Deduplicate by name
  const all = [...seoDoctors, ...registeredDoctors];
  const seen = new Set<string>();
  return all.filter(d => {
    const key = d.full_name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, city, specialization, name } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "get_cities") {
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
      let query = supabase.from("seo_doctor_listings").select("specialization").eq("is_published", true);
      if (city) query = query.ilike("city", city);
      const { data, error } = await query;
      if (error) throw error;

      // Also get from registered doctors
      let regQuery = supabase.from("doctors").select("specialization").eq("approved", true);
      if (city) regQuery = regQuery.ilike("city", city);
      const { data: regData } = await regQuery;

      const allSpecs = [
        ...(data || []).map((d: any) => d.specialization),
        ...(regData || []).map((d: any) => d.specialization),
      ].filter(Boolean);
      
      const uniqueSpecs = [...new Set(allSpecs)].sort();
      return new Response(JSON.stringify({ specializations: uniqueSpecs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search_doctors") {
      const doctors = await searchAllDoctors(supabase, city, specialization, name);
      return new Response(JSON.stringify({ doctors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "ai_search") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userMessage = name || "";

      // First get all available specializations and cities for context
      const { data: availableData } = await supabase
        .from("seo_doctor_listings")
        .select("city, specialization")
        .eq("is_published", true);
      
      const { data: regAvailable } = await supabase
        .from("doctors")
        .select("city, specialization")
        .eq("approved", true);

      const allData = [...(availableData || []), ...(regAvailable || [])];
      const availableCities = [...new Set(allData.map(d => d.city).filter(Boolean))].sort();
      const availableSpecs = [...new Set(allData.map(d => d.specialization).filter(Boolean))].sort();

      const systemPrompt = `You are a doctor finder assistant for Zonoir, a healthcare platform in Pakistan.
Users ask you to help find doctors. Extract the intent from their message and return a JSON response.

Available cities in our database: ${availableCities.join(", ")}

Available specializations in our database: ${availableSpecs.join(", ")}

IMPORTANT RULES:
1. Match specializations FLEXIBLY. Map common terms to the closest available specialization:
   - "child specialist", "child doctor", "kids doctor" → "Pediatrician" OR "Pediatric Surgeon"
   - "heart doctor" → "Cardiologist" OR "Interventional Cardiologist"  
   - "skin doctor" → "Dermatologist"
   - "bone doctor" → "Orthopedic Surgeon"
   - "eye doctor" → "Ophthalmologist" OR "Eye Surgeon"
   - "teeth doctor" → "Dentist"
   - "brain doctor" → "Neurologist" OR "Neurosurgeon"
   - "stomach doctor" → "Gastroenterologist"
   
2. If a user searches by doctor name (e.g., "Dr. Ahmed", "find Dr. Khan"), set doctor_name field and leave specialization null.

3. If the user mentions a city not in our database, set city to null and mention in response that we don't have doctors in that city yet.

4. ALWAYS try to extract SOMETHING useful from the query. Even partial matches help.

Based on the user's message, return ONLY a JSON object:
{
  "city": "<extracted city or null>",
  "specialization": "<the EXACT specialization name from our available list that best matches, or null>",
  "doctor_name": "<extracted doctor name or null>",
  "response_text": "<friendly response to show the user>"
}

If the user is just chatting or greeting, set all search fields to null and provide a friendly response guiding them to find a doctor.`;

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

      // Search if we have any params
      if (parsed.city || parsed.specialization || parsed.doctor_name) {
        const doctors = await searchAllDoctors(supabase, parsed.city, parsed.specialization, parsed.doctor_name, 10);

        // If no results with specialization, try broader search (city only or name only)
        if (doctors.length === 0 && parsed.specialization && parsed.city) {
          // Try without city restriction
          const withoutCity = await searchAllDoctors(supabase, null, parsed.specialization, parsed.doctor_name, 10);
          if (withoutCity.length > 0) {
            const cities = [...new Set(withoutCity.map(d => d.city).filter(Boolean))];
            return new Response(JSON.stringify({
              response_text: `I couldn't find ${parsed.specialization} doctors in ${parsed.city}, but I found some in other cities: ${cities.join(", ")}. Here are the results:`,
              doctors: withoutCity,
              search_params: parsed,
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          
          // Try without specialization - show available specializations in that city
          const cityOnly = await searchAllDoctors(supabase, parsed.city, null, null, 10);
          if (cityOnly.length > 0) {
            const specs = [...new Set(cityOnly.map(d => d.specialization).filter(Boolean))];
            return new Response(JSON.stringify({
              response_text: `I couldn't find "${parsed.specialization}" in ${parsed.city}. But we have these specialists available: ${specs.slice(0, 8).join(", ")}. Would you like to try one of these?`,
              doctors: [],
              search_params: parsed,
              available_specializations: specs,
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }

        // If still no results with name search, be helpful
        if (doctors.length === 0 && parsed.doctor_name) {
          return new Response(JSON.stringify({
            response_text: `I couldn't find a doctor named "${parsed.doctor_name}" in our directory. You can try:\n• A different spelling of the name\n• Searching by specialization and city instead`,
            doctors: [],
            search_params: parsed,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (doctors.length === 0) {
          return new Response(JSON.stringify({
            response_text: parsed.response_text + "\n\nUnfortunately, I couldn't find matching doctors right now. Please try a different city or specialization.",
            doctors: [],
            search_params: parsed,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({
          response_text: parsed.response_text,
          doctors,
          search_params: parsed,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        response_text: parsed.response_text,
        doctors: [],
        search_params: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
