import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://zonoir.com"; // WordPress marketing site
// Doctor pages, Find Doctors and the knowledge base only exist on the app subdomain.
const APP_URL = "https://app.zonoir.com";

// Helper to generate slugs (same logic as frontend)
const generateCitySlug = (city: string): string => {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

const generateSpecialtySlug = (specialty: string): string => {
  return specialty.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

const generateDoctorSlug = (name: string): string => {
  // Same as the app (src/lib/slugUtils.ts) so sitemap links match the profile pages.
  return (name || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
};

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

    // ============ APP PAGES ============
    // app.zonoir.com only lists its own public pages: the help centre. Marketing, city and
    // doctor-listing pages were removed (19 Nov 2026); the marketing site is zonoir.com.
    sitemap += `  <url>
    <loc>${APP_URL}/knowledge-base</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // ============ KNOWLEDGE BASE ARTICLES ============
    const knowledgeBaseArticles = [
      // Getting Started
      "clinic-signup", "add-doctors", "dashboard-overview",
      "reset-password", "login-portals", "free-trial",
      // For Clinics
      "manage-receptionists", "specializations", "clinic-profile",
      "activity-logs", "doctor-limits", "clinic-reports", "clinical-catalogs",
      // For Doctors
      "doctor-schedule", "prescription-templates", "visit-records",
      "weekly-availability", "manage-leaves", "public-doctor-profile",
      "doctor-faqs", "doctor-reports",
      // Patient Management
      "add-patients", "medical-records", "patient-history",
      "import-export-patients", "visit-timeline", "pregnancy-tracking",
      "duplicate-patients",
      // Appointments
      "book-appointments", "walk-ins", "appointment-calendar",
      "appointment-slots", "appointment-statuses", "online-booking",
      // Billing & Payments
      "subscription", "payment-tracking", "expenses",
      "net-profit", "monthly-vs-yearly", "financial-reports",
      // AI Features
      "ai-prescription", "ai-visit-summary", "ai-revenue-forecast",
      "ai-patient-insights", "ai-doctor-finder",
      // Video Consultations
      "video-setup", "video-doctor", "video-patient", "video-best-practices",
      // Mobile App
      "install-pwa", "mobile-overview", "mobile-doctor-tips",
      // Reports & Analytics
      "analytics-dashboard", "peak-hour-heatmaps", "profit-loss-trend",
      "doctor-performance-scorecard", "revenue-trend", "expense-categories",
      "patient-demographics", "new-vs-returning", "appointment-status-breakdown",
      "new-vs-followup", "patient-dropoff", "top-cities", "quick-stats",
      "ai-forecast-reports", "report-date-filters", "print-export-reports",
      // Security & Compliance
      "data-protection", "roles-permissions", "backups-recovery", "hipaa-gdpr",
    ];

    for (const article of knowledgeBaseArticles) {
      sitemap += `  <url>
    <loc>${APP_URL}/knowledge-base/${article}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
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
