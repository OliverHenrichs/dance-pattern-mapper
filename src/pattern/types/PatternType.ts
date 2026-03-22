/**
 * Represents a category/type of pattern with a stable UUID identifier.
 * The slug is a human-readable name used for display and export.
 */
export interface PatternType {
  id: string; // UUID v4 for stable references
  slug: string; // Human-readable name (e.g., "push", "cross-body-lead")
  color: string; // Hex color code for visual representation
}

/**
 * Predefined color palette for pattern types.
 * These colors are chosen for good contrast and accessibility.
 */
export const PATTERN_TYPE_COLORS = {
  coral: "#FF6B6B",
  teal: "#4ECDC4",
  violet: "#9B59B6",
  amber: "#F39C12",
  emerald: "#2ECC71",
  azure: "#3498DB",
  rose: "#E91E63",
  lime: "#8BC34A",
  indigo: "#5C6BC0",
  orange: "#FF9800",
  cyan: "#00BCD4",
  magenta: "#E040FB",
} as const;

/**
 * Generate a UUID v4 (simple implementation)
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate and normalize a pattern type slug.
 * Returns lowercase-kebab-case format.
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Validate that a slug is unique within a list of pattern types.
 */
export function isSlugUnique(
  slug: string,
  existingTypes: PatternType[],
  excludeId?: string,
): boolean {
  const normalizedSlug = normalizeSlug(slug);
  return !existingTypes.some(
    (type) =>
      normalizeSlug(type.slug) === normalizedSlug && type.id !== excludeId,
  );
}
