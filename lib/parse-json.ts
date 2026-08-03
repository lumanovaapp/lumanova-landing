function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

export function parseModelJson<T>(rawText: string): T {
  return JSON.parse(stripCodeFences(rawText)) as T;
}
