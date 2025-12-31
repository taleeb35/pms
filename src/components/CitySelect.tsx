import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const pakistanCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot",
  "Sargodha", "Bahawalpur", "Sukkur", "Larkana", "Hyderabad",
  "Mardan", "Mingora", "Abbottabad", "Dera Ghazi Khan", "Sahiwal",
  "Nawabshah", "Jhang", "Rahim Yar Khan", "Kasur", "Gujrat",
  "Sheikhupura", "Dera Ismail Khan", "Mirpur Khas", "Okara", "Chiniot",
  "Kamoke", "Mandi Bahauddin", "Jhelum", "Sadiqabad", "Jacobabad",
  "Shikarpur", "Khanewal", "Hafizabad", "Kohat", "Muzaffargarh",
  "Khanpur", "Gojra", "Mandi Burewala", "Daska", "Vehari"
].sort();

interface CitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
  showAllOption?: boolean;
}

export const CitySelect = ({ value, onValueChange, label = "City", required = false, showAllOption = false }: CitySelectProps) => {
  const [open, setOpen] = useState(false);

  const allOptions = showAllOption 
    ? [{ value: "all", label: "All Cities" }, ...pakistanCities.map(city => ({ value: city, label: city }))]
    : pakistanCities.map(city => ({ value: city, label: city }));

  const selectedCity = allOptions.find(option => option.value === value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}{required && " *"}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background font-normal"
          >
            {selectedCity ? selectedCity.label : "Select a city"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background z-50" align="start">
          <Command>
            <CommandInput placeholder="Search city..." className="h-9" />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {allOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
