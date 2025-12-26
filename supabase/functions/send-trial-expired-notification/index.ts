import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking for trials that expired on: ${today}`);

    // Get clinics with trials that expired today
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
      .eq("trial_end_date", today);

    if (clinicsError) {
      console.error("Error fetching clinics:", clinicsError);
      throw clinicsError;
    }

    console.log(`Found ${clinics?.length || 0} clinics with expired trials today`);

    // Get single doctors with trials that expired today
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
      .eq("trial_end_date", today);

    if (doctorsError) {
      console.error("Error fetching doctors:", doctorsError);
      throw doctorsError;
    }

    console.log(`Found ${doctors?.length || 0} single doctors with expired trials today`);

    const emailsSent: string[] = [];
    const accessRestricted: string[] = [];
    const errors: string[] = [];

    // Restrict access for expired clinics
    for (const clinic of clinics || []) {
      try {
        const { error: updateError } = await supabase
          .from("clinics")
          .update({ status: "inactive" })
          .eq("id", clinic.id);

        if (updateError) {
          console.error(`Failed to restrict clinic ${clinic.id}:`, updateError);
          errors.push(`Clinic ${clinic.clinic_name}: ${updateError.message}`);
        } else {
          console.log(`Restricted access for clinic: ${clinic.clinic_name}`);
          accessRestricted.push(`Clinic: ${clinic.clinic_name}`);
        }
      } catch (error: any) {
        console.error(`Error restricting clinic ${clinic.id}:`, error);
        errors.push(`Clinic ${clinic.clinic_name}: ${error.message}`);
      }
    }

    // Restrict access for expired single doctors
    for (const doctor of doctors || []) {
      const profile = doctor.profiles as any;
      try {
        const { error: updateError } = await supabase
          .from("doctors")
          .update({ approved: false })
          .eq("id", doctor.id);

        if (updateError) {
          console.error(`Failed to restrict doctor ${doctor.id}:`, updateError);
          errors.push(`Doctor ${profile?.full_name}: ${updateError.message}`);
        } else {
          console.log(`Restricted access for doctor: ${profile?.full_name}`);
          accessRestricted.push(`Doctor: ${profile?.full_name}`);
        }
      } catch (error: any) {
        console.error(`Error restricting doctor ${doctor.id}:`, error);
        errors.push(`Doctor ${profile?.full_name}: ${error.message}`);
      }
    }

    // Send emails to clinics
    for (const clinic of clinics || []) {
      const profile = clinic.profiles as any;
      if (!profile?.email) continue;

      try {
        const emailResponse = await resend.emails.send({
          from: "ClinicPro <onboarding@resend.dev>",
          to: [profile.email],
          subject: "Your Free Trial Has Expired - ClinicPro",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Trial Period Ended</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px;">Dear <strong>${profile.full_name}</strong>,</p>
                
                <p style="font-size: 16px;">Your <strong>14-day free trial</strong> for <strong>${clinic.clinic_name}</strong> on ClinicPro has now expired.</p>
                
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #721c24;">
                    <strong>⚠️ Access Restricted:</strong> Your access to ClinicPro features has been temporarily restricted until you subscribe to a plan.
                  </p>
                </div>
                
                <h3 style="color: #dc3545; margin-top: 25px;">What This Means:</h3>
                <ul style="font-size: 14px; color: #555;">
                  <li>You can no longer access patient management features</li>
                  <li>Appointment scheduling is temporarily disabled</li>
                  <li>Medical records are in read-only mode</li>
                  <li>Financial tracking is unavailable</li>
                </ul>
                
                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 25px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #155724;">✨ Ready to Continue?</h4>
                  <p style="margin: 0; font-size: 14px; color: #155724;">
                    Contact our support team to subscribe and regain full access to all ClinicPro features. Your data is safe and will be available once you subscribe.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 14px; color: #666;">Questions? Contact our support team for assistance.</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
                
                <p style="font-size: 12px; color: #888; text-align: center;">
                  This is an automated notification from ClinicPro.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Expired trial email sent to clinic ${clinic.clinic_name}:`, emailResponse);
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
        const emailResponse = await resend.emails.send({
          from: "ClinicPro <onboarding@resend.dev>",
          to: [profile.email],
          subject: "Your Free Trial Has Expired - ClinicPro",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Trial Period Ended</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px;">Dear <strong>Dr. ${profile.full_name}</strong>,</p>
                
                <p style="font-size: 16px;">Your <strong>14-day free trial</strong> on ClinicPro has now expired.</p>
                
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #721c24;">
                    <strong>⚠️ Access Restricted:</strong> Your access to ClinicPro features has been temporarily restricted until you subscribe to a plan.
                  </p>
                </div>
                
                <h3 style="color: #dc3545; margin-top: 25px;">What This Means:</h3>
                <ul style="font-size: 14px; color: #555;">
                  <li>You can no longer access patient management features</li>
                  <li>Appointment scheduling is temporarily disabled</li>
                  <li>Medical records are in read-only mode</li>
                  <li>Prescription templates are unavailable</li>
                  <li>Financial tracking is disabled</li>
                </ul>
                
                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 25px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #155724;">✨ Ready to Continue?</h4>
                  <p style="margin: 0; font-size: 14px; color: #155724;">
                    Contact our support team to subscribe and regain full access to all ClinicPro features. Your data is safe and will be available once you subscribe.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 14px; color: #666;">Questions? Contact our support team for assistance.</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
                
                <p style="font-size: 12px; color: #888; text-align: center;">
                  This is an automated notification from ClinicPro.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Expired trial email sent to doctor ${profile.full_name}:`, emailResponse);
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
        accessRestricted: accessRestricted.length,
        restrictedAccounts: accessRestricted,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-trial-expired-notification function:", error);
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
