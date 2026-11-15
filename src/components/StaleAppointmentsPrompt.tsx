import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { zonedNow } from "@/lib/region";

// B8: dashboard prompt for past appointments still marked Scheduled/Started.
// Access rules already limit the count to the signed-in doctor's or clinic's appointments.
const StaleAppointmentsPrompt = ({ to }: { to: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const ymd = zonedNow().ymd; // "today" in the clinic's timezone
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .in("status", ["scheduled", "start"])
      .lt("appointment_date", ymd)
      .then(({ count: c }) => { if (alive) setCount(c || 0); });
    return () => { alive = false; };
  }, []);

  if (!count) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
      <span className="flex-1 min-w-0">
        {count} past appointment{count === 1 ? " is" : "s are"} still marked Scheduled. Mark each one completed, cancelled or no-show.
      </span>
      <Link to={`${to}?status=needs_update`} className="font-medium text-amber-700 underline underline-offset-2">
        Review appointments
      </Link>
    </div>
  );
};

export default StaleAppointmentsPrompt;
