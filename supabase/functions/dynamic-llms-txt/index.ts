import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://zonoir.com";

const generateCitySlug = (city: string): string =>
  city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const generateSpecialtySlug = (specialty: string): string =>
  specialty.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let output = `# Zonoir

> Zonoir is Pakistan's leading EMR (Electronic Medical Record) and clinic management platform. It helps doctors, clinics, and healthcare providers digitize their practice with appointment scheduling, patient records, prescriptions, billing, and more.

## About

Zonoir provides a comprehensive healthcare management solution designed specifically for doctors and clinics in Pakistan. The platform offers EMR software, appointment booking, patient management, visit records, prescription templates, financial tracking, and public doctor profiles for patient discovery.

## Key Features

- **EMR Software**: Digital patient records, visit history, prescriptions, and medical documents
- **Appointment Management**: Online booking, walk-ins, waitlist, and calendar views
- **Clinic Management**: Multi-doctor support, receptionist access, specializations, and expenses tracking
- **Doctor Profiles**: Public searchable profiles with qualifications, schedule, and clinic locations
- **Billing & Finance**: Consultation fees, procedure fees, invoices, and payment tracking
- **Patient Portal**: Patient search, medical history, allergies, and document uploads

## Public Pages

- [Home](${BASE_URL}/)
- [Features](${BASE_URL}/features)
- [Pricing](${BASE_URL}/pricing)
- [Find Doctors](${BASE_URL}/find-doctors)
- [Blog](${BASE_URL}/blog)
- [Contact](${BASE_URL}/contact)
- [Reviews](${BASE_URL}/reviews)
- [Knowledge Base](${BASE_URL}/knowledge-base)
- [Referral Program](${BASE_URL}/referral-program)
- [Privacy Policy](${BASE_URL}/privacy-policy)
- [Terms of Service](${BASE_URL}/terms-of-service)

## Doctor Discovery by Specialty

`;

    const specialties = [
      "General Physician", "Gynecologist", "Dermatologist", "Pediatrician",
      "Cardiologist", "Orthopedic Surgeon", "ENT Specialist", "Neurologist",
      "Psychiatrist", "Urologist", "Gastroenterologist", "Pulmonologist",
      "Endocrinologist", "Nephrologist", "Oncologist", "Rheumatologist",
      "Ophthalmologist", "Dentist", "Plastic Surgeon", "Neurosurgeon",
      "General Surgeon", "Vascular Surgeon", "Infectious Disease Specialist",
      "Allergist", "Pain Management Specialist", "Sexologist", "Nutritionist",
      "Physiotherapist", "Psychologist", "Homeopath", "Diabetologist",
      "Hematologist", "Family Medicine"
    ];

    for (const s of specialties) {
      output += `- [${s}](${BASE_URL}/doctors/${generateSpecialtySlug(s)})\n`;
    }

    // City pages
    output += `\n## EMR Software by City\n\n`;
    const cities = [
      "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
      "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
      "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Abbottabad"
    ];
    for (const city of cities) {
      output += `- [${city}](${BASE_URL}/emr-software-for-doctors-in-${generateCitySlug(city)})\n`;
    }

    // Knowledge base
    output += `\n## Knowledge Base Articles\n\n`;
    const kbArticles = [
      { slug: "clinic-signup", title: "Clinic Signup" },
      { slug: "doctor-signup", title: "Doctor Signup" },
      { slug: "dashboard-overview", title: "Dashboard Overview" },
      { slug: "add-doctors", title: "Add Doctors" },
      { slug: "manage-receptionists", title: "Manage Receptionists" },
      { slug: "specializations", title: "Specializations" },
      { slug: "doctor-schedule", title: "Doctor Schedule" },
      { slug: "prescription-templates", title: "Prescription Templates" },
      { slug: "visit-records", title: "Visit Records" },
      { slug: "add-patients", title: "Add Patients" },
      { slug: "medical-records", title: "Medical Records" },
      { slug: "patient-history", title: "Patient History" },
      { slug: "book-appointments", title: "Book Appointments" },
      { slug: "walk-ins", title: "Walk-Ins" },
      { slug: "appointment-calendar", title: "Appointment Calendar" },
      { slug: "subscription", title: "Subscription" },
      { slug: "payment-tracking", title: "Payment Tracking" },
      { slug: "expenses", title: "Expenses" },
    ];
    for (const a of kbArticles) {
      output += `- [${a.title}](${BASE_URL}/knowledge-base/${a.slug})\n`;
    }

    // Blog posts
    const { data: blogPosts } = await supabase
      .from("blogs")
      .select("slug, title")
      .eq("status", "published");

    if (blogPosts && blogPosts.length > 0) {
      output += `\n## Blog Posts\n\n`;
      for (const post of blogPosts) {
        output += `- [${post.title}](${BASE_URL}/blog/${post.slug})\n`;
      }
    }

    // Doctor profiles from SEO listings
    const { data: seoListings } = await supabase
      .from("seo_doctor_listings")
      .select("full_name, specialization, city, qualification, experience_years")
      .eq("is_published", true);

    // Doctor profiles from approved doctors
    const { data: approvedDoctors } = await supabase
      .from("doctors")
      .select(`
        specialization,
        city,
        qualification,
        experience_years,
        profiles!inner(full_name)
      `)
      .eq("approved", true);

    // Combine all doctors, deduplicate
    const addedUrls = new Set<string>();
    const allDoctors: Array<{
      name: string;
      specialization: string;
      city: string;
      qualification: string;
      url: string;
    }> = [];

    if (seoListings) {
      for (const doc of seoListings) {
        if (!doc.city || !doc.specialization || !doc.full_name) continue;
        const citySlug = generateCitySlug(doc.city);
        const specialtySlug = generateSpecialtySlug(doc.specialization);
        const doctorSlug = generateDoctorSlug(doc.full_name);
        const urlKey = `${citySlug}/${specialtySlug}/${doctorSlug}`;
        if (addedUrls.has(urlKey)) continue;
        addedUrls.add(urlKey);
        allDoctors.push({
          name: doc.full_name,
          specialization: doc.specialization,
          city: doc.city,
          qualification: doc.qualification || "",
          url: `${BASE_URL}/doctors/${urlKey}`,
        });
      }
    }

    if (approvedDoctors) {
      for (const doc of approvedDoctors) {
        if (!doc.city || !doc.specialization) continue;
        const profile = doc.profiles as unknown as { full_name: string };
        if (!profile?.full_name) continue;
        const citySlug = generateCitySlug(doc.city);
        const specialtySlug = generateSpecialtySlug(doc.specialization);
        const doctorSlug = generateDoctorSlug(profile.full_name);
        const urlKey = `${citySlug}/${specialtySlug}/${doctorSlug}`;
        if (addedUrls.has(urlKey)) continue;
        addedUrls.add(urlKey);
        allDoctors.push({
          name: profile.full_name,
          specialization: doc.specialization,
          city: doc.city,
          qualification: doc.qualification || "",
          url: `${BASE_URL}/doctors/${urlKey}`,
        });
      }
    }

    // Group doctors by city
    if (allDoctors.length > 0) {
      output += `\n## Doctor Profiles (${allDoctors.length} doctors)\n\n`;

      const byCity = new Map<string, typeof allDoctors>();
      for (const doc of allDoctors) {
        const existing = byCity.get(doc.city) || [];
        existing.push(doc);
        byCity.set(doc.city, existing);
      }

      const sortedCities = [...byCity.keys()].sort();
      for (const city of sortedCities) {
        const docs = byCity.get(city)!;
        output += `### ${city} (${docs.length} doctors)\n\n`;
        for (const doc of docs) {
          output += `- [${doc.name}](${doc.url}) - ${doc.specialization}${doc.qualification ? `, ${doc.qualification}` : ""}\n`;
        }
        output += `\n`;
      }
    }

    // Footer
    output += `## API & Sitemap

- [Dynamic Sitemap (XML)](${Deno.env.get("SUPABASE_URL")}/functions/v1/dynamic-sitemap)
- [Static Sitemap (XML)](${BASE_URL}/sitemap.xml)

## Contact

- Website: ${BASE_URL}
- Contact Page: ${BASE_URL}/contact
`;

    return new Response(output, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating llms.txt:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Error: ${errorMessage}`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
