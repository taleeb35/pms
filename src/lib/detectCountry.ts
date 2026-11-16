// Works out the visitor's country from the browser's timezone. No outside service and no
// network call (ipapi.co refused our requests, so everyone was treated as Pakistan).
export type Country = "PK" | "US" | "OTHER";

const US_ZONES = new Set([
  "America/New_York", "America/Detroit", "America/Chicago", "America/Denver", "America/Phoenix",
  "America/Los_Angeles", "America/Anchorage", "America/Juneau", "America/Sitka", "America/Nome",
  "America/Yakutat", "America/Metlakatla", "America/Adak", "America/Boise", "America/Menominee",
  "Pacific/Honolulu", "US/Eastern", "US/Central", "US/Mountain", "US/Pacific", "US/Alaska",
  "US/Hawaii", "US/Arizona", "EST", "EST5EDT", "CST6CDT", "MST", "MST7MDT", "PST8PDT",
]);

export function countryFromTimeZone(tz: string | undefined | null): Country {
  if (!tz) return "PK";
  if (tz === "Asia/Karachi") return "PK";
  if (US_ZONES.has(tz) || tz.startsWith("America/Indiana/") || tz.startsWith("America/Kentucky/") || tz.startsWith("America/North_Dakota/")) return "US";
  return "OTHER";
}

export function detectCountry(): Country {
  try {
    return countryFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return "PK";
  }
}
