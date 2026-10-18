import { redirect } from "next/navigation";

/**
 * Root route redirect
 * Fallback redirect to default locale /en if request somehow bypasses middleware.
 */
export default function RootPage() {
  redirect("/en");
}
