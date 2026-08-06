// Shared client-side helpers so every AI feature (analyze, generate-plan,
// milestone-compare, coach, checkin) fails the same friendly way instead of
// leaking raw API/SDK error text (which can include billing details, JSON,
// or stack traces) straight into the UI.

export const TIMEOUT_MESSAGE =
  "That took too long — check your connection and try again.";
export const UNAVAILABLE_MESSAGE =
  "Our AI is temporarily unavailable — please try again shortly.";
export const GENERIC_MESSAGE = "Something didn't work — tap to retry.";

const DEFAULT_TIMEOUT_MS = 60_000;

// Thrown for any non-2xx API response. Carries the server's raw error text
// so toFriendlyMessage can classify it — that raw text must never be
// rendered directly.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Thrown for aborts (client-side timeout) and network-level fetch failures
// (offline, DNS, CORS) — both read to the user as "that didn't go through."
export class TimeoutError extends Error {
  constructor() {
    super(TIMEOUT_MESSAGE);
    this.name = "TimeoutError";
  }
}

function isBillingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("credit balance") ||
    lower.includes("billing") ||
    lower.includes("insufficient") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("overloaded")
  );
}

// Local, self-authored UX copy (e.g. "Please choose a JPEG, PNG, or WebP
// image.") is passed through unchanged — only ApiError/TimeoutError (which
// wrap server or network failures) get remapped, since those are the ones
// that can carry raw JSON/stack traces/status codes.
export function toFriendlyMessage(err: unknown): string {
  if (err instanceof TimeoutError) return TIMEOUT_MESSAGE;
  if (err instanceof ApiError) {
    return isBillingError(err.message) ? UNAVAILABLE_MESSAGE : GENERIC_MESSAGE;
  }
  if (err instanceof Error && err.message) return err.message;
  return GENERIC_MESSAGE;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch {
    // Covers both AbortError (our own timeout) and network-level failures —
    // both map to the same "check your connection" message.
    throw new TimeoutError();
  } finally {
    clearTimeout(timer);
  }
}

// For routes returning `{ error: string }` JSON on failure.
export async function apiErrorFromJson(
  response: Response,
  fallback: string
): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  return new ApiError(body?.error || fallback, response.status);
}

// For routes returning plain text on failure (the coach endpoint replies
// with `text/plain` on both success and error).
export async function apiErrorFromText(
  response: Response,
  fallback: string
): Promise<ApiError> {
  const text = await response.text().catch(() => "");
  return new ApiError(text || fallback, response.status);
}
