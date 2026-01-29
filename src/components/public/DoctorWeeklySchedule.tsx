import { Clock, CheckCircle, XCircle } from "lucide-react";

interface ScheduleDay {
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

const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { day: "Monday", dayShort: "Mon", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Tuesday", dayShort: "Tue", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Wednesday", dayShort: "Wed", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Thursday", dayShort: "Thu", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Friday", dayShort: "Fri", isAvailable: true, startTime: "09:00 AM", endTime: "05:00 PM" },
  { day: "Saturday", dayShort: "Sat", isAvailable: true, startTime: "10:00 AM", endTime: "02:00 PM" },
  { day: "Sunday", dayShort: "Sun", isAvailable: false },
];

const DoctorWeeklySchedule = ({ timing, scheduleData }: DoctorWeeklyScheduleProps) => {
  // Parse timing string if no schedule data provided
  const schedule = scheduleData || DEFAULT_SCHEDULE;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Available Timings
      </h3>
      
      {timing && (
        <p className="text-sm text-muted-foreground mb-4 bg-muted/50 rounded-lg px-3 py-2">
          {timing}
        </p>
      )}

      <div className="space-y-2">
        {schedule.map((day) => (
          <div
            key={day.day}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              day.isAvailable 
                ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20" 
                : "bg-muted/50 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              {day.isAvailable ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={`font-medium ${day.isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                {day.day}
              </span>
            </div>
            <span className={`text-sm ${day.isAvailable ? "text-green-700 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
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
