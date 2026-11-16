import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneWithActions } from "@/components/patients/PhoneActions";
import { differenceInYears } from "date-fns";
import type { ReactNode } from "react";

// Phone layout for patient lists: one tappable card per patient instead of a wide table.
type P = { id: string; full_name: string; patient_id?: string | null; phone?: string | null; gender?: string | null; date_of_birth?: string | null };

export function PatientCards<T extends P>({ items, loading, onOpen, empty }: { items: T[]; loading: boolean; onOpen: (p: T) => void; empty: ReactNode }) {
  if (loading) return <div className="space-y-2 md:hidden">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (items.length === 0) return <div className="md:hidden">{empty}</div>;
  return (
    <ul className="space-y-2 md:hidden">
      {items.map((p) => {
        const age = p.date_of_birth ? differenceInYears(new Date(), new Date(p.date_of_birth)) : null;
        return (
          <li key={p.id}>
            <div role="button" tabIndex={0} onClick={() => onOpen(p)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(p); }}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 active:bg-muted">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                {p.full_name.trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[p.patient_id, p.gender && p.gender.charAt(0).toUpperCase() + p.gender.slice(1), age !== null && !isNaN(age) ? `${age} yrs` : null].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-1" onClick={(e) => e.stopPropagation()}><PhoneWithActions phone={p.phone} /></div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
export default PatientCards;
