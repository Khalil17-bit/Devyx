import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCachedPageSection, getCachedProjects } from "@/lib/data/cached-queries";
import { getLocalizedText } from "@/lib/i18n/localize";
import { ProjectGrid } from "@/components/projects/project-grid";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [headerSection, projects] = await Promise.all([
    getCachedPageSection("projects_header"),
    getCachedProjects(),
  ]);

  const badge = getLocalizedText(headerSection.badge_text, locale);
  const headline = getLocalizedText(headerSection.headline, locale);
  const subheadline = getLocalizedText(headerSection.subheadline, locale);

  return (
    <div className="blueprint-container px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="max-w-3xl space-y-4 border-b border-border-grid pb-8">
        <span className="font-mono text-xs uppercase tracking-technical text-accent-signal block">
          // {badge || "PORTFOLIO & SYSTEM SPECIFICATIONS"}
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
          {headline}
        </h1>
        <p className="font-sans text-base sm:text-lg text-text-secondary leading-relaxed">
          {subheadline}
        </p>
      </div>

      {/* Projects Grid with Instant Client-Side Category Filtering */}
      <ProjectGrid initialProjects={projects} showFilters={true} />
    </div>
  );
}
