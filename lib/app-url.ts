// NEXT_PUBLIC_APP_URL has been observed with stray whitespace in at least
// one environment's .env file — dotenv trims it, but this trims again
// defensively since a malformed base breaks `new URL()` outright.
export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
}
