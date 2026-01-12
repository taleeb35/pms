import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  subject: string;
  message: string;
  requestType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, organization, subject, message, requestType }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const requestTypeLabels: Record<string, string> = {
      inquiry: "General Inquiry",
      demo: "Request Demo",
      pricing: "Pricing Info",
      support: "Technical Support",
      partnership: "Partnership",
      other: "Other",
    };

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "Zonoir Contact Form <noreply@zonoir.com>",
      to: ["hello@zonoir.com"],
      reply_to: email,
      subject: `[${requestTypeLabels[requestType] || requestType}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0070f3, #00a8ff); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #374151; width: 140px;">Request Type:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${requestTypeLabels[requestType] || requestType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #374151;">Name:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;"><a href="mailto:${email}" style="color: #0070f3;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #374151;">Phone:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${phone}</td>
              </tr>
              ` : ''}
              ${organization ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #374151;">Organization:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${organization}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #374151;">Subject:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">${subject}</td>
              </tr>
            </table>
            <div style="margin-top: 20px;">
              <p style="font-weight: bold; color: #374151; margin-bottom: 10px;">Message:</p>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; color: #4b5563; white-space: pre-wrap;">${message}</div>
            </div>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            140 B, Khayaban e Amin, Lahore, Pakistan<br><br>
            This email was sent from the Zonoir contact form.
          </p>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
