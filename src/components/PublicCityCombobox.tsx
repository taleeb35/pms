import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";

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

type Option = { value: string; label: string };

interface PublicCityComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  cities: string[];
  includeAllOption?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  triggerClassName?: string;
}

export default function PublicCityCombobox({
  value,
  onValueChange,
  cities,
  includeAllOption = true,
  placeholder = "Select city",
  searchPlaceholder = "Search city...",
  className,
  triggerClassName,
}: PublicCityComboboxProps) {
  const [open, setOpen] = useState(false);

  const options = useMemo<Option[]>(() => {
    const base = cities.map((c) => ({ value: c, label: c }));
    return includeAllOption
      ? [{ value: "all", label: "All Cities" }, ...base]
      : base;
  }, [cities, includeAllOption]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-11 w-full justify-between bg-background px-3 font-normal",
              triggerClassName
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              {!triggerClassName && <MapPin className="h-4 w-4 text-muted-foreground" />}
              <span className="truncate">
                {selected ? selected.label : placeholder}
              </span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0 z-50"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-11" />
            <CommandList className="max-h-[240px]">
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
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
                        value === option.value ? "opacity-100" : "opacity-0",
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
}
