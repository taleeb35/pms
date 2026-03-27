import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, role } = await req.json();
    if (!question || !role) {
      return new Response(JSON.stringify({ error: "question and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const thisMonthStart = `${today.substring(0, 7)}-01`;
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthStart = `${lastMonthDate.toISOString().substring(0, 7)}-01`;
    const lastMonthEnd = `${today.substring(0, 7)}-01`;

    let contextData = "";

    if (role === "clinic") {
      // Fetch clinic-specific data
      const [
        clinicRes, doctorsRes, patientsRes, 
        todayApptsRes, monthApptsRes, lastMonthApptsRes,
        expensesRes, monthExpensesRes
      ] = await Promise.all([
        supabase.from("clinics").select("clinic_name, no_of_doctors, city, status, trial_end_date, payment_plan").eq("id", user.id).single(),
        supabase.from("doctors").select("id, specialization, consultation_fee, profiles(full_name)").eq("clinic_id", user.id),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id, status, total_fee, doctor_id").gte("appointment_date", today).lte("appointment_date", today),
        supabase.from("appointments").select("id, status, total_fee, consultation_fee, doctor_id").gte("appointment_date", thisMonthStart).lte("appointment_date", today),
        supabase.from("appointments").select("id, total_fee, consultation_fee").gte("appointment_date", lastMonthStart).lt("appointment_date", lastMonthEnd),
        supabase.from("clinic_expenses").select("amount, category, expense_date").eq("clinic_id", user.id).gte("expense_date", thisMonthStart),
        supabase.from("clinic_expenses").select("amount, category").eq("clinic_id", user.id).gte("expense_date", lastMonthStart).lt("expense_date", lastMonthEnd),
      ]);

      const clinic = clinicRes.data;
      const doctors = doctorsRes.data || [];
      const todayAppts = todayApptsRes.data || [];
      const monthAppts = monthApptsRes.data || [];
      const lastMonthAppts = lastMonthApptsRes.data || [];
      const expenses = expensesRes.data || [];
      const lastMonthExpenses = monthExpensesRes.data || [];

      // Calculate revenue
      const thisMonthRevenue = monthAppts.reduce((sum: number, a: any) => sum + (a.total_fee || a.consultation_fee || 0), 0);
      const lastMonthRevenue = lastMonthAppts.reduce((sum: number, a: any) => sum + (a.total_fee || a.consultation_fee || 0), 0);
      const thisMonthExpenseTotal = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const lastMonthExpenseTotal = lastMonthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      // Doctor workload
      const doctorWorkload = doctors.map((d: any) => {
        const appts = todayAppts.filter((a: any) => a.doctor_id === d.id);
        return `${d.profiles?.full_name || 'Unknown'} (${d.specialization}): ${appts.length} appointments today, Fee: Rs ${d.consultation_fee || 'N/A'}`;
      }).join("\n");

      // Expense categories
      const expenseByCategory: Record<string, number> = {};
      expenses.forEach((e: any) => {
        expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + (e.amount || 0);
      });
      const expenseSummary = Object.entries(expenseByCategory).map(([cat, amt]) => `${cat}: Rs ${amt}`).join(", ");

      // Appointment status breakdown
      const statusBreakdown: Record<string, number> = {};
      monthAppts.forEach((a: any) => {
        statusBreakdown[a.status || "unknown"] = (statusBreakdown[a.status || "unknown"] || 0) + 1;
      });
      const statusSummary = Object.entries(statusBreakdown).map(([s, c]) => `${s}: ${c}`).join(", ");

      contextData = `
CLINIC DATA:
- Clinic Name: ${clinic?.clinic_name || "N/A"}
- City: ${clinic?.city || "N/A"}
- Payment Plan: ${clinic?.payment_plan || "N/A"}
- Trial End Date: ${clinic?.trial_end_date || "N/A"}
- Total Doctors: ${doctors.length}
- Total Patients: ${patientsRes.count || 0}
- Today's Appointments: ${todayAppts.length}
- This Month's Appointments: ${monthAppts.length} (${statusSummary})
- This Month's Revenue: Rs ${thisMonthRevenue}
- Last Month's Revenue: Rs ${lastMonthRevenue}
- Revenue Change: ${lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 'N/A'}%
- This Month's Expenses: Rs ${thisMonthExpenseTotal} (${expenseSummary || 'None'})
- Last Month's Expenses: Rs ${lastMonthExpenseTotal}
- Net Profit This Month: Rs ${thisMonthRevenue - thisMonthExpenseTotal}

DOCTOR WORKLOAD:
${doctorWorkload || "No doctors registered"}

Today's Date: ${today}`;

    } else if (role === "doctor") {
      // Fetch doctor-specific data
      const [
        profileRes, doctorRes, patientsRes,
        todayApptsRes, monthApptsRes, lastMonthApptsRes,
        waitlistRes, pendingApptsRes
      ] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("doctors").select("specialization, consultation_fee, experience_years, payment_plan, trial_end_date, clinic_id").eq("id", user.id).single(),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("created_by", user.id),
        supabase.from("appointments").select("id, status, total_fee, consultation_fee, reason, patient_id").eq("doctor_id", user.id).eq("appointment_date", today),
        supabase.from("appointments").select("id, status, total_fee, consultation_fee").eq("doctor_id", user.id).gte("appointment_date", thisMonthStart).lte("appointment_date", today),
        supabase.from("appointments").select("id, total_fee, consultation_fee").eq("doctor_id", user.id).gte("appointment_date", lastMonthStart).lt("appointment_date", lastMonthEnd),
        supabase.from("wait_list").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).eq("status", "active"),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).eq("status", "scheduled"),
      ]);

      const monthAppts = monthApptsRes.data || [];
      const lastMonthAppts = lastMonthApptsRes.data || [];
      const todayAppts = todayApptsRes.data || [];
      const thisMonthRevenue = monthAppts.reduce((sum: number, a: any) => sum + (a.total_fee || a.consultation_fee || 0), 0);
      const lastMonthRevenue = lastMonthAppts.reduce((sum: number, a: any) => sum + (a.total_fee || a.consultation_fee || 0), 0);

      // Today's status breakdown
      const todayStatus: Record<string, number> = {};
      todayAppts.forEach((a: any) => {
        todayStatus[a.status || "unknown"] = (todayStatus[a.status || "unknown"] || 0) + 1;
      });
      const todayStatusSummary = Object.entries(todayStatus).map(([s, c]) => `${s}: ${c}`).join(", ");

      // Common complaints today
      const complaints = todayAppts.filter((a: any) => a.reason).map((a: any) => a.reason);
      const complaintSummary = complaints.length > 0 ? complaints.join(", ") : "None specified";

      contextData = `
DOCTOR DATA:
- Name: Dr. ${profileRes.data?.full_name || "N/A"}
- Specialization: ${doctorRes.data?.specialization || "N/A"}
- Experience: ${doctorRes.data?.experience_years || "N/A"} years
- Consultation Fee: Rs ${doctorRes.data?.consultation_fee || "N/A"}
- Payment Plan: ${doctorRes.data?.payment_plan || "N/A"}
- Trial End Date: ${doctorRes.data?.trial_end_date || "N/A"}
- Part of Clinic: ${doctorRes.data?.clinic_id ? "Yes" : "No (Independent)"}
- Total Patients: ${patientsRes.count || 0}
- Today's Appointments: ${todayAppts.length} (${todayStatusSummary || 'none'})
- Today's Complaints: ${complaintSummary}
- Pending Appointments: ${pendingApptsRes.count || 0}
- Waitlist: ${waitlistRes.count || 0} patients
- This Month's Appointments: ${monthAppts.length}
- This Month's Revenue: Rs ${thisMonthRevenue}
- Last Month's Revenue: Rs ${lastMonthRevenue}
- Revenue Change: ${lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 'N/A'}%

Today's Date: ${today}`;
    }

    const systemPrompt = `You are an intelligent AI assistant for a ${role === "clinic" ? "clinic owner" : "doctor"} in Pakistan's healthcare system.

RULES:
- Answer questions using ONLY the provided data context — never make up numbers
- Be concise and direct — aim for 2-4 sentences unless the question demands detail
- Use Pakistani Rupees (Rs) for monetary values
- If the data doesn't contain the answer, say so honestly and suggest what data might help
- Use emojis sparingly for clarity (📊 for stats, 💰 for money, ⚠️ for warnings)
- When comparing periods, show percentage changes
- For actionable questions, give specific recommendations
- Be professional but friendly
- Format numbers with commas for readability (e.g., Rs 1,500)
- You can use markdown for formatting when helpful`;

    const userPrompt = `${contextData}

USER QUESTION: ${question}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
