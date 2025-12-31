import { supabase } from "@/integrations/supabase/client";

export type ActivityAction = 
  | "patient_created"
  | "appointment_created"
  | "appointment_updated"
  | "fee_updated"
  | "procedure_set"
  | "discount_applied"
  | "refund_applied";

export type EntityType = "patient" | "appointment";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  details?: Record<string, unknown>;
}

export const logActivity = async ({
  action,
  entityType,
  entityId,
  details = {},
}: LogActivityParams): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("activity_logs").insert([{
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: JSON.parse(JSON.stringify(details)),
    }]);

    if (error) {
      console.error("Error logging activity:", error);
    }
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    patient_created: "Added Patient",
    appointment_created: "Created Appointment",
    appointment_updated: "Updated Appointment",
    fee_updated: "Updated Fee",
    procedure_set: "Set Procedure",
    discount_applied: "Applied Discount",
    refund_applied: "Applied Refund",
  };
  return labels[action] || action;
};
