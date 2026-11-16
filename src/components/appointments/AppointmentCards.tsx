import type { ReactNode } from "react";
import { ChevronRight, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneWithActions } from "@/components/patients/PhoneActions";
import { friendlyDate, friendlyTime } from "@/lib/datetime";

// Phone layout for appointment lists: one tappable card per appointment instead of a wide table.
type Apt = {
  id: string; appointment_date: string; appointment_time: string; appointment_type?: string | null;
  patients?: { full_name?: string | null; phone?: string | null } | null;
  doctors?: { profiles?: { full_name?: string | null } | null } | null;
};

type Props<T extends Apt> = {
  items: T[];
  loading: boolean;
  onOpen: (a: T) => void;
  badge: (a: T) => ReactNode;
  number?: (a: T) => number | undefined;
  showDoctor?: boolean;
  empty: ReactNode;
};

export function AppointmentCards<T extends Apt>({ items, loading, onOpen, badge, number, showDoctor, empty }: Props<T>) {
  if (loading) return <div className="space-y-2 md:hidden">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (items.length === 0) return <div className="md:hidden">{empty}</div>;
  return (
    <ul className="space-y-2 md:hidden">
      {items.map((a) => (
        <li key={a.id}>
          <div role="button" tabIndex={0} onClick={() => onOpen(a)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(a); }}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 active:bg-muted">
            <div className="flex w-14 shrink-0 flex-col items-center rounded-md bg-primary/10 py-1.5 text-primary">
              <span className="text-sm font-semibold leading-tight">{friendlyTime(a.appointment_time).replace(" ", " ")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-medium">{a.patients?.full_name || "Patient"}</p>
                {a.appointment_type === "video_consultation" && <Video className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {friendlyDate(a.appointment_date)}
                {number?.(a) ? ` · #${number(a)}` : ""}
                {showDoctor && a.doctors?.profiles?.full_name ? ` · ${a.doctors.profiles.full_name}` : ""}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {badge(a)}
                <PhoneWithActions phone={a.patients?.phone} />
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default AppointmentCards;
