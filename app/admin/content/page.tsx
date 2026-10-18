import { getCachedPageSection } from "@/lib/data/cached-queries";
import { ContentEditor } from "@/components/admin/content-editor";

const SECTION_KEYS = [
  "home_hero",
  "home_why_us",
  "services_header",
  "projects_header",
  "about_story",
  "contact_header",
];

export default async function AdminContentPage() {
  const sectionsArray = await Promise.all(
    SECTION_KEYS.map(async (key) => {
      const section = await getCachedPageSection(key);
      return { key, section };
    })
  );

  const sectionsMap = sectionsArray.reduce((acc, curr) => {
    acc[curr.key] = curr.section as any;
    return acc;
  }, {} as Record<string, any>);

  return <ContentEditor initialSections={sectionsMap} />;
}
