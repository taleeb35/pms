import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DoctorStatusEmailRequest {
  doctorName: string;
  email: string;
  specialization: string;
  status: 'approved' | 'pending' | 'suspended' | 'rejected';
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, email, specialization, status = 'approved', reason }: DoctorStatusEmailRequest = await req.json();

    console.log(`Sending doctor status email to: ${email}, status: ${status}`);

    let emailHtml = '';
    let subject = '';

    if (status === 'approved') {
      subject = `🎉 Welcome Dr. ${doctorName} - Your Account is Approved!`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🎉 Congratulations! Account Approved!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #333; font-size: 22px;">
                        Welcome, Dr. ${doctorName}! 🩺
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                        Great news! Your account has been reviewed and approved by our admin team. You can now access all features of our platform.
                      </p>
                      
                      <!-- Success Card -->
                      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                        <h3 style="margin: 0 0 10px; color: #065f46; font-size: 20px;">Account Active!</h3>
                        <p style="margin: 0; color: #047857; font-size: 14px;">
                          Your ${specialization} profile is now live on our platform.
                        </p>
                      </div>
                      
                      <!-- What's Next -->
                      <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; margin: 25px 0;">
                        <h3 style="margin: 0 0 15px; color: #0369a1; font-size: 18px;">🚀 What's Next?</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                          <li>Log in to your dashboard</li>
                          <li>Complete your profile with more details</li>
                          <li>Set up your schedule and availability</li>
                          <li>Start managing your patients</li>
                        </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${Deno.env.get("SITE_URL") || "https://zonoir.com"}/doctor-auth" 
                           style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Login to Dashboard →
                        </a>
                      </div>
                      
                      <p style="margin: 25px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
                        If you have any questions, our support team is here to help!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                        Welcome to the Zonoir family!
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
    } else {
      // Status is pending, suspended, or rejected
      const statusTitle = status === 'pending' ? 'Account Status Update' : 
                          status === 'suspended' ? 'Account Suspended' : 'Account Status Update';
      const statusIcon = status === 'pending' ? '⏳' : status === 'suspended' ? '⚠️' : '📋';
      const statusColor = status === 'pending' ? '#f59e0b' : status === 'suspended' ? '#ef4444' : '#6b7280';
      const bgGradient = status === 'pending' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 
                         status === 'suspended' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 
                         'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
      const textColor = status === 'pending' ? '#92400e' : status === 'suspended' ? '#991b1b' : '#374151';

      subject = `${statusIcon} Dr. ${doctorName} - ${statusTitle}`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusTitle}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}cc 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        ${statusIcon} ${statusTitle}
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #333; font-size: 22px;">
                        Dear Dr. ${doctorName},
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                        We wanted to inform you about an update to your account status on Zonoir.
                      </p>
                      
                      <!-- Status Card -->
                      <div style="background: ${bgGradient}; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">${statusIcon}</div>
                        <h3 style="margin: 0 0 10px; color: ${textColor}; font-size: 20px;">
                          ${status === 'pending' ? 'Account Under Review' : 
                            status === 'suspended' ? 'Account Suspended' : 
                            'Status: ' + status.charAt(0).toUpperCase() + status.slice(1)}
                        </h3>
                        <p style="margin: 0; color: ${textColor}; font-size: 14px;">
                          Your ${specialization} profile status has been updated.
                        </p>
                      </div>
                      
                      ${reason ? `
                      <!-- Reason -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid ${statusColor}; border-radius: 4px; padding: 20px; margin: 25px 0;">
                        <h4 style="margin: 0 0 10px; color: #333; font-size: 16px;">Reason:</h4>
                        <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
                          ${reason}
                        </p>
                      </div>
                      ` : ''}
                      
                      <!-- What To Do -->
                      <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; margin: 25px 0;">
                        <h3 style="margin: 0 0 15px; color: #0369a1; font-size: 18px;">📞 Need Assistance?</h3>
                        <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.8;">
                          If you have any questions about this status change or need clarification, please don't hesitate to contact our support team. We're here to help!
                        </p>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${Deno.env.get("SITE_URL") || "https://zonoir.com"}/contact" 
                           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Contact Support →
                        </a>
                      </div>
                      
                      <p style="margin: 25px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
                        Thank you for your understanding.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                        Zonoir Support Team
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
    }

    const emailResponse = await resend.emails.send({
      from: "Zonoir <noreply@zonoir.com>",
      to: [email],
      subject: subject,
      html: emailHtml,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
    });

    console.log("Doctor status email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-doctor-approval-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
