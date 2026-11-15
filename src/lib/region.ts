// Region helpers: countries, currencies, timezones, money formatting and
// country-dependent labels. Settings come from get_my_region() (see RegionContext).
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";

export type Region = {
  country_code: string;   // ISO 3166-1 alpha-2, e.g. "PK", "AE", "GB"
  currency_code: string;  // ISO 4217, e.g. "PKR", "AED", "USD"
  timezone: string;       // IANA, e.g. "Asia/Karachi"
  can_edit?: boolean;
  owner_type?: "clinic" | "doctor" | null;
};

export const DEFAULT_REGION: Region = { country_code: "PK", currency_code: "PKR", timezone: "Asia/Karachi" };

const regionNames = typeof Intl !== "undefined" && (Intl as any).DisplayNames
  ? new (Intl as any).DisplayNames(["en"], { type: "region" }) : null;

export const countryName = (code?: string | null) => {
  if (!code) return "";
  try { return regionNames?.of(code) || code; } catch { return code; }
};

export type CountryOption = { code: string; name: string; dial: string };
let _countries: CountryOption[] | null = null;
export const countryOptions = (): CountryOption[] => {
  if (_countries) return _countries;
  _countries = getCountries()
    .map((c) => ({ code: c, name: countryName(c), dial: `+${getCountryCallingCode(c as CountryCode)}` }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return _countries;
};

export const dialCode = (country?: string | null) => {
  try { return country ? `+${getCountryCallingCode(country as CountryCode)}` : ""; } catch { return ""; }
};

// Usual currency for common countries (used to pre-fill the currency when the country changes).
const COUNTRY_CURRENCY: Record<string, string> = {
  PK: "PKR", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR", GB: "GBP", US: "USD", CA: "CAD",
  AU: "AUD", NZ: "NZD", IN: "INR", BD: "BDT", LK: "LKR", NP: "NPR", AF: "AFN", EG: "EGP", JO: "JOD", TR: "TRY",
  MY: "MYR", SG: "SGD", ID: "IDR", PH: "PHP", NG: "NGN", KE: "KES", ZA: "ZAR", IE: "EUR", DE: "EUR", FR: "EUR",
  ES: "EUR", IT: "EUR", NL: "EUR", BE: "EUR", PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", MX: "MXN", BR: "BRL",
  AR: "ARS", CO: "COP", CL: "CLP", PE: "PEN", CN: "CNY", JP: "JPY", KR: "KRW", TH: "THB", VN: "VND", CH: "CHF",
  SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", MA: "MAD", DZ: "DZD", TN: "TND", IQ: "IQD", IR: "IRR", LB: "LBP",
};
export const currencyForCountry = (country?: string | null) => (country && COUNTRY_CURRENCY[country]) || "USD";

export const currencyOptions = (): string[] => {
  try {
    const list = (Intl as any).supportedValuesOf?.("currency") as string[] | undefined;
    if (list?.length) return list;
  } catch { /* older browsers */ }
  return Array.from(new Set(Object.values(COUNTRY_CURRENCY))).sort();
};

export const timezoneOptions = (): string[] => {
  try {
    const list = (Intl as any).supportedValuesOf?.("timeZone") as string[] | undefined;
    if (list?.length) return list;
  } catch { /* older browsers */ }
  return ["Asia/Karachi", "Asia/Dubai", "Asia/Riyadh", "Europe/London", "America/New_York", "UTC"];
};

/** Short currency label, e.g. "Rs." for PKR, "AED", "$", "£". */
export const currencySymbol = (currency: string = DEFAULT_REGION.currency_code): string => {
  if (currency === "PKR") return "Rs.";
  try {
    const parts = new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).formatToParts(0);
    const sym = parts.find((p) => p.type === "currency")?.value || currency;
    // PDF fonts only cover basic Latin characters; use the code (e.g. "INR") for other signs.
    return /[^ -ÿ]/.test(sym) ? currency : sym;
  } catch { return currency; }
};

/** Money with the account's currency, e.g. "Rs. 1,500", "AED 1,500", "$1,500". */
export const formatMoney = (amount: number | string | null | undefined, currency: string = DEFAULT_REGION.currency_code): string => {
  const n = Number(amount) || 0;
  const num = n.toLocaleString("en", { maximumFractionDigits: 2 });
  const sym = currencySymbol(currency);
  return /^[A-Za-z.]+$/.test(sym) ? `${sym} ${num}` : `${sym}${num}`;
};

// A2: country-dependent labels for licence number and national ID.
export const licenceLabel = (country?: string | null) => (country === "PK" ? "PMDC Number" : "Medical licence number");
export const nationalIdLabel = (country?: string | null) => (country === "PK" ? "CNIC" : "National ID");

// ---- Active region (set by RegionProvider) for code outside React: PDFs, prints, helpers.
let active: Region = DEFAULT_REGION;
export const setActiveRegion = (r: Region) => { active = { ...DEFAULT_REGION, ...r }; };
export const activeRegion = () => active;
/** Format an amount in the signed-in account's currency. */
export const money = (amount: number | string | null | undefined) => formatMoney(amount, active.currency_code);
/** Currency label of the signed-in account, e.g. "Rs.", "AED", "$". */
export const moneySymbol = () => currencySymbol(active.currency_code);

/** Current wall-clock date/time in the account's timezone (appointment times are stored as clinic wall-clock time). */
export const zonedNow = (tz: string = active.timezone) => {
  let parts: Intl.DateTimeFormatPart[] = [];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
  } catch { /* unknown timezone: fall back to the browser clock */ }
  const g = (t: string) => parts.find((x) => x.type === t)?.value;
  if (!g("year")) {
    const d = new Date();
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return { ymd, hm, asLocalDate: d };
  }
  const ymd = `${g("year")}-${g("month")}-${g("day")}`;
  const hm = `${g("hour") === "24" ? "00" : g("hour")}:${g("minute")}`;
  return { ymd, hm, asLocalDate: new Date(`${ymd}T${hm}:00`) };
};

// A2 helpers bound to the signed-in account's country.
export const idLabel = () => nationalIdLabel(active.country_code);
export const idPlaceholder = () =>
  active.country_code === "PK" ? "Enter CNIC (e.g., 12345-1234567-1)" : "Enter national ID number (optional)";
export const licLabel = () => licenceLabel(active.country_code);
export const isPakistan = () => active.country_code === "PK";

/** A5: possible phone number for its country; local numbers (no "+") use the account country. */
export const isPossiblePhone = (value: string): boolean => {
  const v = (value || "").trim();
  if (!v) return false;
  const p = v.startsWith("+") ? parsePhoneNumberFromString(v) : parsePhoneNumberFromString(v, active.country_code as CountryCode);
  return !!p && p.isPossible();
};
