import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Parse .env.local manually
const envContent = readFileSync(".env.local", "utf-8");
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("Testing connection to Supabase URL:", supabaseUrl);
console.log("Anon key present:", !!supabaseAnonKey);
console.log("Service role key present:", !!serviceRoleKey);

async function testConnection() {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // 1. Check if tables exist
    console.log("\nQuerying site_settings table...");
    const { data: tables, error: tableError } = await supabase
      .from("site_settings")
      .select("*");

    console.log("site_settings query result:", { tables, tableError });

    // 2. Check buckets
    console.log("\nListing storage buckets...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log("Buckets list result:", { buckets, bucketError });
  } catch (err) {
    console.error("Connection exception:", err);
  }
}

testConnection();
