/**
 * Safe date formatters that produce identical strings on Server (Node.js SSR)
 * and Client (Browser) to prevent React Hydration Mismatches.
 */

export function formatDateSafe(dateStr: string | number | Date | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = typeof dateStr === "string" || typeof dateStr === "number" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return String(dateStr);
  }
}

export function formatDateTimeSafe(dateStr: string | number | Date | null | undefined): string {
  if (!dateStr) return "Never";
  try {
    const d = typeof dateStr === "string" || typeof dateStr === "number" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
  } catch {
    return String(dateStr);
  }
}
