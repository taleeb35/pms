import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";
import { activeRegion } from "@/lib/region";

// Turn a stored phone number (local like "03001234567" or international "+9715...") into call / WhatsApp links.
const toE164 = (phone?: string | null): string | null => {
  const v = (phone || "").trim();
  if (!v) return null;
  const p = v.startsWith("+")
    ? parsePhoneNumberFromString(v)
    : parsePhoneNumberFromString(v, activeRegion().country_code as CountryCode);
  return p?.isPossible() ? p.number : null;
};

export const telLink = (phone?: string | null) => { const n = toE164(phone); return n ? `tel:${n}` : null; };
export const whatsappLink = (phone?: string | null, text?: string) => {
  const n = toE164(phone);
  if (!n) return null;
  return `https://wa.me/${n.replace("+", "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
