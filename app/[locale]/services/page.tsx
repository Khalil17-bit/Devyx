import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCachedPageSection, getCachedServices } from "@/lib/data/cached-queries";
import { getLocalizedText } from "@/lib/i18n/localize";
import { ServiceCard } from "@/components/services/service-card";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [headerSection, services] = await Promise.all([
    getCachedPageSection("services_header"),
    getCachedServices(),
  ]);

  const badge = getLocalizedText(headerSection.badge_text, locale);
  const headline = getLocalizedText(headerSection.headline, locale);
  const subheadline = getLocalizedText(headerSection.subheadline, locale);

  const webDevServices = services.filter((s) => s.category === "web_dev");
  const mobileAppServices = services.filter((s) => s.category === "mobile_app");
  const automationServices = services.filter((s) => s.category === "automation");

  return (
    <div className="blueprint-container px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Page Header */}
      <div className="max-w-3xl space-y-4 border-b border-border-grid pb-8">
        <span className="font-mono text-xs uppercase tracking-technical text-accent-signal block">
          // {badge || "CAPABILITIES & SYSTEMS"}
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
          {headline}
        </h1>
        <p className="font-sans text-base sm:text-lg text-text-secondary leading-relaxed">
          {subheadline}
        </p>
      </div>

      {/* 1. Web Platforms & Architecture */}
      {webDevServices.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border-grid pb-3 font-mono text-xs text-text-muted">
            <span className="font-bold text-accent-primary">// PILLAR_01</span>
            <span>//</span>
            <span className="uppercase text-text-primary font-semibold">Web Applications &amp; Database Architecture</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webDevServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Cross-Platform Mobile Apps */}
      {mobileAppServices.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border-grid pb-3 font-mono text-xs text-text-muted">
            <span className="font-bold text-accent-primary">// PILLAR_02</span>
            <span>//</span>
            <span className="uppercase text-text-primary font-semibold">Cross-Platform Mobile Engineering</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mobileAppServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Autonomous Workflow Automation */}
      {automationServices.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border-grid pb-3 font-mono text-xs text-text-muted">
            <span className="font-bold text-accent-primary">// PILLAR_03</span>
            <span>//</span>
            <span className="uppercase text-text-primary font-semibold">Autonomous n8n &amp; AI Workflow Automation</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automationServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
