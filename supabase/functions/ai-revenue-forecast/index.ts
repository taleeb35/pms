import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { role } = await req.json();

    // Determine doctor IDs based on role
    let doctorIds: string[] = [];
    let clinicName = "";
    let clinicPercentage = 0;

    if (role === "doctor") {
      doctorIds = [user.id];
      const { data: docData } = await supabase
        .from("doctors")
        .select("clinic_percentage, clinic_id")
        .eq("id", user.id)
        .maybeSingle();
      clinicPercentage = docData?.clinic_percentage || 0;
    } else if (role === "clinic") {
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("clinic_name")
        .eq("id", user.id)
        .maybeSingle();
      clinicName = clinicData?.clinic_name || "Clinic";

      const { data: docs } = await supabase
        .from("doctors")
        .select("id, clinic_percentage")
        .eq("clinic_id", user.id)
        .eq("approved", true);
      doctorIds = (docs || []).map((d: any) => d.id);
      if (docs && docs.length > 0) {
        clinicPercentage = docs[0].clinic_percentage || 0;
      }
    }

    if (doctorIds.length === 0) {
      return new Response(JSON.stringify({ error: "No doctors found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch last 6 months of appointment data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split("T")[0];

    const { data: appointments, error: aptError } = await supabase
      .from("appointments")
      .select("appointment_date, total_fee, consultation_fee, procedure_fee, other_fee, refund, status, doctor_id")
      .in("doctor_id", doctorIds)
      .gte("appointment_date", sixMonthsAgoStr)
      .neq("status", "cancelled")
      .order("appointment_date", { ascending: true });

    if (aptError) {
      console.error("Error fetching appointments:", aptError);
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch expenses for clinic
    let expensesData: any[] = [];
    if (role === "clinic") {
      const { data: expenses } = await supabase
        .from("clinic_expenses")
        .select("amount, expense_date, category")
        .eq("clinic_id", user.id)
        .gte("expense_date", sixMonthsAgoStr);
      expensesData = expenses || [];
    }

    // Group by month
    const monthlyData: Record<string, { revenue: number; patients: number; expenses: number }> = {};
    (appointments || []).forEach((apt: any) => {
      const month = apt.appointment_date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, patients: 0, expenses: 0 };
      const fee = (apt.consultation_fee || 0) + (apt.procedure_fee || 0) + (apt.other_fee || 0) - (apt.refund || 0);
      monthlyData[month].revenue += fee;
      monthlyData[month].patients += 1;
    });

    expensesData.forEach((exp: any) => {
      const month = exp.expense_date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, patients: 0, expenses: 0 };
      monthlyData[month].expenses += exp.amount || 0;
    });

    // Build context for AI
    const sortedMonths = Object.keys(monthlyData).sort();
    const monthlyBreakdown = sortedMonths.map(m => ({
      month: m,
      ...monthlyData[m],
    }));

    const totalRevenue = monthlyBreakdown.reduce((s, m) => s + m.revenue, 0);
    const totalPatients = monthlyBreakdown.reduce((s, m) => s + m.patients, 0);
    const totalExpenses = monthlyBreakdown.reduce((s, m) => s + m.expenses, 0);
    const avgMonthlyRevenue = sortedMonths.length > 0 ? totalRevenue / sortedMonths.length : 0;
    const avgMonthlyPatients = sortedMonths.length > 0 ? totalPatients / sortedMonths.length : 0;

    const contextInfo = role === "doctor"
      ? `You are analyzing revenue data for a doctor. Clinic share percentage: ${clinicPercentage}%.`
      : `You are analyzing revenue data for clinic "${clinicName}" with ${doctorIds.length} doctor(s). Clinic share percentage: ${clinicPercentage}%.`;

    const prompt = `${contextInfo}

Here is the monthly financial data for the last 6 months:
${JSON.stringify(monthlyBreakdown, null, 2)}

Summary:
- Total Revenue: Rs. ${totalRevenue.toFixed(0)}
- Total Patients: ${totalPatients}
- Total Expenses: Rs. ${totalExpenses.toFixed(0)}
- Avg Monthly Revenue: Rs. ${avgMonthlyRevenue.toFixed(0)}
- Avg Monthly Patients: ${Math.round(avgMonthlyPatients)}
- Number of doctors: ${doctorIds.length}

Based on this data, provide a revenue forecast and analysis. Your response MUST be valid JSON with this exact structure:
{
  "forecast_next_month": {
    "estimated_revenue": <number>,
    "estimated_patients": <number>,
    "confidence": "<high|medium|low>"
  },
  "forecast_next_quarter": {
    "estimated_revenue": <number>,
    "estimated_patients": <number>
  },
  "trends": {
    "revenue_direction": "<up|down|stable>",
    "revenue_change_percent": <number>,
    "patient_direction": "<up|down|stable>",
    "patient_change_percent": <number>
  },
  "insights": [
    "<insight string 1>",
    "<insight string 2>",
    "<insight string 3>",
    "<insight string 4>"
  ],
  "recommendations": [
    "<recommendation string 1>",
    "<recommendation string 2>",
    "<recommendation string 3>"
  ],
  "risk_alerts": [
    "<risk alert string if any, otherwise empty array>"
  ]
}

Important: Return ONLY the JSON object, no markdown, no extra text. If there is insufficient data, still provide estimates with low confidence. All monetary values should be in Pakistani Rupees (round numbers). Insights should be specific and actionable, referencing actual numbers from the data.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst AI for a medical practice management system in Pakistan. Analyze revenue data and provide forecasts. Always respond with valid JSON only, no markdown formatting.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Clean markdown wrapping if present
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let forecast;
    try {
      forecast = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      forecast = {
        forecast_next_month: { estimated_revenue: Math.round(avgMonthlyRevenue), estimated_patients: Math.round(avgMonthlyPatients), confidence: "low" },
        forecast_next_quarter: { estimated_revenue: Math.round(avgMonthlyRevenue * 3), estimated_patients: Math.round(avgMonthlyPatients * 3) },
        trends: { revenue_direction: "stable", revenue_change_percent: 0, patient_direction: "stable", patient_change_percent: 0 },
        insights: ["Insufficient data for detailed analysis. Continue tracking for better forecasts."],
        recommendations: ["Keep recording all appointments with fees to improve forecast accuracy."],
        risk_alerts: [],
      };
    }

    return new Response(JSON.stringify({
      forecast,
      monthly_data: monthlyBreakdown,
      summary: { totalRevenue, totalPatients, totalExpenses, avgMonthlyRevenue, avgMonthlyPatients },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Revenue forecast error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
