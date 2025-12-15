import { useState, useMemo } from "react";
import { Clock, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

const TimeSelect = ({
  value,
  onValueChange,
  placeholder = "Select time",
  disabled = false,
  name,
  required = false,
}: TimeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Generate time slots with 30-minute intervals
  const timeSlots = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const hours = Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      const time24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Convert to 12-hour format for display
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const time12 = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
      
      return { value: time24, label: time12, searchText: `${time24} ${time12}`.toLowerCase() };
    });
  }, []);

  // Filter time slots based on search query
  const filteredTimeSlots = useMemo(() => {
    if (!searchQuery.trim()) return timeSlots;
    const query = searchQuery.toLowerCase().trim();
    return timeSlots.filter(slot => slot.searchText.includes(query));
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
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {selectedLabel || placeholder}
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
                  No time found
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

export { TimeSelect };
