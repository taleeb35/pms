import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StatusEmailRequest {
  clinicName: string;
  email: string;
  ownerName: string;
  status: "active" | "suspended";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clinicName, email, ownerName, status }: StatusEmailRequest = await req.json();

    console.log(`Sending ${status} status email to:`, email);

    const isActivated = status === "active";
    
    const emailHtml = isActivated ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activated</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      ✅ Your Account is Now Active!
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px; color: #333; font-size: 22px;">
                      Congratulations, ${ownerName}! 🎉
                    </h2>
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      Great news! Your clinic <strong>"${clinicName}"</strong> has been activated by our admin team.
                    </p>
                    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <p style="margin: 0; color: #065f46; font-size: 14px;">
                        <strong>🎊 Account Activated:</strong> You now have full access to all features of our clinic management platform.
                      </p>
                    </div>
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      You can now:
                    </p>
                    <ul style="margin: 0 0 25px; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                      <li>Add and manage doctors in your clinic</li>
                      <li>Register and track patients</li>
                      <li>Schedule and manage appointments</li>
                      <li>Access financial reports and analytics</li>
                    </ul>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://myclinichq.com/auth" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                        Login to Your Dashboard →
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                      Welcome to the MyClinicHQ family!
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
    ` : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Suspended</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      ⚠️ Account Suspended
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px; color: #333; font-size: 22px;">
                      Dear ${ownerName},
                    </h2>
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      We regret to inform you that your clinic <strong>"${clinicName}"</strong> has been suspended by our admin team.
                    </p>
                    <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <p style="margin: 0; color: #991b1b; font-size: 14px;">
                        <strong>⚠️ Account Suspended:</strong> Your access to the clinic management platform has been temporarily restricted.
                      </p>
                    </div>
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      This may have occurred due to:
                    </p>
                    <ul style="margin: 0 0 25px; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                      <li>Pending payment for subscription fees</li>
                      <li>Violation of terms of service</li>
                      <li>Account verification issues</li>
                      <li>Other administrative reasons</li>
                    </ul>
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      If you believe this is an error or would like to resolve this issue, please contact our support team immediately.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="mailto:support@myclinichq.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                        Contact Support
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                      We hope to resolve this soon.
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

    const subject = isActivated 
      ? `🎉 Your Clinic "${clinicName}" is Now Active!`
      : `⚠️ Your Clinic "${clinicName}" Has Been Suspended`;

    const emailResponse = await resend.emails.send({
      from: "MyClinicHQ <noreply@zonoir.com>",
      to: [email],
      subject,
      html: emailHtml,
    });

    console.log("Status email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-clinic-status-email function:", error);
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
