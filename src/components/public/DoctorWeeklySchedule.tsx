import { useMemo } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export interface ScheduleDay {
  day: string;
  dayShort: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

interface DoctorWeeklyScheduleProps {
  timing?: string | null;
  scheduleData?: ScheduleDay[];
}

const DAYS: Array<{ day: ScheduleDay["day"]; dayShort: ScheduleDay["dayShort"] }> = [
  { day: "Sunday", dayShort: "Sun" },
  { day: "Monday", dayShort: "Mon" },
  { day: "Tuesday", dayShort: "Tue" },
  { day: "Wednesday", dayShort: "Wed" },
  { day: "Thursday", dayShort: "Thu" },
  { day: "Friday", dayShort: "Fri" },
  { day: "Saturday", dayShort: "Sat" },
];

const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { day: "Sunday", dayShort: "Sun", isAvailable: false },
  { day: "Monday", dayShort: "Mon", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Tuesday", dayShort: "Tue", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Wednesday", dayShort: "Wed", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Thursday", dayShort: "Thu", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Friday", dayShort: "Fri", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Saturday", dayShort: "Sat", isAvailable: true, startTime: "10:00 AM", endTime: "02:00 PM" },
];

function parseTimingString(timing?: string | null): ScheduleDay[] | null {
  if (!timing) return null;

  const lines = timing
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const map = new Map<string, { isAvailable: boolean; startTime?: string; endTime?: string }>();
  const dayEntries: Array<[string, string]> = [
    ...DAYS.map((d) => [d.day.toLowerCase(), d.day] as [string, string]),
    ...DAYS.map((d) => [d.dayShort.toLowerCase(), d.day] as [string, string]),
  ];
  const dayNames = new Map<string, string>(dayEntries);

  for (const line of lines) {
    const m = line.match(/^([A-Za-z]+)\s*:\s*(.+)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const canonicalDay = dayNames.get(key);
    if (!canonicalDay) continue;

    const value = m[2].trim();
    const isClosed = /\bclosed\b/i.test(value);
    if (isClosed) {
      map.set(canonicalDay, { isAvailable: false });
      continue;
    }

    // Accept both hyphen and en-dash separators
    const range = value.split(/\s*[-–]\s*/);
    if (range.length >= 2) {
      map.set(canonicalDay, {
        isAvailable: true,
        startTime: range[0]?.trim(),
        endTime: range[1]?.trim(),
      });
    } else {
      // Fallback: treat unknown format as available without strict time range
      map.set(canonicalDay, { isAvailable: true });
    }
  }

  // If we didn't parse any valid day lines, return null
  if (map.size === 0) return null;

  return DAYS.map(({ day, dayShort }) => {
    const parsed = map.get(day);
    if (!parsed) return { day, dayShort, isAvailable: false };
    return {
      day,
      dayShort,
      isAvailable: parsed.isAvailable,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
    };
  });
}

const DoctorWeeklySchedule = ({ timing, scheduleData }: DoctorWeeklyScheduleProps) => {
  const parsedFromTiming = useMemo(() => parseTimingString(timing), [timing]);
  const schedule = scheduleData || parsedFromTiming || DEFAULT_SCHEDULE;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Available Timings
      </h3>
      
      <div className="space-y-2">
        {schedule.map((day) => (
          <div
            key={day.day}
            className={
              day.isAvailable
                ? "flex items-center justify-between px-4 py-3 rounded-lg transition-colors bg-primary/5 border border-primary/20"
                : "flex items-center justify-between px-4 py-3 rounded-lg transition-colors bg-muted/30 border border-transparent"
            }
          >
            <div className="flex items-center gap-3">
              {day.isAvailable ? (
                <CheckCircle className="h-4 w-4 text-primary" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={`font-medium ${day.isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                {day.day}
              </span>
            </div>
            <span className={`text-sm ${day.isAvailable ? "text-primary font-medium" : "text-muted-foreground"}`}>
              {day.isAvailable && day.startTime && day.endTime
                ? `${day.startTime} - ${day.endTime}`
                : "Closed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorWeeklySchedule;
