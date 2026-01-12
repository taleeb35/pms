import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  entityType: "clinic" | "doctor";
  entityName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketId, name, email, subject, message, entityType, entityName }: TicketNotificationRequest = await req.json();

    console.log("Sending ticket notification for ticket:", ticketId);

    const entityLabel = entityType === "clinic" ? "Clinic" : "Doctor";

    // Send notification email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Support Ticket - Zonoir</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🎫 New Support Ticket
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Ticket ID: ${ticketId.substring(0, 8).toUpperCase()}
                    </p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 0 0 25px;">
                      <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
                        ⚠️ Action Required: New support ticket needs attention
                      </p>
                    </div>
                    
                    <!-- Ticket Details Card -->
                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px; color: #f59e0b; font-size: 18px;">📋 Ticket Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; width: 40%; border-bottom: 1px solid #ddd;">From:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">Email:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;"><a href="mailto:${email}" style="color: #f59e0b;">${email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">Account Type:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">${entityLabel}</td>
                        </tr>
                        ${entityName ? `
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #ddd;">${entityLabel} Name:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600; border-bottom: 1px solid #ddd;">${entityName}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 10px 0; color: #666; font-size: 14px;">Subject:</td>
                          <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: 600;">${subject}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Message Content -->
                    <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px; color: #374151; font-size: 18px;">💬 Message</h3>
                      <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <!-- Submission Time -->
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
                      <p style="margin: 0; color: #374151; font-size: 14px;">
                        <strong>📅 Submitted:</strong> ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    </div>
                    
                    <p style="margin: 25px 0 0; color: #555; font-size: 14px; line-height: 1.6;">
                      Please login to the admin dashboard to respond to this ticket.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #9ca3af; font-size: 14px;">
                      Zonoir Support Notification
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
      from: "Zonoir Support <noreply@zonoir.com>",
      to: ["hello@zonoir.com"],
      reply_to: email,
      subject: `🎫 New Support Ticket: ${subject}`,
      html: adminEmailHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "High",
      },
    });

    console.log("Admin ticket notification sent successfully:", adminNotification);

    return new Response(JSON.stringify({ success: true, data: adminNotification }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
