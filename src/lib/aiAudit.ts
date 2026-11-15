import { supabase } from "@/integrations/supabase/client";

// C2: log AI suggestions and what the doctor did with them (best effort; never blocks the UI).
export type AiFeature = "prescription" | "visit_summary" | "patient_insights" | "chatbot" | "revenue_forecast";
export type AiAction = "suggested" | "applied" | "copied" | "dismissed";

export function logAi(feature: AiFeature, action: AiAction, suggestion?: string, inputSummary?: string) {
  supabase.from("ai_audit_log" as any)
    .insert({ feature, action, suggestion: suggestion?.slice(0, 20000) ?? null, input_summary: inputSummary?.slice(0, 500) ?? null })
    .then(({ error }) => { if (error) console.warn("AI log failed", error.message); });
}
