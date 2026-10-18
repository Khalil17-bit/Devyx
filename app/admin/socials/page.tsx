import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";
import { getCachedSocialLinks } from "@/lib/data/cached-queries";
import { SocialsManager } from "@/components/admin/socials-manager";

export default async function AdminSocialsPage() {
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
