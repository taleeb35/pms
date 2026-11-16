import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserCheck } from "lucide-react";
import { subYears } from "date-fns";
import { Input } from "@/components/ui/input";
import { findDuplicatePatients, type DuplicatePatient } from "@/lib/patientDuplicates";

/** Shows "Already a patient" as soon as the typed phone matches an existing record. */
export const DuplicatePatientHint = ({ phone, base }: { phone?: string; base: string }) => {
  const [matches, setMatches] = useState<DuplicatePatient[]>([]);
  useEffect(() => {
    const digits = (phone || "").replace(/\D/g, "");
    if (digits.length < 8) { setMatches([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const res = await findDuplicatePatients(phone || "", "");
        if (alive) setMatches(res.byPhone.slice(0, 3));
      } catch { /* ignore */ }
    }, 400);
    return () => { alive = false; clearTimeout(t); };
  }, [phone]);
  if (!matches.length) return null;
  return (
    <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs">
      <p className="flex items-center gap-1 font-medium"><UserCheck className="h-3.5 w-3.5" /> Already a patient with this number:</p>
      <ul className="mt-1 space-y-0.5">
        {matches.map((m) => (
          <li key={m.id}>
            <Link to={`${base}/patients/${m.id}`} className="text-primary underline underline-offset-2">{m.full_name}</Link>
            {m.patient_id ? <span className="text-muted-foreground"> · {m.patient_id}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

/** "or enter age" — fills the date of birth when only the age is known. */
export const AgeQuickPick = ({ onPick }: { onPick: (dob: Date) => void }) => {
  const [age, setAge] = useState("");
  return (
    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
      <span>or age</span>
      <Input
        inputMode="numeric" value={age} placeholder="e.g. 34" aria-label="Age in years"
        className="h-7 w-16 text-xs"
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 3);
          setAge(v);
          const n = Number(v);
          if (v && n > 0 && n < 130) onPick(subYears(new Date(), n));
        }}
      />
      <span>years</span>
    </div>
  );
};
