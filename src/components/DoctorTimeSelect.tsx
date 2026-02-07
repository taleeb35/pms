import { useState, useEffect, useMemo } from "react";
import { Clock, Search, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAvailableTimeSlots, checkDoctorAvailability } from "@/lib/appointmentUtils";

interface DoctorTimeSelectProps {
  doctorId: string;
  selectedDate?: Date;
  value?: string;
  onValueChange: (value: string) => void;
  onLeaveStatusChange?: (isOnLeave: boolean, leaveInfo?: { leaveType?: string; reason?: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

const DoctorTimeSelect = ({
  doctorId,
  selectedDate,
  value,
  onValueChange,
  onLeaveStatusChange,
  placeholder = "Select time",
  disabled = false,
  name,
  required = false,
}: DoctorTimeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeSlots, setTimeSlots] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      // Don't show any slots until both doctor and date are selected
      if (!doctorId || !selectedDate) {
        setTimeSlots([]);
        setIsUnavailable(false);
        setUnavailableReason(null);
        onLeaveStatusChange?.(false);
        return;
      }

      setLoading(true);
      try {
        // Format date properly to avoid timezone issues
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Check availability (includes leave and schedule check)
        const availability = await checkDoctorAvailability(doctorId, dateStr);
        const isNotAvailable = !availability.available;
        setIsUnavailable(isNotAvailable);
        setUnavailableReason(isNotAvailable ? (availability.reason || "Doctor is not available") : null);
        onLeaveStatusChange?.(isNotAvailable, isNotAvailable ? { leaveType: availability.leaveType, reason: availability.reason } : undefined);

        // Get available slots
        const slots = await getAvailableTimeSlots(doctorId, dateStr);
        setTimeSlots(slots);

        // Clear value if the current value is not in available slots
        if (value && slots.length > 0 && !slots.find(s => s.value === value)) {
          onValueChange("");
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [doctorId, selectedDate]);

  // Filter time slots based on search query
  const filteredTimeSlots = useMemo(() => {
    if (!searchQuery.trim()) return timeSlots;
    const query = searchQuery.toLowerCase().trim();
    return timeSlots.filter(slot => 
      slot.value.includes(query) || slot.label.toLowerCase().includes(query)
    );
  }, [timeSlots, searchQuery]);

  // Get display label for selected value
  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const slot = timeSlots.find(s => s.value === value);
    return slot ? `${slot.value} (${slot.label})` : value;
  }, [value, timeSlots]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearchQuery("");
  };

  const isDisabled = disabled || loading || !doctorId || !selectedDate || (isUnavailable && timeSlots.length === 0);

  return (
    <>
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value || ""} required={required} />}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isDisabled}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              isUnavailable && timeSlots.length === 0 && "border-destructive"
            )}
          >
            <div className="flex items-center gap-2">
              {isUnavailable && timeSlots.length === 0 ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {loading ? "Loading..." : 
                (!doctorId || !selectedDate) ? "Select date first" :
                (isUnavailable && timeSlots.length === 0) ? (unavailableReason || "Doctor not available") : 
                (selectedLabel || placeholder)}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0 bg-popover" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[280px]">
            <div className="p-1">
              {filteredTimeSlots.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {timeSlots.length === 0 ? "No available time slots" : "No time found"}
                </div>
              ) : (
                filteredTimeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => handleSelect(slot.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                      value === slot.value && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <span className="font-medium">{slot.value}</span>
                    <span className="ml-2 text-muted-foreground">({slot.label})</span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
};

export { DoctorTimeSelect };