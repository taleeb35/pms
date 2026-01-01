import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralPartnerEmailRequest {
  full_name: string;
  email: string;
  referral_code: string;
  type: "signup" | "approved" | "rejected" | "deleted";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { full_name, email, referral_code, type }: ReferralPartnerEmailRequest = await req.json();

    let subject = "";
    let html = "";

    if (type === "signup") {
      subject = "🎉 Welcome to Zonoir Referral Program - You're Approved!";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; font-size: 28px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; letter-spacing: 3px; }
            .info-box { background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Welcome to Zonoir!</h1>
              <p>Your Referral Partner Account is Active</p>
            </div>
            <div class="content">
              <p>Dear <strong>${full_name}</strong>,</p>
              <p>Congratulations! You're now an approved referral partner. You can start earning commissions immediately!</p>
              
              <p><strong>Your unique referral code is:</strong></p>
              <div class="code-box">${referral_code}</div>
              
              <div class="info-box">
                <h3>🚀 Start Earning Now!</h3>
                <p>Your account is <strong>active</strong>. Share your code with clinics and doctors to earn 20% commission on their subscriptions!</p>
              </div>
              
              <h3>💰 How It Works:</h3>
              <ul>
                <li><strong>20% Commission</strong> on every successful referral</li>
                <li>Share your code with clinics and doctors</li>
                <li>They use your code when signing up</li>
                <li>Monthly payouts directly to your account</li>
              </ul>
              
              <p>Welcome aboard! Let's grow together.</p>
              
              <p>Best regards,<br>The Zonoir Team</p>
            </div>
            <div class="footer">
              <p>This email was sent because you signed up for our referral program.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "approved") {
      subject = "🎉 Your Referral Partner Application is Approved!";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; font-size: 28px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; letter-spacing: 3px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Congratulations!</h1>
              <p>Your application has been approved</p>
            </div>
            <div class="content">
              <p>Dear <strong>${full_name}</strong>,</p>
              <p>Great news! Your referral partner application has been approved. You can now start earning commissions!</p>
              
              <p><strong>Your referral code:</strong></p>
              <div class="code-box">${referral_code}</div>
              
              <h3>🚀 Start Earning Now:</h3>
              <ol>
                <li>Share your referral code with clinics and doctors</li>
                <li>They use your code when signing up</li>
                <li>You earn 20% commission on their subscriptions</li>
                <li>Track everything in your partner dashboard</li>
              </ol>
              
              <p>Welcome aboard! Let's grow together.</p>
              
              <p>Best regards,<br>The Zonoir Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because your referral partner application was approved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "rejected") {
      subject = "Update on Your Referral Partner Application";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6B7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${full_name}</strong>,</p>
              <p>Thank you for your interest in our referral program. After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
              
              <p>This decision may be due to various factors, and we encourage you to apply again in the future.</p>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The Zonoir Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you applied to our referral program.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "deleted") {
      subject = "Your Referral Partner Account Has Been Removed";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Removed</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${full_name}</strong>,</p>
              <p>We're writing to inform you that your referral partner account has been removed from our system.</p>
              
              <p>Your referral code <strong>${referral_code}</strong> is no longer active and cannot be used for new referrals.</p>
              
              <p>If you believe this was done in error or have any questions, please contact our support team.</p>
              
              <p>Thank you for your interest in our program.</p>
              
              <p>Best regards,<br>The Zonoir Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because your referral partner account was removed.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Zonoir <noreply@zonoir.com>",
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending referral partner email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
