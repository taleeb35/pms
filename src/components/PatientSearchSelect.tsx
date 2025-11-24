import { useState, useMemo } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  phone: string;
}

interface PatientSearchSelectProps {
  patients: Patient[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  waitlistPatientIds?: Set<string>;
}

export function PatientSearchSelect({ 
  patients, 
  value, 
  onValueChange,
  placeholder = "Search patient...",
  waitlistPatientIds
}: PatientSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    
    const query = searchQuery.toLowerCase();
    return patients.filter(patient => 
      patient.full_name.toLowerCase().includes(query) ||
      patient.phone.includes(query) ||
      patient.patient_id.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  const selectedPatient = patients.find(p => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPatient ? (
            <span className="flex items-center gap-2">
              {selectedPatient.full_name} ({selectedPatient.patient_id})
              {waitlistPatientIds?.has(selectedPatient.id) && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Waitlist
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search by name, phone, or ID..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No patient found.</CommandEmpty>
            <CommandGroup>
              {filteredPatients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{patient.full_name}</span>
                      <span className="text-xs text-muted-foreground">({patient.patient_id})</span>
                      {waitlistPatientIds?.has(patient.id) && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Waitlist
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{patient.phone}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
