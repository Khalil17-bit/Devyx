"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";
import { getAdminSession } from "./admin-auth";

function getClient() {
  try {
    return createAdminClient();
  } catch {
    return createStaticClient() as any;
  }
}

/**
 * Ensure the caller is an authenticated administrator
 */
async function assertAdmin() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    throw new Error("Unauthorized: Administrative privileges required.");
  }
}

// ==============================================================================
// 1. SITE SETTINGS MUTATIONS
// ==============================================================================

export async function toggleSetting(
  key: "enable_contact_form" | "chatbot_enabled",
  value: boolean
) {
  await assertAdmin();
  const client = getClient();

  const { error } = await client
    .from("site_settings")
    .update({ [key]: value, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.warn(`[CMS Warning] Error updating site setting ${key}:`, error.message);
  }

  revalidateTag("cms:site_settings");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePrimaryCta(action: "open_chat" | "navigate_contact") {
  await assertAdmin();
  const client = getClient();

  const { error } = await client
    .from("site_settings")
    .update({ primary_cta_action: action, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.warn("[CMS Warning] Error updating primary CTA action:", error.message);
  }

  revalidateTag("cms:site_settings");
  revalidatePath("/", "layout");
  return { success: true };
}

// ==============================================================================
// 2. PAGE SECTIONS MUTATIONS
// ==============================================================================

export async function updatePageSection(
  sectionKey: string,
  payload: {
    badge_text: { en: string; fr: string; ar: string };
    headline: { en: string; fr: string; ar: string };
    subheadline?: { en: string; fr: string; ar: string };
    body_text?: { en: string; fr: string; ar: string };
    primary_cta_label?: { en: string; fr: string; ar: string };
    secondary_cta_label?: { en: string; fr: string; ar: string };
    metadata_items?: Array<{ label: string; value: string }>;
  }
) {
  await assertAdmin();
  const client = getClient();

  const { error } = await client
    .from("page_sections")
    .upsert({
      section_key: sectionKey,
      ...payload,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.warn(`[CMS Warning] Error updating section ${sectionKey}:`, error.message);
    return { success: false, error: error.message };
  }

  revalidateTag("cms:page_content");
  revalidatePath("/", "layout");
  return { success: true };
}

// ==============================================================================
// 3. SERVICES MUTATIONS
// ==============================================================================

export async function saveService(serviceData: {
  id?: string;
  slug: string;
  category: "web_dev" | "mobile_app" | "automation";
  icon_name: string;
  display_order: number;
  is_active: boolean;
  is_featured_home: boolean;
  title: { en: string; fr: string; ar: string };
  short_description: { en: string; fr: string; ar: string };
  full_description: { en: string; fr: string; ar: string };
  cta_label: { en: string; fr: string; ar: string };
  features: Array<{ en: string; fr: string; ar: string }>;
}) {
  await assertAdmin();
  const client = getClient();

  const record = {
    ...serviceData,
    id: serviceData.id || crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from("services").upsert(record);

  if (error) {
    console.warn("[CMS Warning] Error saving service:", error.message);
    return { success: false, error: error.message };
  }

  revalidateTag("cms:services");
  revalidatePath("/[locale]/services", "page");
  revalidatePath("/[locale]", "page");
  return { success: true };
}

export async function deleteService(id: string) {
  await assertAdmin();
  const client = getClient();

  const { error } = await client.from("services").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateTag("cms:services");
  revalidatePath("/[locale]/services", "page");
  revalidatePath("/[locale]", "page");
  return { success: true };
}

// ==============================================================================
// 4. PROJECTS MUTATIONS & STORAGE HYGIENE
// ==============================================================================

export async function saveProject(projectData: {
  id?: string;
  slug: string;
  category: "web_dev" | "mobile_app" | "automation";
  cover_image_url: string;
  gallery_images: string[];
  tech_stack: string[];
  live_url?: string | null;
  display_order: number;
  is_published: boolean;
  is_featured: boolean;
  title: { en: string; fr: string; ar: string };
  short_summary: { en: string; fr: string; ar: string };
  problem_statement: { en: string; fr: string; ar: string };
  solution_provided: { en: string; fr: string; ar: string };
  results_achieved: { en: string; fr: string; ar: string };
}) {
  await assertAdmin();
  const client = getClient();

  const record = {
    ...projectData,
    id: projectData.id || crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from("projects").upsert(record);

  if (error) {
    console.warn("[CMS Warning] Error saving project:", error.message);
    return { success: false, error: error.message };
  }

  revalidateTag("cms:projects");
  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]", "page");
  return { success: true };
}

export async function deleteProject(id: string, imagePathsToDelete?: string[]) {
  await assertAdmin();
  const client = getClient();

  // Storage hygiene: clean up image files from Supabase Storage
  if (imagePathsToDelete && imagePathsToDelete.length > 0) {
    try {
      const paths = imagePathsToDelete
        .map((url) => {
          const parts = url.split("/devyx-media/");
          return parts.length > 1 ? parts[1] : null;
        })
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        await client.storage.from("devyx-media").remove(paths);
      }
    } catch (storageErr) {
      console.warn("[Storage Hygiene Error] Could not remove files:", storageErr);
    }
  }

  const { error } = await client.from("projects").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateTag("cms:projects");
  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]", "page");
  return { success: true };
}

// ==============================================================================
// 5. SOCIAL HUB MUTATIONS
// ==============================================================================

export async function updateSocialLink(
  id: string,
  data: {
    display_handle: string;
    url: string;
    is_active: boolean;
    display_order: number;
  }
) {
  await assertAdmin();
  const client = getClient();

  const { error } = await client
    .from("social_links")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateTag("cms:social_links");
  revalidatePath("/", "layout");
  return { success: true };
}

// ==============================================================================
// 6. LEADS CRM MUTATIONS
// ==============================================================================

export async function updateLeadStatus(
  id: string,
  status: "new" | "contacted" | "qualified" | "closed" | "spam",
  adminNotes?: string
) {
  await assertAdmin();
  const client = getClient();

  const updatePayload: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (adminNotes !== undefined) {
    updatePayload.admin_notes = adminNotes;
  }

  const { error } = await client
    .from("leads")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
