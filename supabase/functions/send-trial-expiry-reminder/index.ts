import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 3 days from now
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    const targetDate = threeDaysFromNow.toISOString().split('T')[0];

    console.log(`Checking for trials expiring on: ${targetDate}`);

    // Get clinics with trials expiring in 3 days
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .select(`
        id,
        clinic_name,
        trial_end_date,
        profiles!clinics_id_fkey (
          email,
          full_name
        )
      `)
      .eq("status", "active")
      .gte("trial_end_date", targetDate)
      .lt("trial_end_date", new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (clinicsError) {
      console.error("Error fetching clinics:", clinicsError);
      throw clinicsError;
    }

    console.log(`Found ${clinics?.length || 0} clinics with expiring trials`);

    // Get single doctors (no clinic_id) with trials expiring in 3 days
    const { data: doctors, error: doctorsError } = await supabase
      .from("doctors")
      .select(`
        id,
        trial_end_date,
        profiles!doctors_id_fkey (
          email,
          full_name
        )
      `)
      .is("clinic_id", null)
      .eq("approved", true)
      .gte("trial_end_date", targetDate)
      .lt("trial_end_date", new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (doctorsError) {
      console.error("Error fetching doctors:", doctorsError);
      throw doctorsError;
    }

    console.log(`Found ${doctors?.length || 0} single doctors with expiring trials`);

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Send emails to clinics
    for (const clinic of clinics || []) {
      const profile = clinic.profiles as any;
      if (!profile?.email) continue;

      try {
        const trialEndDate = new Date(clinic.trial_end_date);
        const formattedDate = trialEndDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const emailResponse = await resend.emails.send({
          from: "ClinicPro <onboarding@resend.dev>",
          to: [profile.email],
          subject: "Your Free Trial Expires in 3 Days - ClinicPro",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Trial Expiring Soon!</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px;">Dear <strong>${profile.full_name}</strong>,</p>
                
                <p style="font-size: 16px;">This is a friendly reminder that your <strong>14-day free trial</strong> for <strong>${clinic.clinic_name}</strong> on ClinicPro will expire in <strong>3 days</strong>.</p>
                
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>📅 Trial End Date:</strong> ${formattedDate}
                  </p>
                </div>
                
                <p style="font-size: 16px;">To continue enjoying all the features of ClinicPro without any interruption, please contact our support team to discuss subscription options.</p>
                
                <h3 style="color: #667eea; margin-top: 25px;">What you'll lose access to:</h3>
                <ul style="font-size: 14px; color: #555;">
                  <li>Patient management system</li>
                  <li>Appointment scheduling</li>
                  <li>Medical records management</li>
                  <li>Financial tracking & reports</li>
                  <li>And all other premium features</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 14px; color: #666;">Questions? Contact our support team for assistance.</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
                
                <p style="font-size: 12px; color: #888; text-align: center;">
                  This is an automated reminder from ClinicPro.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to clinic ${clinic.clinic_name}:`, emailResponse);
        emailsSent.push(profile.email);
      } catch (error: any) {
        console.error(`Failed to send email to ${profile.email}:`, error);
        errors.push(`${profile.email}: ${error.message}`);
      }
    }

    // Send emails to single doctors
    for (const doctor of doctors || []) {
      const profile = doctor.profiles as any;
      if (!profile?.email) continue;

      try {
        const trialEndDate = new Date(doctor.trial_end_date);
        const formattedDate = trialEndDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const emailResponse = await resend.emails.send({
          from: "ClinicPro <onboarding@resend.dev>",
          to: [profile.email],
          subject: "Your Free Trial Expires in 3 Days - ClinicPro",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Trial Expiring Soon!</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px;">Dear <strong>Dr. ${profile.full_name}</strong>,</p>
                
                <p style="font-size: 16px;">This is a friendly reminder that your <strong>14-day free trial</strong> on ClinicPro will expire in <strong>3 days</strong>.</p>
                
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>📅 Trial End Date:</strong> ${formattedDate}
                  </p>
                </div>
                
                <p style="font-size: 16px;">To continue enjoying all the features of ClinicPro without any interruption, please contact our support team to discuss subscription options.</p>
                
                <h3 style="color: #667eea; margin-top: 25px;">What you'll lose access to:</h3>
                <ul style="font-size: 14px; color: #555;">
                  <li>Patient management system</li>
                  <li>Appointment scheduling</li>
                  <li>Medical records management</li>
                  <li>Financial tracking & reports</li>
                  <li>Prescription templates</li>
                  <li>And all other premium features</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 14px; color: #666;">Questions? Contact our support team for assistance.</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
                
                <p style="font-size: 12px; color: #888; text-align: center;">
                  This is an automated reminder from ClinicPro.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to doctor ${profile.full_name}:`, emailResponse);
        emailsSent.push(profile.email);
      } catch (error: any) {
        console.error(`Failed to send email to ${profile.email}:`, error);
        errors.push(`${profile.email}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        emails: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-trial-expiry-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
