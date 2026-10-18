import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
  getCachedSiteSettings,
  getCachedPageSection,
  getCachedSocialLinks,
  getCachedServices,
} from "@/lib/data/cached-queries";
import { getLocalizedText } from "@/lib/i18n/localize";
import { SocialHub } from "@/components/contact/social-hub";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Terminal, MessageSquare, AlertCircle } from "lucide-react";

import { LeadForm } from "@/components/contact/lead-form";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface ContactPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ service?: string }>;
}

export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  setRequestLocale(locale);

  const [siteSettings, contactSection, storySection, socialLinks, services] =
    await Promise.all([
      getCachedSiteSettings(),
      getCachedPageSection("contact_header"),
      getCachedPageSection("about_story"),
      getCachedSocialLinks(),
      getCachedServices(),
    ]);

  const contactBadge = getLocalizedText(contactSection.badge_text, locale);
  const contactHeadline = getLocalizedText(contactSection.headline, locale);
  const contactSubheadline = getLocalizedText(contactSection.subheadline, locale);

  const storyBadge = getLocalizedText(storySection.badge_text, locale);
  const storyHeadline = getLocalizedText(storySection.headline, locale);
  const storyBody = getLocalizedText(storySection.body_text, locale);

  const isFormEnabled = siteSettings.enable_contact_form;

  return (
    <div className="blueprint-container px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-16">
      {/* Page Header */}
      <div className="max-w-3xl space-y-4 border-b border-border-grid pb-8">
        <span className="font-mono text-xs uppercase tracking-technical text-accent-signal block">
          // {contactBadge || "DISCOVERY & ENGAGEMENT"}
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
          {contactHeadline}
        </h1>
        <p className="font-sans text-base sm:text-lg text-text-secondary leading-relaxed">
          {contactSubheadline}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column (5 cols): Devyx Manifesto & Social Media Hub */}
        <div className="lg:col-span-5 space-y-8 sm:space-y-12">
          {/* Engineering Story */}
          <div className="p-4 sm:p-6 bg-bg-surface border border-border-grid space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-accent-signal">
              <Terminal className="w-4 h-4" />
              <span className="uppercase tracking-wider font-semibold">
                {storyBadge || "DEVYX MANIFESTO"}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-text-primary">
              {storyHeadline}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed">
              {storyBody}
            </p>
          </div>

          {/* Social Media Hub */}
          <div className="p-4 sm:p-6 bg-bg-surface border border-border-grid">
            <SocialHub socialLinks={socialLinks} locale={locale} />
          </div>
        </div>

        {/* Right Column (7 cols): Consultation Form (Toggleable Master Switch) */}
        <div className="lg:col-span-7">
          {isFormEnabled ? (
            <div className="p-4 sm:p-8 bg-bg-surface border border-border-grid space-y-6">
              <div className="border-b border-border-grid pb-4">
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className="font-bold text-text-primary uppercase tracking-wider">
                    // CONSULTATION_PIPELINE
                  </span>
                  <span className="text-accent-signal text-[11px]">
                    SECURE_INGEST
                  </span>
                </div>
                <p className="font-sans text-xs text-text-muted">
                  Transmitted directly to our encrypted database and evaluated by engineering directors.
                </p>
              </div>

              {/* Lead Capture Form with Zod validation, honeypot & sliding-window rate limit */}
              <LeadForm
                services={services}
                defaultService={resolvedSearchParams?.service}
              />
            </div>
          ) : (
            /* Unmounted Form Notice (PRD Section 2.1 & 8) */
            <div className="p-8 bg-bg-surface border border-border-grid text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-status-warning mx-auto" />
              <h3 className="font-display text-xl font-bold text-text-primary">
                Direct Form Ingest Temporarily Paused
              </h3>
              <p className="font-sans text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
                Consultation form submissions are currently closed by administration. Please connect directly via our active Social Media channels or use the AI Qualification Engineer below.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
