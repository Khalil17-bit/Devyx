import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Browser-side Supabase client for client components and Admin auth sessions.
 */
export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createSsrBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createBrowserClient() {
  return createClient();
}
