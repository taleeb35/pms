import { forwardRef, useMemo, useState, useEffect, type ChangeEvent } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { activeRegion, countryOptions, dialCode } from "@/lib/region";

// A5: phone number with a country-code picker. Drop-in for <Input> on phone fields:
// it calls onChange with an input-like event whose value is
//   - the number as typed, when the country is the account's own country (e.g. "03001234567"), or
//   - "+<country code><number>" for any other country (e.g. "+971501234567").
// Existing local numbers therefore keep their stored format and duplicate matching keeps working.

type Props = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  value?: string | null;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const fakeEvent = (value: string) => ({ target: { value }, currentTarget: { value } }) as unknown as ChangeEvent<HTMLInputElement>;

const splitValue = (value: string, home: string): { country: string; national: string } => {
  const v = (value || "").trim();
  if (v.startsWith("+")) {
    const p = parsePhoneNumberFromString(v);
    if (p?.country) return { country: p.country, national: p.nationalNumber };
    return { country: home, national: v };
  }
  return { country: home, national: v };
};

const PhoneInput = forwardRef<HTMLInputElement, Props>(({ value, onChange, className, placeholder, disabled, ...rest }, ref) => {
  const home = activeRegion().country_code;
  const initial = splitValue(String(value ?? ""), home);
  const [country, setCountry] = useState(initial.country);
  const countries = useMemo(countryOptions, []);

  // Follow external value changes (e.g. form reset or loading a patient).
  useEffect(() => {
    const s = splitValue(String(value ?? ""), home);
    if (String(value ?? "").startsWith("+")) setCountry(s.country);
    else if (!value) setCountry(home);
  }, [value, home]);

  const national = country === home ? String(value ?? "") : splitValue(String(value ?? ""), home).national;

  const emit = (nextCountry: string, nextNational: string) => {
    const digits = nextNational.replace(/[^0-9\s\-()]/g, "");
    if (nextCountry === home || !digits.trim()) onChange?.(fakeEvent(digits));
    else onChange?.(fakeEvent(`${dialCode(nextCountry)}${digits.replace(/\D/g, "").replace(/^0+/, "")}`));
  };

  return (
    <div className={cn("flex gap-2", className?.includes("w-") ? "" : "w-full")}>
      <select
        aria-label="Country code"
        className="h-10 w-[96px] shrink-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        value={country}
        disabled={disabled}
        onChange={(e) => { setCountry(e.target.value); emit(e.target.value, national); }}
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>{c.code} {c.dial}</option>
        ))}
      </select>
      <Input
        ref={ref}
        {...rest}
        type="tel"
        inputMode="tel"
        disabled={disabled}
        className={cn("flex-1 min-w-0", className)}
        placeholder={country === home ? placeholder : "Phone number"}
        value={national}
        onChange={(e) => emit(country, e.target.value)}
      />
    </div>
  );
});
PhoneInput.displayName = "PhoneInput";

export default PhoneInput;

export { isPossiblePhone } from "@/lib/region";
