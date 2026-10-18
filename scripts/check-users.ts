import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [k, ...v] = trimmed.split("=");
    if (k && v.length > 0) env[k.trim()] = v.join("=").trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error.message);
    return;
  }
  console.log(`Found ${data.users.length} users in Supabase Auth:`);
  data.users.forEach((u) => {
    console.log(`- Email: ${u.email} | Role: ${u.app_metadata?.role || u.user_metadata?.role || "No Role"} | ID: ${u.id}`);
  });
}

main();
