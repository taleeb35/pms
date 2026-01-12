import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, email, specialization, city, monthlyFee }: DoctorSignupEmailRequest = await req.json();

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
          : 6000;
    
    const adminEmail = adminEmailData?.value || "hello@zonoir.com";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received - Zonoir</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🎉 Welcome to Zonoir!
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Your 14-Day Free Trial Has Started
                    </p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px; color: #333; font-size: 22px;">
                      Dear Dr. ${doctorName},
                    </h2>
                    
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      Congratulations! Your account has been <strong>automatically activated</strong> with a <strong>14-day free trial</strong>. You now have full access to all Zonoir features!
                    </p>
                    
                    <!-- Trial Banner -->
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                      <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 24px;">🎁 14-Day Free Trial</h3>
                      <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                        Explore all premium features at no cost for the first 14 days!
                      </p>
                    </div>
                    
                    <!-- Doctor Details Card -->
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px; color: #059669; font-size: 18px;">📋 Registration Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Name:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">Dr. ${doctorName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Email:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Specialization:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${specialization}</td>
                        </tr>
                        ${city ? `
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">City:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${city}</td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                    
                    <!-- Fee Information Card -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #f59e0b;">
                      <h3 style="margin: 0 0 15px; color: #92400e; font-size: 18px;">💰 Subscription Fee Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #78350f; font-size: 14px; width: 40%;">Monthly Fee:</td>
                          <td style="padding: 8px 0; color: #78350f; font-size: 20px; font-weight: 700;">PKR ${resolvedMonthlyFee.toLocaleString('en-PK')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Billing Cycle:</td>
                          <td style="padding: 8px 0; color: #78350f; font-size: 14px; font-weight: 600;">Monthly</td>
                        </tr>
                      </table>
                      <p style="margin: 15px 0 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                        This fee covers full access to all platform features including patient management, appointment scheduling, medical records, and more.
                      </p>
                    </div>
                    
                    <!-- Trial Info Notice -->
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <h4 style="margin: 0 0 10px; color: #1e40af; font-size: 16px;">📌 What Happens After Your Trial?</h4>
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                        After your 14-day free trial ends, you will need to subscribe to continue using Zonoir. We will send you a reminder before your trial expires with payment instructions.
                      </p>
                    </div>
                    
                    <!-- Active Status Notice -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <p style="margin: 0; color: #065f46; font-size: 14px;">
                        <strong>✅ Account Status:</strong> Active (Trial Period)
                      </p>
                    </div>
                    
                    <p style="margin: 25px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
                      If you have any questions regarding the registration process or fee structure, please don't hesitate to contact our support team.
                    </p>
                    
                    <p style="margin: 20px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
                      Best Regards,<br>
                      <strong>The Zonoir Team</strong>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                      Thank you for choosing Zonoir!
                    </p>
                    <p style="margin: 0 0 8px; color: #999; font-size: 12px;">
                      140 B, Khayaban e Amin, Lahore, Pakistan
                    </p>
                    <p style="margin: 0; color: #999; font-size: 12px;">
                      © ${new Date().getFullYear()} Zonoir. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email to doctor
    const emailResponse = await resend.emails.send({
      from: "Zonoir <noreply@zonoir.com>",
      to: [email],
      subject: `Zonoir - Welcome Dr. ${doctorName}, Your Registration is Complete`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "High",
      },
    });

    console.log("Doctor signup email sent successfully:", emailResponse);

    // Send admin notification email
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Doctor Registration - Zonoir Admin</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🩺 New Doctor Registration
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Admin Notification - Requires Review
                    </p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 0 0 25px;">
                      <p style="margin: 0; color: #991b1b; font-size: 16px; font-weight: 600;">
                        ⚠️ Action Required: New doctor registration pending approval
                      </p>
                    </div>
                    
                    <!-- Doctor Details Card -->
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px; color: #059669; font-size: 18px;">📋 Doctor Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; width: 40%; border-bottom: 1px solid #ddd;">Name:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">Dr. ${doctorName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">Email:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;"><a href="mailto:${email}" style="color: #059669;">${email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">Specialization:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">${specialization}</td>
                        </tr>
                        ${city ? `
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px;">City:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600;">${city}</td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                    
                    <!-- Fee Summary -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #10b981;">
                      <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">💰 Expected Revenue</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Monthly Fee:</td>
                          <td style="padding: 8px 0; color: #065f46; font-size: 22px; font-weight: 700;">PKR ${resolvedMonthlyFee.toLocaleString('en-PK')}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Registration Time -->
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
                      <p style="margin: 0; color: #374151; font-size: 14px;">
                        <strong>📅 Registration Time:</strong> ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    </div>
                    
                    <p style="margin: 25px 0 0; color: #555; font-size: 14px; line-height: 1.6;">
                      Please login to the admin dashboard to review and approve this registration.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #9ca3af; font-size: 14px;">
                      Zonoir Admin Notification
                    </p>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">
                      140 B, Khayaban e Amin, Lahore, Pakistan
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      © ${new Date().getFullYear()} Zonoir. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const adminNotification = await resend.emails.send({
      from: "Zonoir System <noreply@zonoir.com>",
      to: [adminEmail],
      subject: `Zonoir Admin - New Doctor Registration: Dr. ${doctorName}`,
      html: adminEmailHtml,
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
