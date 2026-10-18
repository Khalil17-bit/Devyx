import type { LocalizedString, LocalizedFeatureItem } from "@/types/database.types";

/**
 * Resolves localized text using a deterministic fallback cascade:
 * active locale -> en -> fr -> ar -> first available string -> empty string.
 * Ensures visitors never see blank fields or raw JSON keys.
 */
export function getLocalizedText(
  field: LocalizedString | null | undefined,
  locale: string
): string {
  if (!field) return "";
  if (typeof field === "string") return field;

  // 1. Try active locale
  const activeValue = field[locale];
  if (activeValue && activeValue.trim() !== "") {
    return activeValue;
  }

  // 2. Fallback cascade: English -> French -> Arabic
  if (field.en && field.en.trim() !== "") {
    return field.en;
  }

  if (field.fr && field.fr.trim() !== "") {
    return field.fr;
  }

  if (field.ar && field.ar.trim() !== "") {
    return field.ar;
  }

  // 3. Last resort: any valid non-empty string in the object
  const firstAvailable = Object.values(field).find(
    (val): val is string => typeof val === "string" && val.trim() !== ""
  );

  return firstAvailable || "";
}

/**
 * Resolves a list of localized feature bullet points for services/projects.
 */
export function getLocalizedFeatures(
  features: LocalizedFeatureItem[] | null | undefined,
  locale: string
): string[] {
  if (!features || !Array.isArray(features)) return [];
  return features
    .map((item) => getLocalizedText(item, locale))
    .filter((text) => text.length > 0);
}
