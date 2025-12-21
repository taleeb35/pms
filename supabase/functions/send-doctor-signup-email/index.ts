import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  monthlyFee: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, email, specialization, city, monthlyFee }: DoctorSignupEmailRequest = await req.json();

    console.log("Sending doctor signup email to:", email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received</title>
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
                      🩺 Registration Received!
                    </h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px; color: #333; font-size: 22px;">
                      Hello, Dr. ${doctorName}! 👋
                    </h2>
                    
                    <p style="margin: 0 0 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      Thank you for registering on our platform as an independent doctor. We're excited to have you join our network!
                    </p>
                    
                    <p style="margin: 0 0 25px; color: #555; font-size: 16px; line-height: 1.6;">
                      Your registration is currently under review by our admin team. You will receive another email once your account is approved.
                    </p>
                    
                    <!-- Doctor Details Card -->
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px; color: #059669; font-size: 18px;">📋 Your Registration Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #666; font-size: 14px;">Name:</td>
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
                    
                    <!-- Monthly Fee Notice -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>💰 Monthly Fee:</strong> Once your account is approved, a monthly subscription fee of <strong>PKR ${monthlyFee.toLocaleString('en-PK')}</strong> will be applicable for using our platform.
                      </p>
                    </div>
                    
                    <!-- Pending Notice -->
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>⏳ Pending Approval:</strong> Your account is under review. We'll notify you via email once approved.
                      </p>
                    </div>
                    
                    <p style="margin: 25px 0 0; color: #555; font-size: 16px; line-height: 1.6;">
                      If you have any questions, feel free to reach out to our support team.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                      Thank you for choosing our platform!
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
      subject: `Registration Received - Dr. ${doctorName} 🩺`,
      html: emailHtml,
    });

    console.log("Doctor signup email sent successfully:", emailResponse);

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
