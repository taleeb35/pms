import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { doctorSignupEmail } from "../_shared/adminSignupEmail.ts";
import { doctorWelcomeEmail } from "../_shared/welcomeEmails.ts";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DoctorSignupEmailRequest {
  doctorName: string;
  email: string;
  specialization: string;
  city: string;
  monthlyFee?: number;
}

const usd = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }); // Zonoir price in USD

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, email, specialization, city, monthlyFee }: DoctorSignupEmailRequest = await req.json();

    // Only send for a real, just-created doctor account (stops anyone using this to send emails).
    if (!doctorName?.trim() || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "doctorName and a valid email are required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    let newDoctorId = "";
    {
      const check = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: prof } = await check.from("profiles").select("id").ilike("email", email.trim()).maybeSingle();
      const { data: doc } = prof
        ? await check.from("doctors").select("id").eq("id", prof.id).gte("created_at", since).maybeSingle()
        : { data: null };
      if (!doc) {
        return new Response(JSON.stringify({ error: "No new doctor account found for this email" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      newDoctorId = doc.id;
    }

    console.log("Sending doctor signup email to:", email);

    // Fetch the monthly fee per doctor from system_settings (server-side, not from the client)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch system settings
    const { data: settingsData } = await supabase
      .from("system_settings")
      .select("key, value");

    const feeData = settingsData?.find(s => s.key === "doctor_monthly_fee");
    const adminEmailData = settingsData?.find(s => s.key === "support_email") || settingsData?.find(s => s.key === "admin_email");

    const resolvedMonthlyFee =
      feeData?.value != null && !isNaN(Number(feeData.value))
        ? Number(feeData.value)
        : typeof monthlyFee === "number" && !isNaN(monthlyFee)
          ? monthlyFee
          : 35;
    
    const adminEmail = adminEmailData?.value || "hello@zonoir.com";

    const welcome = await doctorWelcomeEmail(supabase, newDoctorId);
    if (!welcome) throw new Error("Doctor account not found");

    // Send email to doctor
    const emailResponse = await resend.emails.send({
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

    if ((emailResponse as any)?.error) throw new Error((emailResponse as any).error.message || "Email could not be sent");

    console.log("Doctor signup email sent successfully:", emailResponse);

    // Admin notification: details read from the database.
    const adminMail = await doctorSignupEmail(supabase, newDoctorId);
    const adminNotification = await resend.emails.send({
      from: "Zonoir System <noreply@zonoir.com>",
      to: [adminEmail],
      subject: adminMail?.subject || `New doctor sign-up: ${doctorName}`,
      html: adminMail?.html || "",
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "High",
      },
    });

    console.log("Admin notification email sent successfully:", adminNotification);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-doctor-signup-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
