import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clinicName, email, phoneNumber, city, address, requestedDoctors }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    // Fetch the monthly fee per doctor from system_settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: feeData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "doctor_monthly_fee")
      .single();

    const feePerDoctor = feeData ? parseInt(feeData.value) : 6000;
    const numberOfDoctors = requestedDoctors || 1;
    const totalMonthlyFee = feePerDoctor * numberOfDoctors;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received - MyClinicHQ</title>
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
                      🏥 Registration Received
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      MyClinicHQ - Your Healthcare Partner
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
                      Thank you for registering your clinic with <strong>MyClinicHQ</strong>. We are delighted to receive your application and look forward to partnering with you in delivering exceptional healthcare services.
                    </p>
                    
                    <p style="margin: 0 0 25px; color: #555; font-size: 16px; line-height: 1.6;">
                      Your registration is currently under review by our administrative team.
                    </p>
                    
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
                    
                    <!-- Payment Activation Notice -->
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <h4 style="margin: 0 0 10px; color: #1e40af; font-size: 16px;">📌 Account Activation Process</h4>
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                        Your account will be <strong>activated</strong> once the payment has been successfully processed. After approval, you will receive payment instructions via email with detailed steps to complete your subscription.
                      </p>
                    </div>
                    
                    <!-- Pending Notice -->
                    <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <p style="margin: 0; color: #374151; font-size: 14px;">
                        <strong>⏳ Current Status:</strong> Pending Admin Review
                      </p>
                    </div>
                    
                    <p style="margin: 25px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
                      If you have any questions regarding the registration process or fee structure, please don't hesitate to contact our support team.
                    </p>
                    
                    <p style="margin: 20px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
                      Best Regards,<br>
                      <strong>The MyClinicHQ Team</strong>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                      Thank you for choosing MyClinicHQ!
                    </p>
                    <p style="margin: 0; color: #999; font-size: 12px;">
                      © ${new Date().getFullYear()} MyClinicHQ. All rights reserved.
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

    const emailResponse = await resend.emails.send({
      from: "MyClinicHQ <noreply@myclinichq.com>",
      to: [email],
      subject: `Registration Received - ${clinicName} | MyClinicHQ`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-clinic-welcome-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
