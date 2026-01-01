import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DoctorWelcomeEmailRequest {
  doctorName: string;
  doctorEmail: string;
  password: string;
  clinicName: string;
  clinicAddress?: string;
  clinicCity?: string;
  clinicPhone?: string;
  specialization: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      doctorName, 
      doctorEmail, 
      password, 
      clinicName, 
      clinicAddress,
      clinicCity,
      clinicPhone,
      specialization 
    }: DoctorWelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to doctor:", doctorEmail);

    const loginUrl = `${req.headers.get("origin") || "https://lovable.dev"}/doctor/auth`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${clinicName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 40px 40px 30px 40px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🏥</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        Welcome to ${clinicName}!
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                        You've been added as a doctor
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Dear <strong>Dr. ${doctorName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Congratulations! You have been registered as a <strong>${specialization}</strong> at <strong>${clinicName}</strong>. 
                        Your account is now active and ready to use.
                      </p>
                      
                      <!-- Clinic Details Box -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; margin: 24px 0; border: 2px solid #10b981;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #065f46; font-size: 16px; font-weight: 700;">
                              🏢 Clinic Details
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding: 6px 0; color: #047857; font-size: 14px; width: 35%;">Clinic Name:</td>
                                <td style="padding: 6px 0; color: #065f46; font-size: 14px; font-weight: 600;">${clinicName}</td>
                              </tr>
                              ${clinicAddress ? `
                              <tr>
                                <td style="padding: 6px 0; color: #047857; font-size: 14px;">Address:</td>
                                <td style="padding: 6px 0; color: #065f46; font-size: 14px; font-weight: 600;">${clinicAddress}</td>
                              </tr>
                              ` : ''}
                              ${clinicCity ? `
                              <tr>
                                <td style="padding: 6px 0; color: #047857; font-size: 14px;">City:</td>
                                <td style="padding: 6px 0; color: #065f46; font-size: 14px; font-weight: 600;">${clinicCity}</td>
                              </tr>
                              ` : ''}
                              ${clinicPhone ? `
                              <tr>
                                <td style="padding: 6px 0; color: #047857; font-size: 14px;">Contact:</td>
                                <td style="padding: 6px 0; color: #065f46; font-size: 14px; font-weight: 600;">${clinicPhone}</td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 6px 0; color: #047857; font-size: 14px;">Your Role:</td>
                                <td style="padding: 6px 0; color: #065f46; font-size: 14px; font-weight: 600;">${specialization}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Below are your login credentials to access the Doctor Dashboard:
                      </p>
                      
                      <!-- Credentials Box -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; margin: 24px 0; border: 2px solid #f59e0b;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 16px; font-weight: 700;">
                              🔐 Your Login Credentials
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding: 8px 0; color: #92400e; font-size: 14px; width: 35%;">Email:</td>
                                <td style="padding: 8px 0; color: #78350f; font-size: 16px; font-weight: 700;">${doctorEmail}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #92400e; font-size: 14px;">Password:</td>
                                <td style="padding: 8px 0; color: #78350f; font-size: 16px; font-weight: 700;">${password}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Notice -->
                      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                          ⚠️ Important Security Notice
                        </p>
                        <p style="margin: 8px 0 0 0; color: #b91c1c; font-size: 14px;">
                          Please change your password after your first login for security purposes.
                        </p>
                      </div>
                      
                      <!-- CTA Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                              Login to Doctor Dashboard →
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- What's Next Section -->
                      <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
                        <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 16px; font-weight: 700;">
                          📋 What's Next?
                        </h3>
                        <ul style="margin: 0; padding: 0 0 0 20px; color: #0c4a6e; font-size: 14px; line-height: 1.8;">
                          <li>Login to your dashboard and update your profile</li>
                          <li>Set up your availability schedule</li>
                          <li>Start managing your appointments</li>
                          <li>Access patient records and medical history</li>
                        </ul>
                      </div>
                      
                      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions, please contact your clinic administrator at <strong>${clinicName}</strong>.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} ${clinicName}. All rights reserved.
                      </p>
                      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                        This email was sent to you because you were registered as a doctor at ${clinicName}.
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
      from: "MyClinicHQ <noreply@zonoir.com>",
      to: [doctorEmail],
      subject: `🎉 Welcome to ${clinicName} - Your Doctor Account is Ready!`,
      html: emailHtml,
    });

    console.log("Doctor welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-clinic-doctor-welcome-email function:", error);
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
