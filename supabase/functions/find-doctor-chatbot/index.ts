import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
    if (match) group.forEach(g => related.add(g));
  }
  return Array.from(related);
}

function formatTime12(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getTodayScheduleFromTimingStr(timing: string | null): string | null {
  if (!timing) return null;
  const today = DAY_NAMES[new Date().getDay()];
  const lines = timing.split("\n");
  const todayLine = lines.find(l => l.startsWith(today));
  if (!todayLine) return null;
  const parts = todayLine.split(": ");
  return parts[1]?.trim() || null;
}

async function searchAllDoctors(
  supabase: any,
  city: string | null,
  specialization: string | null,
  name: string | null,
  limit = 20
) {
  const relatedSpecs = specialization ? getRelatedSpecializations(specialization) : [];

  // --- SEO doctors with clinics data ---
  let seoQuery = supabase
    .from("seo_doctor_listings")
    .select("id, full_name, specialization, city, qualification, experience_years, avatar_url, clinic_name, clinic_location, timing, introduction")
    .eq("is_published", true);

  if (city) seoQuery = seoQuery.ilike("city", city);
  if (name) seoQuery = seoQuery.ilike("full_name", `%${name}%`);
  if (relatedSpecs.length > 1) {
    seoQuery = seoQuery.or(relatedSpecs.map(s => `specialization.ilike.%${s}%`).join(","));
  } else if (specialization) {
    seoQuery = seoQuery.ilike("specialization", `%${specialization}%`);
  }
  seoQuery = seoQuery.order("full_name").limit(limit);
  const { data: seoData } = await seoQuery;

  // Fetch clinic details (fee, timing) for SEO doctors
  const seoIds = (seoData || []).map((d: any) => d.id);
  let clinicsMap: Record<string, any[]> = {};
  if (seoIds.length > 0) {
    const { data: clinicsData } = await supabase
      .from("seo_doctor_clinics")
      .select("doctor_id, clinic_name, clinic_location, fee, timing, map_query")
      .in("doctor_id", seoIds)
      .order("display_order");
    for (const c of clinicsData || []) {
      if (!clinicsMap[c.doctor_id]) clinicsMap[c.doctor_id] = [];
      clinicsMap[c.doctor_id].push(c);
    }
  }

  // --- Registered doctors with schedules ---
  let regQuery = supabase
    .from("doctors")
    .select("id, specialization, city, qualification, experience_years, consultation_fee, introduction, profiles!inner(full_name, avatar_url)")
    .eq("approved", true);

  if (city) regQuery = regQuery.ilike("city", city);
  if (name) regQuery = regQuery.ilike("profiles.full_name", `%${name}%`);
  if (relatedSpecs.length > 1) {
    regQuery = regQuery.or(relatedSpecs.map(s => `specialization.ilike.%${s}%`).join(","));
  } else if (specialization) {
    regQuery = regQuery.ilike("specialization", `%${specialization}%`);
  }
  regQuery = regQuery.limit(limit);
  const { data: regData } = await regQuery;

  // Fetch schedules for registered doctors
  const regIds = (regData || []).map((d: any) => d.id);
  let schedulesMap: Record<string, any[]> = {};
  if (regIds.length > 0) {
    const { data: schedData } = await supabase
      .from("doctor_schedules")
      .select("doctor_id, day_of_week, start_time, end_time, break_start, break_end, is_available")
      .in("doctor_id", regIds)
      .order("day_of_week");
    for (const s of schedData || []) {
      if (!schedulesMap[s.doctor_id]) schedulesMap[s.doctor_id] = [];
      schedulesMap[s.doctor_id].push(s);
    }
  }

  // Build SEO doctor results
  const seoDoctors = (seoData || []).map((d: any) => {
    const clinics = clinicsMap[d.id] || [];
    const primaryClinic = clinics[0];
    const fee = primaryClinic?.fee || null;
    const timing = primaryClinic?.timing || d.timing || null;
    const todayTiming = getTodayScheduleFromTimingStr(timing);

    return {
      id: d.id,
      full_name: d.full_name,
      specialization: d.specialization,
      city: d.city,
      qualification: d.qualification,
      experience_years: d.experience_years,
      avatar_url: d.avatar_url,
      consultation_fee: fee,
      clinic_name: primaryClinic?.clinic_name || d.clinic_name,
      clinic_location: primaryClinic?.clinic_location || d.clinic_location,
      timing: timing,
      today_timing: todayTiming,
      introduction: d.introduction,
      all_clinics: clinics.map((c: any) => ({
        clinic_name: c.clinic_name,
        clinic_location: c.clinic_location,
        fee: c.fee,
        timing: c.timing,
        today_timing: getTodayScheduleFromTimingStr(c.timing),
      })),
      source: "seo",
    };
  });

  // Build registered doctor results
  const registeredDoctors = (regData || []).map((d: any) => {
    const schedules = schedulesMap[d.id] || [];
    const todayDay = new Date().getDay();
    const todaySched = schedules.find((s: any) => s.day_of_week === todayDay);
    let todayTiming: string | null = null;
    let fullTiming: string | null = null;

    if (todaySched) {
      todayTiming = todaySched.is_available
        ? `${formatTime12(todaySched.start_time)} - ${formatTime12(todaySched.end_time)}`
        : "Closed";
    }

    if (schedules.length > 0) {
      fullTiming = schedules.map((s: any) => {
        const day = DAY_NAMES[s.day_of_week];
        if (!s.is_available) return `${day}: Closed`;
        return `${day}: ${formatTime12(s.start_time)} - ${formatTime12(s.end_time)}`;
      }).join("\n");
    }

    return {
      id: d.id,
      full_name: d.profiles?.full_name || "Doctor",
      specialization: d.specialization,
      city: d.city,
      qualification: d.qualification,
      experience_years: d.experience_years,
      avatar_url: d.profiles?.avatar_url,
      consultation_fee: d.consultation_fee,
      introduction: d.introduction,
      timing: fullTiming,
      today_timing: todayTiming,
      all_clinics: [],
      source: "registered",
    };
  });

  // Deduplicate
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
        .from("seo_doctor_listings").select("city").eq("is_published", true).not("city", "is", null);
      if (error) throw error;
      // Also get registered doctor cities
      const { data: regData } = await supabase.from("doctors").select("city").eq("approved", true).not("city", "is", null);
      const allCities = [...(data || []), ...(regData || [])].map((d: any) => d.city).filter(Boolean);
      const uniqueCities = [...new Set(allCities)].sort();
      return new Response(JSON.stringify({ cities: uniqueCities }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_specializations") {
      let query = supabase.from("seo_doctor_listings").select("specialization").eq("is_published", true);
      if (city) query = query.ilike("city", city);
      const { data, error } = await query;
      if (error) throw error;
      let regQuery = supabase.from("doctors").select("specialization").eq("approved", true);
      if (city) regQuery = regQuery.ilike("city", city);
      const { data: regData } = await regQuery;
      const allSpecs = [...(data || []), ...(regData || [])].map((d: any) => d.specialization).filter(Boolean);
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

      // Get available data for AI context
      const { data: availableData } = await supabase
        .from("seo_doctor_listings").select("city, specialization").eq("is_published", true);
      const { data: regAvailable } = await supabase
        .from("doctors").select("city, specialization").eq("approved", true);

      const allData = [...(availableData || []), ...(regAvailable || [])];
      const availableCities = [...new Set(allData.map(d => d.city).filter(Boolean))].sort();
      const availableSpecs = [...new Set(allData.map(d => d.specialization).filter(Boolean))].sort();

      const todayName = DAY_NAMES[new Date().getDay()];

      const systemPrompt = `You are a doctor finder assistant for Zonoir, a healthcare platform in Pakistan.
Users ask you to help find doctors. Extract the intent from their message and return a JSON response.

Today is ${todayName}.

Available cities in our database: ${availableCities.join(", ")}
Available specializations in our database: ${availableSpecs.join(", ")}

IMPORTANT RULES:
1. Match specializations FLEXIBLY:
   - "child specialist/doctor/kids" → "Pediatrician" OR "Pediatric Surgeon"
   - "heart doctor" → "Cardiologist"
   - "skin doctor" → "Dermatologist"
   - "bone doctor" → "Orthopedic Surgeon"
   - "eye doctor" → "Ophthalmologist" OR "Eye Surgeon"
   - "teeth/dental" → "Dentist"
   - "brain doctor" → "Neurologist" OR "Neurosurgeon"
   - "stomach doctor" → "Gastroenterologist"
   - "women doctor" → "Gynecologist"

2. If a user searches by doctor name (e.g., "Dr. Ahmed", "find Dr. Khan"), set doctor_name and leave specialization null.

3. If the user asks about fee, timing, schedule, or availability — still extract the doctor name/specialty/city so we can search. The system will provide the data.

4. If city not in our database, set city to null and mention we don't have doctors there yet.

5. ALWAYS try to extract something useful from every query.

Return ONLY a JSON object:
{
  "city": "<extracted city or null>",
  "specialization": "<EXACT specialization name from our list, or null>",
  "doctor_name": "<extracted doctor name or null>",
  "intent": "<search|fee|timing|info|greeting>",
  "response_text": "<friendly response>"
}

For intent:
- "search" = finding doctors by specialty/city
- "fee" = user asking about consultation fee
- "timing" = user asking about schedule/availability/timing
- "info" = user asking about a specific doctor's details
- "greeting" = just chatting

If greeting, set all search fields to null and guide them to search.`;

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
        parsed = { city: null, specialization: null, doctor_name: null, intent: "greeting", response_text: "I'd be happy to help you find a doctor! Please tell me which city and type of doctor you're looking for." };
      }

      if (parsed.city || parsed.specialization || parsed.doctor_name) {
        const doctors = await searchAllDoctors(supabase, parsed.city, parsed.specialization, parsed.doctor_name, 10);

        // If no results, try broader searches
        if (doctors.length === 0 && parsed.specialization && parsed.city) {
          const withoutCity = await searchAllDoctors(supabase, null, parsed.specialization, parsed.doctor_name, 10);
          if (withoutCity.length > 0) {
            const cities = [...new Set(withoutCity.map(d => d.city).filter(Boolean))];
            return new Response(JSON.stringify({
              response_text: `I couldn't find ${parsed.specialization} doctors in ${parsed.city}, but found some in: ${cities.join(", ")}.`,
              doctors: withoutCity, search_params: parsed, intent: parsed.intent,
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          const cityOnly = await searchAllDoctors(supabase, parsed.city, null, null, 10);
          if (cityOnly.length > 0) {
            const specs = [...new Set(cityOnly.map(d => d.specialization).filter(Boolean))];
            return new Response(JSON.stringify({
              response_text: `I couldn't find "${parsed.specialization}" in ${parsed.city}. Available specialists: ${specs.slice(0, 8).join(", ")}. Would you like to try one?`,
              doctors: [], search_params: parsed, available_specializations: specs, intent: parsed.intent,
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }

        if (doctors.length === 0 && parsed.doctor_name) {
          return new Response(JSON.stringify({
            response_text: `I couldn't find a doctor named "${parsed.doctor_name}". Try:\n• A different spelling\n• Searching by specialization and city instead`,
            doctors: [], search_params: parsed, intent: parsed.intent,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (doctors.length === 0) {
          return new Response(JSON.stringify({
            response_text: parsed.response_text + "\n\nNo matching doctors found. Please try a different city or specialization.",
            doctors: [], search_params: parsed, intent: parsed.intent,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // For fee/timing intents, craft a more specific response
        let responseText = parsed.response_text;
        const intent = parsed.intent || "search";

        if ((intent === "fee" || intent === "timing" || intent === "info") && doctors.length > 0) {
          // AI already gave a nice response, but we'll let the frontend format the details
          if (doctors.length === 1) {
            const doc = doctors[0];
            const parts = [responseText];
            if (intent === "fee" && doc.consultation_fee) {
              parts.push(`\n💰 Consultation fee: **Rs. ${doc.consultation_fee}**`);
            }
            if ((intent === "timing" || intent === "info") && doc.today_timing) {
              parts.push(`\n🕐 Today's timing: **${doc.today_timing}**`);
            }
            if (doc.clinic_name) {
              parts.push(`🏥 ${doc.clinic_name}${doc.clinic_location ? ` — ${doc.clinic_location}` : ""}`);
            }
            responseText = parts.join("\n");
          }
        }

        return new Response(JSON.stringify({
          response_text: responseText,
          doctors, search_params: parsed, intent,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        response_text: parsed.response_text,
        doctors: [], search_params: null, intent: parsed.intent || "greeting",
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
