// Some older or slightly-off-schema LLM output stores list items as objects
// instead of plain strings. Render defensively rather than crashing.
export function itemText(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.label === "string") return obj.label;
    if (typeof obj.value === "string") return obj.value;
    if (typeof obj.name === "string") return obj.name;
  }
  return item == null ? "" : String(item);
}
