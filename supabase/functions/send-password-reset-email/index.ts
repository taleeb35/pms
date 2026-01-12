import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    console.log("Sending password reset notification to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Zonoir <noreply@zonoir.com>",
        to: [email],
        subject: "Password Reset Request - Zonoir",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                    🔐 Password Reset Request
                  </h1>
                </div>
                
                <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hello,
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    We received a request to reset your password for your Zonoir account.
                  </p>

                  <div style="background: linear-gradient(135deg, #e0f2fe 0%, #e8e0fe 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #667eea;">
                    <p style="color: #333; font-size: 14px; margin: 0;">
                      <strong>📧 Account:</strong> ${email}
                    </p>
                  </div>

                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    If you did not request this password reset, please ignore this email. Your password will remain unchanged.
                  </p>

                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    For security reasons, this reset link will expire in 24 hours.
                  </p>

                  <div style="background: #fef3cd; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #ffc107;">
                    <p style="color: #856404; font-size: 14px; margin: 0;">
                      <strong>⚠️ Security Tip:</strong> Never share your password with anyone. Our team will never ask for your password.
                    </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  
                  <p style="color: #666; font-size: 14px; text-align: center;">
                    Best regards,<br>
                    <strong>The Zonoir Team</strong>
                  </p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
                  <p>This is an automated message from Zonoir.</p>
                  <p style="margin: 8px 0;">140 B, Khayaban e Amin, Lahore, Pakistan</p>
                  <p>© ${new Date().getFullYear()} Zonoir. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to send email");
    }

    const data = await res.json();
    console.log("Password reset email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset-email function:", error);
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
