/** Remove HTML tags from user-provided text before persistence or display. */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Collapse excessive whitespace in free-text fields. */
export function normalizeFreeText(input: string, maxLength: number): string {
  return stripHtml(input).replace(/\s+/g, " ").slice(0, maxLength);
}