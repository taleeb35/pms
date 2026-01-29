import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to generate slugs (same logic as frontend)
const generateCitySlug = (city: string): string => {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

const generateSpecialtySlug = (specialty: string): string => {
  return specialty.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

const generateDoctorSlug = (name: string): string => {
  let slug = name.toLowerCase();
  if (!slug.startsWith("dr.") && !slug.startsWith("dr ")) {
    slug = "dr-" + slug;
  }
  return slug.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "";
    
    // Parse doctor profile URL pattern: /doctors/:city/:specialty/:doctorSlug
    const doctorProfileMatch = path.match(/^\/doctors\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
    
    if (!doctorProfileMatch) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [, city, specialty, doctorSlug] = doctorProfileMatch;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let doctorData: any = null;

    // First try SEO listings
    const { data: seoData } = await supabase
      .from("seo_doctor_listings")
      .select("*")
      .eq("is_published", true);

    if (seoData) {
      const matchedSeo = seoData.find((doc: any) => {
        const docCitySlug = generateCitySlug(doc.city || "");
        const docSpecialtySlug = generateSpecialtySlug(doc.specialization || "");
        const docNameSlug = generateDoctorSlug(doc.full_name || "");
        return docCitySlug === city && docSpecialtySlug === specialty && docNameSlug === doctorSlug;
      });

      if (matchedSeo) {
        doctorData = {
          full_name: matchedSeo.full_name,
          specialization: matchedSeo.specialization,
          qualification: matchedSeo.qualification,
          city: matchedSeo.city || "",
          experience_years: matchedSeo.experience_years,
          introduction: matchedSeo.introduction,
          avatar_url: matchedSeo.avatar_url,
          clinic_name: matchedSeo.clinic_name,
          clinic_location: matchedSeo.clinic_location,
        };
      }
    }

    // If not found in SEO listings, try approved doctors
    if (!doctorData) {
      const { data: doctorsData } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          qualification,
          city,
          experience_years,
          introduction,
          consultation_fee,
          profiles!inner(full_name, avatar_url)
        `)
        .eq("approved", true);

      if (doctorsData) {
        const matchedDoctor = doctorsData.find((doc: any) => {
          const profile = doc.profiles;
          const docCitySlug = generateCitySlug(doc.city || "");
          const docSpecialtySlug = generateSpecialtySlug(doc.specialization || "");
          const docNameSlug = generateDoctorSlug(profile?.full_name || "");
          return docCitySlug === city && docSpecialtySlug === specialty && docNameSlug === doctorSlug;
        });

        if (matchedDoctor) {
          const profile = matchedDoctor.profiles as any;
          doctorData = {
            full_name: profile?.full_name || "",
            specialization: matchedDoctor.specialization,
            qualification: matchedDoctor.qualification,
            city: matchedDoctor.city || "",
            experience_years: matchedDoctor.experience_years,
            introduction: matchedDoctor.introduction,
            avatar_url: profile?.avatar_url,
          };
        }
      }
    }

    if (!doctorData) {
      return new Response(JSON.stringify({ error: "Doctor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate SEO meta tags
    const pageTitle = `${doctorData.full_name} - ${doctorData.specialization}${doctorData.clinic_name ? ` at ${doctorData.clinic_name}` : ""}, ${doctorData.city} | Zonoir`;
    
    const pageDescription = `${doctorData.full_name} is a ${doctorData.specialization} in ${doctorData.city}. ${doctorData.qualification}. ${doctorData.experience_years ? `${doctorData.experience_years}+ years experience.` : ""} ${doctorData.clinic_name ? `Available at ${doctorData.clinic_name}.` : ""} Book appointment now.`;
    
    const canonicalUrl = `https://zonoir.com/doctors/${city}/${specialty}/${doctorSlug}`;
    const ogImage = doctorData.avatar_url || "https://zonoir.com/og-image.png";

    const keywords = `${doctorData.full_name}, ${doctorData.specialization}, ${doctorData.city}, doctor in ${doctorData.city}, best ${doctorData.specialization} ${doctorData.city}, book appointment ${doctorData.city}, ${doctorData.qualification}`;

    // JSON-LD Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Physician",
      "name": doctorData.full_name,
      "description": doctorData.introduction || pageDescription,
      "image": doctorData.avatar_url || undefined,
      "medicalSpecialty": doctorData.specialization,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": doctorData.city,
        "addressCountry": "Pakistan",
        "streetAddress": doctorData.clinic_location || undefined
      },
      "worksFor": doctorData.clinic_name ? {
        "@type": "MedicalClinic",
        "name": doctorData.clinic_name,
        "address": doctorData.clinic_location
      } : undefined,
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "degree",
        "name": doctorData.qualification
      }
    };

    const metaTags = {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
      canonical: canonicalUrl,
      og: {
        title: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        type: "profile",
        image: ogImage,
        site_name: "Zonoir",
        locale: "en_PK"
      },
      twitter: {
        card: "summary_large_image",
        site: "@zonoir",
        title: pageTitle,
        description: pageDescription,
        image: ogImage
      },
      jsonLd: jsonLd
    };

    return new Response(JSON.stringify(metaTags), {
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
