import { supabase } from "@/integrations/supabase/client";

export type ActivityAction = 
  | "patient_created"
  | "patient_updated"
  | "patient_deleted"
  | "appointment_created"
  | "appointment_updated"
  | "appointment_cancelled"
  | "appointment_completed"
  | "fee_updated"
  | "procedure_set"
  | "discount_applied"
  | "refund_applied"
  | "visit_record_created"
  | "visit_record_updated"
  | "waitlist_added"
  | "waitlist_removed"
  | "walkin_created"
  | "procedure_created"
  | "procedure_updated"
  | "procedure_deleted"
  | "doctor_added"
  | "doctor_removed"
  | "receptionist_added"
  | "receptionist_removed"
  | "document_uploaded"
  | "document_deleted"
  | "schedule_updated"
  | "leave_added"
  | "leave_deleted"
  | "allergy_created"
  | "allergy_updated"
  | "allergy_deleted"
  | "disease_created"
  | "disease_updated"
  | "disease_deleted"
  | "icd_code_created"
  | "icd_code_updated"
  | "icd_code_deleted"
  | "template_created"
  | "template_updated"
  | "template_deleted"
  | "expense_created"
  | "expense_updated"
  | "expense_deleted"
  | "specialization_created"
  | "specialization_updated"
  | "specialization_deleted";

export type EntityType = "patient" | "appointment" | "visit_record" | "waitlist" | "procedure" | "doctor" | "receptionist" | "document" | "schedule" | "leave" | "allergy" | "disease" | "icd_code" | "template" | "expense" | "specialization";

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
    patient_updated: "Updated Patient",
    patient_deleted: "Deleted Patient",
    appointment_created: "Created Appointment",
    appointment_updated: "Updated Appointment",
    appointment_cancelled: "Cancelled Appointment",
    appointment_completed: "Completed Appointment",
    fee_updated: "Updated Fee",
    procedure_set: "Set Procedure",
    discount_applied: "Applied Discount",
    refund_applied: "Applied Refund",
    visit_record_created: "Created Visit Record",
    visit_record_updated: "Updated Visit Record",
    waitlist_added: "Added to Waitlist",
    waitlist_removed: "Removed from Waitlist",
    walkin_created: "Created Walk-in",
    procedure_created: "Created Procedure",
    procedure_updated: "Updated Procedure",
    procedure_deleted: "Deleted Procedure",
    doctor_added: "Added Doctor",
    doctor_removed: "Removed Doctor",
    receptionist_added: "Added Receptionist",
    receptionist_removed: "Removed Receptionist",
    document_uploaded: "Uploaded Document",
    document_deleted: "Deleted Document",
    schedule_updated: "Updated Schedule",
    leave_added: "Added Leave",
    leave_deleted: "Deleted Leave",
    allergy_created: "Created Allergy",
    allergy_updated: "Updated Allergy",
    allergy_deleted: "Deleted Allergy",
    disease_created: "Created Disease",
    disease_updated: "Updated Disease",
    disease_deleted: "Deleted Disease",
    icd_code_created: "Created ICD Code",
    icd_code_updated: "Updated ICD Code",
    icd_code_deleted: "Deleted ICD Code",
    template_created: "Created Template",
    template_updated: "Updated Template",
    template_deleted: "Deleted Template",
    expense_created: "Created Expense",
    expense_updated: "Updated Expense",
    expense_deleted: "Deleted Expense",
    specialization_created: "Created Specialization",
    specialization_updated: "Updated Specialization",
    specialization_deleted: "Deleted Specialization",
  };
  return labels[action] || action;
};

export const getActionColor = (action: string): string => {
  if (action.includes("created") || action.includes("added") || action.includes("uploaded")) {
    return "text-green-600 bg-green-100";
  }
  if (action.includes("deleted") || action.includes("removed") || action.includes("cancelled")) {
    return "text-red-600 bg-red-100";
  }
  if (action.includes("updated") || action.includes("completed")) {
    return "text-blue-600 bg-blue-100";
  }
  if (action.includes("refund") || action.includes("discount")) {
    return "text-orange-600 bg-orange-100";
  }
  return "text-gray-600 bg-gray-100";
};
