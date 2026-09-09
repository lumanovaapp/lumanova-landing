// Fallback for browsers/environments without Intl.supportedValuesOf (Safari
// < 17, older WebViews) — covers one representative IANA zone per UTC
// offset so users everywhere (Sri Lanka, US, UK, India, Australia, etc.)
// still have something sensible to pick from settings.
const FALLBACK_ZONES = [
  "UTC",
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Paris",
  "Europe/Athens",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Colombo",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

let cached: string[] | null = null;

// All IANA time zone names for the settings dropdown, sorted alphabetically.
// Safe to call on both server and client — Intl.supportedValuesOf is a
// browser/Node API, not DOM-only.
export function listTimezones(): string[] {
  if (cached) return cached;
  try {
    cached = Intl.supportedValuesOf("timeZone").sort();
  } catch {
    cached = [...FALLBACK_ZONES].sort();
  }
  return cached;
}

// Best-effort browser timezone detection. Returns null (never throws) so
// callers can fall back to whatever's already stored.
export function detectTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

// "Asia/Colombo" -> "Asia/Colombo (GMT+5:30)" — the offset makes the
// dropdown scannable without requiring the user to know city-to-offset
// mappings for zones they don't recognize.
export function formatTimezoneLabel(zone: string, at: Date = new Date()): string {
  try {
    const offset = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName")?.value;
    return offset ? `${zone} (${offset})` : zone;
  } catch {
    return zone;
  }
}
