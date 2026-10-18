import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getCachedSiteSettings,
  getCachedPageSection,
  getCachedServices,
  getCachedProjects,
} from "@/lib/data/cached-queries";
import { getLocalizedText } from "@/lib/i18n/localize";
import { AutomationPipelineVisualizer } from "@/components/ui/automation-pipeline";
import { ServiceCard } from "@/components/services/service-card";
import { ProjectGrid } from "@/components/projects/project-grid";
import { HeroPrimaryCta } from "@/components/home/hero-primary-cta";
import { ArrowUpRight, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch statically cached data (Zero-SSR with infinite revalidation)
  const [siteSettings, heroSection, whyUsSection, services, projects] =
    await Promise.all([
      getCachedSiteSettings(),
      getCachedPageSection("home_hero"),
      getCachedPageSection("home_why_us"),
      getCachedServices(),
      getCachedProjects(),
    ]);

  const heroBadge = getLocalizedText(heroSection.badge_text, locale);
  const heroHeadline = getLocalizedText(heroSection.headline, locale);
  const heroSubheadline = getLocalizedText(heroSection.subheadline, locale);
  const heroPrimaryCta = getLocalizedText(heroSection.primary_cta_label, locale);
  const heroSecondaryCta = getLocalizedText(heroSection.secondary_cta_label, locale);

  const whyUsBadge = getLocalizedText(whyUsSection.badge_text, locale);
  const whyUsHeadline = getLocalizedText(whyUsSection.headline, locale);
  const whyUsSubheadline = getLocalizedText(whyUsSection.subheadline, locale);

  const featuredServices = services.filter((s) => s.is_featured_home);
  const featuredProjects = projects.filter((p) => p.is_featured);

  return (
    <div className="space-y-24">
      {/* =====================================================================
          1. HERO SECTION (Strictly Asymmetric 12-Column Split: 7 cols / 5 cols)
          ===================================================================== */}
      <section className="blueprint-container pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border-grid relative">
        <span className="blueprint-crosshair top-0 left-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair top-0 right-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair bottom-0 left-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair bottom-0 right-0 hidden md:flex">+</span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (7 cols): Proposition, Metrics, CTAs */}
          <div className="lg:col-span-7 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-surface border border-border-grid font-mono text-[11px] text-accent-signal uppercase tracking-technical select-none">
              <span className="w-1.5 h-1.5 bg-accent-signal inline-block animate-pulse-signal" />
              <span>{heroBadge || "SYS_ONLINE // ARCHITECTURE"}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.08]">
              {heroHeadline}
            </h1>

            <p className="font-sans text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
              {heroSubheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <HeroPrimaryCta
                action={siteSettings.primary_cta_action}
                label={heroPrimaryCta || "Initialize Consultation"}
              />

              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-bg-surface border border-border-grid text-text-primary font-mono text-sm font-semibold uppercase tracking-wider hover:border-accent-primary transition-colors"
              >
                <span>{heroSecondaryCta || "Explore System Blueprints"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quantitative Impact Metrics Bar */}
            {heroSection.metadata_items && heroSection.metadata_items.length > 0 && (
              <div className="pt-8 border-t border-border-grid grid grid-cols-3 gap-4 font-mono select-none">
                {heroSection.metadata_items.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] text-text-muted block uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-lg sm:text-2xl font-bold text-accent-primary block">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Signature Automation Pipeline Visualizer */}
          <div className="lg:col-span-5 w-full">
            <AutomationPipelineVisualizer />
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. FEATURED SERVICES OVERVIEW
          ===================================================================== */}
      <section className="blueprint-container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-border-grid mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-technical text-accent-signal block mb-2">
              // SYSTEM_CAPABILITIES
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-primary">
              Core Agency Offerings
            </h2>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase text-accent-primary hover:underline tracking-wider"
          >
            <span>View All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </section>

      {/* =====================================================================
          3. FEATURED CASE STUDIES / PORTFOLIO
          ===================================================================== */}
      <section className="blueprint-container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-border-grid mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-technical text-accent-signal block mb-2">
              // VERIFIED_DEPLOYMENTS
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-primary">
              Featured Case Studies
            </h2>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase text-accent-primary hover:underline tracking-wider"
          >
            <span>Explore All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProjectGrid initialProjects={featuredProjects} showFilters={false} limit={3} />
      </section>

      {/* =====================================================================
          4. VALUE PROPOSITION / WHY US (Differentiators & Quantitative Metrics)
          ===================================================================== */}
      <section className="blueprint-container px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 sm:p-12 bg-bg-surface border border-border-grid space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs uppercase tracking-technical text-accent-signal block">
              // {whyUsBadge || "ENGINEERING PRINCIPLES"}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-primary">
              {whyUsHeadline}
            </h2>
            <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed">
              {whyUsSubheadline}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border-grid">
            {whyUsSection.metadata_items &&
              whyUsSection.metadata_items.map((item, idx) => {
                const title = item.title ? getLocalizedText(item.title, locale) : "";
                const desc = item.desc ? getLocalizedText(item.desc, locale) : "";

                return (
                  <div key={idx} className="p-4 bg-bg-elevated/40 border border-border-grid space-y-2">
                    <span className="font-mono text-xs font-bold text-accent-signal block">
                      {item.code || `SYS_0${idx + 1}`}
                    </span>
                    <h3 className="font-display text-lg font-bold text-text-primary">
                      {title}
                    </h3>
                    <p className="font-sans text-xs text-text-secondary leading-relaxed">
                      {desc}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}
