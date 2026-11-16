import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { balanceDue } from "@/lib/revenue";
import { money } from "@/lib/region";
import { friendlyDate } from "@/lib/datetime";

// Outstanding balance for a patient: visits where a part payment was recorded and something is still owed.
// Shows nothing when the patient owes nothing.
export default function PatientBalance({ patientId, refreshKey }: { patientId: string; refreshKey?: unknown }) {
  const [owed, setOwed] = useState<{ id: string; date: string; due: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("appointments")
        .select("id, appointment_date, status, consultation_fee, other_fee, procedure_fee, refund, amount_paid")
        .eq("patient_id", patientId).not("amount_paid", "is", null).order("appointment_date", { ascending: false }).limit(500);
      setOwed(((data || []) as any[]).map((a) => ({ id: a.id, date: a.appointment_date, due: balanceDue(a) })).filter((a) => a.due > 0));
    })();
  }, [patientId, refreshKey]);

  if (!owed.length) return null;
  const total = owed.reduce((s, a) => s + a.due, 0);
  return (
    <Card className="border-l-4 border-l-destructive">
      <CardContent className="p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-destructive" />
          <span className="font-semibold">Balance due: {money(total)}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {owed.slice(0, 4).map((a) => `${friendlyDate(a.date)} ${money(a.due)}`).join(" · ")}{owed.length > 4 ? ` · +${owed.length - 4} more` : ""}
        </span>
      </CardContent>
    </Card>
  );
}
