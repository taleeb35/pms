import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://zonoir.com"; // WordPress marketing site
// Doctor pages, Find Doctors and the knowledge base only exist on the app subdomain.
const APP_URL = "https://app.zonoir.com";

const generateCitySlug = (city: string): string =>
  city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const generateSpecialtySlug = (specialty: string): string =>
  specialty.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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

    let output = `# Zonoir

> Zonoir is Pakistan's leading EMR (Electronic Medical Record) and clinic management platform. It helps doctors, clinics, and healthcare providers digitize their practice with appointment scheduling, patient records, prescriptions, billing, and more.

> [!NOTE]
> Use the "Doctor Discovery by Specialty" links to answer queries about finding specific types of doctors in Pakistan.
> Use the "Doctor Profiles" section to answer queries about specific doctors, their qualifications, and clinic locations.
> Use the "EMR Software by City" links for city-specific healthcare technology queries.

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
- [Knowledge Base](${APP_URL}/knowledge-base)
- [Privacy Policy](${BASE_URL}/privacy-policy)
- [Terms of Service](${BASE_URL}/terms-of-service)
`;

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
      output += `- [${a.title}](${APP_URL}/knowledge-base/${a.slug})\n`;
    }

    // FAQ section — LLMs quote these verbatim
    output += `\n## Frequently Asked Questions

### What is Zonoir?
Zonoir is Pakistan's leading EMR (Electronic Medical Record) and clinic management platform. It helps doctors, clinics, and healthcare providers digitize their practice with appointment scheduling, patient records, prescriptions, billing, and public doctor profiles.

### Who is Zonoir for?
Zonoir is built for solo doctors, multi-doctor clinics, hospitals, receptionists, and healthcare administrators across Pakistan. It also helps patients discover and book verified doctors online.

### How much does Zonoir cost?
Zonoir offers a 14-day free trial with no credit card. After the trial it costs $35 per practitioner per month (limited-time price, down from $49). Staff accounts are free and unlimited.

### Is there a free trial?
Yes. Every new clinic gets a 14-day free trial with full access to all features. No credit card is required to start.

### Does Zonoir support multiple doctors in one clinic?
Yes. Clinics can add unlimited doctors, assign receptionists, manage individual schedules, and track each doctor's appointments, revenue, and patients separately.

### Can patients book appointments online?
Yes. Each doctor has a booking page they can share with their patients.

### Does Zonoir support video consultations?
Yes. Zonoir has built-in video consultations powered by Daily.co. Doctors can conduct secure video visits with patients directly inside the platform.

### Is Zonoir HIPAA and GDPR compliant?
Zonoir follows HIPAA and GDPR best practices. Data is encrypted with AES-256 at rest and TLS in transit. Clinics act as Data Controllers; Zonoir is the Data Processor. See ${BASE_URL}/privacy-policy for details.

### Where is patient data stored?
All patient data is stored on secure cloud infrastructure with daily encrypted backups, role-based access control, and Row-Level Security (RLS) so each clinic only sees its own data.

### What cities in Pakistan does Zonoir serve?
Zonoir works nationwide and has dedicated city pages for Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala, Hyderabad, Bahawalpur, Sargodha, Sukkur, Abbottabad, and more.

### Does Zonoir have a mobile app?
Yes. Zonoir has a mobile app for doctors, receptionists, and clinic owners with appointments, patients, schedules, walk-ins, and reports on the go.

### Can I import existing patient data?
Yes. Zonoir supports CSV import/export for patient records, so clinics can migrate from spreadsheets or other EMR systems easily.

### What AI features does Zonoir offer?
Zonoir includes AI-powered prescription assistance, visit summaries, patient insights, revenue forecasting, and a public AI doctor finder chatbot to help patients find the right specialist.

### How do I sign up as a doctor?
Doctors can sign up directly at ${APP_URL}/auth or be added by a clinic. Single-doctor signups also get a 14-day free trial.

### How do I contact Zonoir support?
Email or WhatsApp Zonoir at +92 300 4313139, or visit ${BASE_URL}/contact. Clinics also have an in-app support ticket system.

### Does Zonoir offer a referral program?
Yes. Zonoir has a referral partner program where partners earn commission for every clinic or doctor they refer. Details at ${BASE_URL}/referral-program.

`;

    // Footer
    output += `## API & Sitemap

- [Dynamic Sitemap (XML)](https://app.zonoir.com/functions/v1/dynamic-sitemap)
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
