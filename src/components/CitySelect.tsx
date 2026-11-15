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
import { activeRegion, countryOptions } from "@/lib/region";

const pakistanCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot",
  "Sargodha", "Bahawalpur", "Sukkur", "Larkana", "Hyderabad",
  "Mardan", "Mingora", "Abbottabad", "Dera Ghazi Khan", "Sahiwal",
  "Nawabshah", "Jhang", "Rahim Yar Khan", "Kasur", "Gujrat",
  "Sheikhupura", "Dera Ismail Khan", "Mirpur Khas", "Okara", "Chiniot",
  "Kamoke", "Mandi Bahauddin", "Jhelum", "Sadiqabad", "Jacobabad",
  "Shikarpur", "Khanewal", "Hafizabad", "Kohat", "Muzaffargarh",
  "Khanpur", "Gojra", "Mandi Burewala", "Daska", "Vehari",
  "Malakand", "Narowal", "Nowshera", "Khushab"
].sort();

interface CitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
  showAllOption?: boolean;
  /** A6: when given, a country picker is shown next to the city (ISO code, e.g. "PK"). */
  country?: string | null;
  onCountryChange?: (code: string) => void;
}

export const CitySelect = ({ value, onValueChange, label = "City", required = false, showAllOption = false, country, onCountryChange }: CitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // A6: Pakistani city suggestions only for Pakistan; any city can be typed in.
  const effectiveCountry = country || activeRegion().country_code;
  const suggestions = effectiveCountry === "PK" ? pakistanCities : [];

  const allOptions = showAllOption 
    ? [{ value: "all", label: "All Cities" }, ...suggestions.map(city => ({ value: city, label: city }))]
    : suggestions.map(city => ({ value: city, label: city }));
  const typed = search.trim();
  const showCustom = typed.length > 1 && !allOptions.some(o => o.label.toLowerCase() === typed.toLowerCase());

  const selectedCity = allOptions.find(option => option.value === value) || (value && value !== "all" ? { value, label: value } : undefined);

  return (
    <div className="space-y-2">
      {label && <Label>{label}{required && " *"}</Label>}
      <div className="flex gap-2">
      {onCountryChange && (
        <select
          aria-label="Country"
          className="h-10 w-[140px] shrink-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={effectiveCountry}
          onChange={(e) => onCountryChange(e.target.value)}
        >
          {countryOptions().map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full min-w-0 justify-between bg-background font-normal"
          >
            <span className="truncate">{selectedCity ? selectedCity.label : (suggestions.length ? "Select a city" : "Type a city")}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background z-50" align="start">
          <Command>
            <CommandInput placeholder={suggestions.length ? "Search or type a city..." : "Type a city..."} className="h-9" value={search} onValueChange={setSearch} />
            <CommandList className="max-h-[200px] overflow-y-auto">
              {!showCustom && <CommandEmpty>{suggestions.length ? "No city found. Keep typing to use your own." : "Type the city name."}</CommandEmpty>}
              <CommandGroup>
                {showCustom && (
                  <CommandItem value={`__custom__ ${typed}`} onSelect={() => { onValueChange(typed); setSearch(""); setOpen(false); }}>
                    Use "{typed}"
                  </CommandItem>
                )}
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
    </div>
  );
};
