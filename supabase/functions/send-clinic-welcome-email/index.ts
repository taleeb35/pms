import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { clinicSignupEmail } from "../_shared/adminSignupEmail.ts";
import { clinicWelcomeEmail } from "../_shared/welcomeEmails.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  clinicName: string;
  email: string;
  phoneNumber: string;
  city: string;
  address: string;
  requestedDoctors: number;
}

const usd = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }); // Zonoir price in USD

const handler = async (req: Request): Promise<Response> => {
  console.log("=== send-clinic-welcome-email function invoked ===");
  console.log("Request method:", req.method);
  console.log("Request time:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get and validate RESEND_API_KEY
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("CRITICAL: RESEND_API_KEY is not configured!");
      throw new Error("Email service not configured - RESEND_API_KEY missing");
    }
    console.log("RESEND_API_KEY is configured");

    const resend = new Resend(resendApiKey);

    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body));

    const { clinicName, email, phoneNumber, city, address, requestedDoctors }: WelcomeEmailRequest = body;

    // Validate required fields
    if (!clinicName || !email) {
      console.error("Missing required fields - clinicName:", clinicName, "email:", email);
      throw new Error("Missing required fields: clinicName and email are required");
    }

    console.log("Processing welcome email for:", { clinicName, email, city });

    // Fetch system settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      throw new Error("Server configuration error");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Only send for a real, just-created clinic account (stops anyone using this to send emails).
    let newClinicId = "";
    {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: prof } = await supabase.from("profiles").select("id").ilike("email", String(email).trim()).maybeSingle();
      const { data: clinic } = prof
        ? await supabase.from("clinics").select("id").eq("id", prof.id).gte("created_at", since).maybeSingle()
        : { data: null };
      if (!clinic) {
        return new Response(JSON.stringify({ success: false, error: "No new clinic account found for this email" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      newClinicId = clinic.id;
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("key, value");

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
    }

    console.log("Settings fetched:", settingsData?.length || 0, "records");

    const feeData = settingsData?.find(s => s.key === "doctor_monthly_fee");
    const adminEmailData = settingsData?.find(s => s.key === "support_email") || settingsData?.find(s => s.key === "admin_email");

    const feePerDoctor = feeData ? Number(feeData.value) || 35 : 35;
    const numberOfDoctors = requestedDoctors || 1;
    const totalMonthlyFee = feePerDoctor * numberOfDoctors;
    const adminEmail = adminEmailData?.value || "hello@zonoir.com";

    console.log("Admin email target:", adminEmail);
    console.log("Fee per doctor:", feePerDoctor);

    const welcome = await clinicWelcomeEmail(supabase, newClinicId);
    if (!welcome) throw new Error("Clinic account not found");

    // Send email to clinic with retry logic
    console.log("Attempting to send welcome email to clinic:", email);
    
    let emailResponse;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        emailResponse = await resend.emails.send({
          from: "Zonoir <noreply@zonoir.com>",
          to: [email],
          subject: welcome.subject,
          html: welcome.html,
          headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            "Importance": "High",
          },
        });
        
        if (emailResponse.error) {
          throw new Error(emailResponse.error.message || "Resend API error");
        }
        
        console.log("✅ Clinic welcome email sent successfully:", JSON.stringify(emailResponse));
        break;
      } catch (emailErr: any) {
        retryCount++;
        console.error(`Email send attempt ${retryCount} failed:`, emailErr.message);
        if (retryCount > maxRetries) {
          throw emailErr;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // Admin notification: details read from the database.
    const adminMail = await clinicSignupEmail(supabase, newClinicId);

    // Send admin notification with retry
    console.log("Attempting to send admin notification to:", adminEmail);
    
    let adminNotification;
    retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        adminNotification = await resend.emails.send({
          from: "Zonoir System <noreply@zonoir.com>",
          to: [adminEmail],
          subject: adminMail?.subject || `New clinic sign-up: ${clinicName}`,
          html: adminMail?.html || "",
          headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            "Importance": "High",
          },
        });
        
        if (adminNotification.error) {
          throw new Error(adminNotification.error.message || "Resend API error for admin");
        }
        
        console.log("✅ Admin notification email sent successfully:", JSON.stringify(adminNotification));
        break;
      } catch (adminErr: any) {
        retryCount++;
        console.error(`Admin email send attempt ${retryCount} failed:`, adminErr.message);
        if (retryCount > maxRetries) {
          // Don't throw for admin email - clinic email is more important
          console.error("Failed to send admin notification after retries");
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    console.log("=== Email function completed successfully ===");

    return new Response(JSON.stringify({ 
      success: true, 
      clinicEmail: emailResponse,
      adminEmail: adminNotification,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ CRITICAL ERROR in send-clinic-welcome-email:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
