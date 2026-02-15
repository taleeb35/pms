import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://zonoir.com";

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

const today = new Date().toISOString().split('T')[0];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // ============ STATIC PAGES ============
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/features", priority: "0.9", changefreq: "monthly" },
      { loc: "/pricing", priority: "0.9", changefreq: "monthly" },
      { loc: "/contact", priority: "0.8", changefreq: "monthly" },
      { loc: "/reviews", priority: "0.8", changefreq: "weekly" },
      { loc: "/find-doctors", priority: "0.9", changefreq: "daily" },
      { loc: "/referral-program", priority: "0.7", changefreq: "monthly" },
      { loc: "/knowledge-base", priority: "0.8", changefreq: "weekly" },
      { loc: "/blog", priority: "0.8", changefreq: "weekly" },
      { loc: "/privacy-policy", priority: "0.5", changefreq: "monthly" },
      { loc: "/terms-of-service", priority: "0.5", changefreq: "monthly" },
    ];

    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // ============ CITY LANDING PAGES ============
    const cities = [
      "lahore", "karachi", "islamabad", "rawalpindi", "faisalabad",
      "multan", "peshawar", "quetta", "sialkot", "gujranwala",
      "hyderabad", "bahawalpur", "sargodha", "sukkur", "abbottabad"
    ];

    for (const city of cities) {
      sitemap += `  <url>
    <loc>${BASE_URL}/emr-software-for-doctors-in-${city}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    }

    // ============ KNOWLEDGE BASE ARTICLES ============
    const knowledgeBaseArticles = [
      "clinic-signup", "doctor-signup", "dashboard-overview",
      "add-doctors", "manage-receptionists", "specializations",
      "doctor-schedule", "prescription-templates", "visit-records",
      "add-patients", "medical-records", "patient-history",
      "book-appointments", "walk-ins", "appointment-calendar",
      "subscription", "payment-tracking", "expenses"
    ];

    for (const article of knowledgeBaseArticles) {
      sitemap += `  <url>
    <loc>${BASE_URL}/knowledge-base/${article}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // ============ SPECIALTY PAGES ============
    const specialties = [
      "general-physician", "gynecologist", "dermatologist", "pediatrician",
      "cardiologist", "orthopedic-surgeon", "ent-specialist", "neurologist",
      "psychiatrist", "urologist", "gastroenterologist", "pulmonologist",
      "endocrinologist", "nephrologist", "oncologist", "rheumatologist",
      "ophthalmologist", "dentist", "plastic-surgeon", "neurosurgeon",
      "general-surgeon", "vascular-surgeon", "infectious-disease-specialist",
      "allergist", "pain-management-specialist", "sexologist", "nutritionist",
      "physiotherapist", "psychologist", "homeopath", "diabetologist"
    ];

    for (const specialty of specialties) {
      sitemap += `  <url>
    <loc>${BASE_URL}/doctors/${specialty}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // ============ BLOG POSTS ============
    const { data: blogPosts } = await supabase
      .from("blogs")
      .select("slug, updated_at")
      .eq("status", "published");

    if (blogPosts) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at ? post.updated_at.split('T')[0] : today;
        sitemap += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // ============ DOCTOR PROFILE PAGES FROM SEO LISTINGS ============
    const { data: seoListings } = await supabase
      .from("seo_doctor_listings")
      .select("full_name, specialization, city, updated_at")
      .eq("is_published", true);

    if (seoListings) {
      for (const doc of seoListings) {
        if (!doc.city || !doc.specialization || !doc.full_name) continue;
        
        const citySlug = generateCitySlug(doc.city);
        const specialtySlug = generateSpecialtySlug(doc.specialization);
        const doctorSlug = generateDoctorSlug(doc.full_name);
        const lastmod = doc.updated_at ? doc.updated_at.split('T')[0] : today;

        sitemap += `  <url>
    <loc>${BASE_URL}/doctors/${citySlug}/${specialtySlug}/${doctorSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // ============ DOCTOR PROFILE PAGES FROM APPROVED DOCTORS ============
    const { data: approvedDoctors } = await supabase
      .from("doctors")
      .select(`
        specialization,
        city,
        updated_at,
        profiles!inner(full_name)
      `)
      .eq("approved", true);

    if (approvedDoctors) {
      // Create a set to track already added URLs (avoid duplicates with SEO listings)
      const addedUrls = new Set(
        seoListings?.map(doc => {
          if (!doc.city || !doc.specialization || !doc.full_name) return '';
          return `${generateCitySlug(doc.city)}/${generateSpecialtySlug(doc.specialization)}/${generateDoctorSlug(doc.full_name)}`;
        }).filter(Boolean) || []
      );

      for (const doc of approvedDoctors) {
        if (!doc.city || !doc.specialization) continue;
        
        const profile = doc.profiles as unknown as { full_name: string };
        if (!profile?.full_name) continue;

        const citySlug = generateCitySlug(doc.city);
        const specialtySlug = generateSpecialtySlug(doc.specialization);
        const doctorSlug = generateDoctorSlug(profile.full_name);
        const urlKey = `${citySlug}/${specialtySlug}/${doctorSlug}`;

        // Skip if already added from SEO listings
        if (addedUrls.has(urlKey)) continue;

        const lastmod = doc.updated_at ? doc.updated_at.split('T')[0] : today;

        sitemap += `  <url>
    <loc>${BASE_URL}/doctors/${citySlug}/${specialtySlug}/${doctorSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: unknown) {
    console.error("Error generating sitemap:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><error>${errorMessage}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
