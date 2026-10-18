import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/admin-auth";
import { hasPermission } from "@/lib/security/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";
import { LeadsCrm } from "@/components/admin/leads-crm";

export default async function AdminLeadsPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }

  if (!hasPermission(session.role, "manageLeads")) {
    redirect("/admin/dashboard");
  }

  let leads: any[] = [];
  try {
    let client;
    try {
      client = createAdminClient();
    } catch {
      client = createStaticClient();
    }

    const { data, error } = await client
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      leads = data;
    }
  } catch {
    // Non-blocking in dev
  }

  return <LeadsCrm initialLeads={leads} />;
}
