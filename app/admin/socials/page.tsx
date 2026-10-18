import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/admin-auth";
import { hasPermission } from "@/lib/security/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";
import { getCachedSocialLinks } from "@/lib/data/cached-queries";
import { SocialsManager } from "@/components/admin/socials-manager";

export default async function AdminSocialsPage() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }
  if (!hasPermission(session.role, "manageSocials")) {
    redirect("/admin/dashboard");
  }

  let links: any[] = [];
  try {
    let client;
    try {
      client = createAdminClient();
    } catch {
      client = createStaticClient();
    }

    const { data, error } = await client
      .from("social_links")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      links = data;
    }
  } catch {
    // Non-blocking fallback
  }

  if (links.length === 0) {
    links = await getCachedSocialLinks();
  }

  return <SocialsManager initialSocialLinks={links} />;
}
