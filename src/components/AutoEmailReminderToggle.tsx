import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useBillingState } from "@/lib/billing";

// Automatic email reminders (the day before, from 9 AM) for patients with an email address.
// The clinic owner or the single doctor can switch them off; staff see the current setting.
export default function AutoEmailReminderToggle() {
  const { toast } = useToast();
  const { state } = useBillingState(true);
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const table = state?.kind === "clinic" ? "clinics" : "doctors";

  useEffect(() => {
    if (!state?.owner_id) return;
    (supabase as any).from(table).select("auto_email_reminders").eq("id", state.owner_id).maybeSingle()
      .then(({ data }: any) => setOn(data ? data.auto_email_reminders !== false : true));
  }, [state?.owner_id, table]);

  if (!state || on === null) return null;

  const change = async (v: boolean) => {
    setBusy(true);
    const { error } = await (supabase as any).from(table).update({ auto_email_reminders: v }).eq("id", state.owner_id);
    setBusy(false);
    if (error) { toast({ title: "Could not save", description: error.message, variant: "destructive" }); return; }
    setOn(v);
    toast({ title: v ? "Automatic email reminders on" : "Automatic email reminders off" });
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="flex-1 text-sm">
        <p className="font-medium">Automatic email reminders</p>
        <p className="text-xs text-muted-foreground">
          Patients with an email address get a reminder the day before their appointment, from 9 AM.
          {!state.is_owner && " Only the account owner can change this."}
        </p>
      </div>
      <Switch checked={on} onCheckedChange={change} disabled={busy || !state.is_owner} aria-label="Automatic email reminders" />
    </div>
  );
}
