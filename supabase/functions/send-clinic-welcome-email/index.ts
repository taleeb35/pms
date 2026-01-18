import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("key, value");

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
    }

    console.log("Settings fetched:", settingsData?.length || 0, "records");

    const feeData = settingsData?.find(s => s.key === "doctor_monthly_fee");
    const adminEmailData = settingsData?.find(s => s.key === "support_email") || settingsData?.find(s => s.key === "admin_email");

    const feePerDoctor = feeData ? parseInt(feeData.value) : 6000;
    const numberOfDoctors = requestedDoctors || 1;
    const totalMonthlyFee = feePerDoctor * numberOfDoctors;
    const adminEmail = adminEmailData?.value || "hello@zonoir.com";

    console.log("Admin email target:", adminEmail);
    console.log("Fee per doctor:", feePerDoctor);

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
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
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
                      Dear ${clinicName},
                    </h2>
                    
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      Congratulations! Your clinic has been <strong>automatically activated</strong> with a <strong>14-day free trial</strong>. You now have full access to all Zonoir features!
                    </p>
                    
                    <!-- Trial Banner -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                      <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 24px;">🎁 14-Day Free Trial</h3>
                      <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                        Explore all premium features at no cost for the first 14 days!
                      </p>
                    </div>
                    
                    <!-- Clinic Details Card -->
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px; color: #667eea; font-size: 18px;">📋 Registration Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Clinic Name:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${clinicName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Email:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Phone:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${phoneNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">City:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${city}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Address:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${address}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Requested Doctors:</td>
                          <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">${numberOfDoctors}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Fee Information Card -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #f59e0b;">
                      <h3 style="margin: 0 0 15px; color: #92400e; font-size: 18px;">💰 Subscription Fee Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #78350f; font-size: 14px; width: 50%;">Fee per Doctor (Monthly):</td>
                          <td style="padding: 8px 0; color: #78350f; font-size: 16px; font-weight: 600;">PKR ${feePerDoctor.toLocaleString('en-PK')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #78350f; font-size: 14px;">Number of Doctors:</td>
                          <td style="padding: 8px 0; color: #78350f; font-size: 16px; font-weight: 600;">${numberOfDoctors}</td>
                        </tr>
                        <tr style="border-top: 2px solid #f59e0b;">
                          <td style="padding: 12px 0 8px; color: #78350f; font-size: 16px; font-weight: 700;">Total Monthly Fee:</td>
                          <td style="padding: 12px 0 8px; color: #78350f; font-size: 22px; font-weight: 700;">PKR ${totalMonthlyFee.toLocaleString('en-PK')}</td>
                        </tr>
                      </table>
                      <p style="margin: 15px 0 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                        This fee covers complete access to all platform features including doctor management, patient records, appointment scheduling, billing, and analytics.
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
          subject: `Zonoir - Welcome ${clinicName}, Your Registration is Complete`,
          html: emailHtml,
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

    // Send admin notification email
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Clinic Registration - Zonoir Admin</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🏥 New Clinic Registration
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Admin Notification - Auto-Approved
                    </p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 0 0 25px;">
                      <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">
                        ✅ New clinic has been automatically activated with 14-day trial
                      </p>
                    </div>
                    
                    <!-- Clinic Details Card -->
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px; color: #667eea; font-size: 18px;">📋 Clinic Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; width: 40%; border-bottom: 1px solid #ddd;">Clinic Name:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">${clinicName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">Email:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;"><a href="mailto:${email}" style="color: #667eea;">${email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">Phone:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;"><a href="tel:${phoneNumber}" style="color: #667eea;">${phoneNumber}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">City:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">${city}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">Address:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">${address}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px;">Requested Doctors:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600;">${numberOfDoctors}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Fee Summary -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #10b981;">
                      <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">💰 Expected Revenue</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Fee per Doctor:</td>
                          <td style="padding: 8px 0; color: #065f46; font-size: 16px; font-weight: 600;">PKR ${feePerDoctor.toLocaleString('en-PK')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Number of Doctors:</td>
                          <td style="padding: 8px 0; color: #065f46; font-size: 16px; font-weight: 600;">${numberOfDoctors}</td>
                        </tr>
                        <tr style="border-top: 2px solid #10b981;">
                          <td style="padding: 12px 0 8px; color: #065f46; font-size: 16px; font-weight: 700;">Total Monthly:</td>
                          <td style="padding: 12px 0 8px; color: #065f46; font-size: 22px; font-weight: 700;">PKR ${totalMonthlyFee.toLocaleString('en-PK')}</td>
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
                      Please login to the admin dashboard to review this registration.
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

    // Send admin notification with retry
    console.log("Attempting to send admin notification to:", adminEmail);
    
    let adminNotification;
    retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        adminNotification = await resend.emails.send({
          from: "Zonoir System <noreply@zonoir.com>",
          to: [adminEmail],
          subject: `🏥 New Clinic Registration: ${clinicName} - Auto-Approved`,
          html: adminEmailHtml,
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
