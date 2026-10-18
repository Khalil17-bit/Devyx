import * as React from "react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";
import { getSocialIcon, getPlatformStyling } from "@/components/icons/social-icons";
import { ArrowUpRight } from "lucide-react";

interface FooterProps {
  locale: string;
}

/**
 * Global Blueprint Technical Footer
 * Displays exposed blueprint grid, system coordinates, localized mission statement,
 * dynamic social media hubs, and live operational status indicator.
 */
export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const currentYear = new Date().getFullYear();

  const socialChannels = [
    { name: "Telegram", platform: "telegram", url: "https://t.me/devyx_official" },
    { name: "WhatsApp", platform: "whatsapp", url: "https://wa.me/213000000000" },
    { name: "Instagram", platform: "instagram", url: "https://instagram.com/devyx.tech" },
    { name: "Messenger", platform: "messenger", url: "https://m.me/devyx" },
    { name: "YouTube", platform: "youtube", url: "https://youtube.com/@devyx" },
    { name: "TikTok", platform: "tiktok", url: "https://tiktok.com/@devyx.tech" },
  ];

  return (
    <footer className="w-full bg-bg-surface border-t border-border-grid mt-16 sm:mt-24 transition-colors">
      <div className="blueprint-container px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Top Blueprint Crosshairs */}
        <span className="blueprint-crosshair top-0 left-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair top-0 right-0 hidden md:flex">+</span>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 sm:pb-16 border-b border-border-grid">
          {/* Brand Manifesto & System Coordinates */}
          <div className="md:col-span-5 space-y-4">
            <Logo />
            <div className="font-mono text-xs text-accent-signal tracking-technical uppercase pt-2">
              {t("sysRoot")}
            </div>
            <p className="font-sans text-sm text-text-secondary leading-relaxed max-w-sm">
              {t("tagline")}
            </p>

            {/* Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-elevated border border-border-grid font-mono text-[11px] text-text-primary">
              <span className="w-2 h-2 rounded-full bg-status-operational animate-pulse" />
              <span className="text-text-muted">SYSTEM_STATUS:</span>
              <span className="font-bold text-status-operational">{t("status")}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-technical text-text-muted">
              // {t("links")}
            </h3>
            <ul className="space-y-2.5 font-mono text-xs uppercase">
              <li>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5 py-1"
                >
                  <span className="text-border-grid">/</span>
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5 py-1"
                >
                  <span className="text-border-grid">/</span>
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5 py-1"
                >
                  <span className="text-border-grid">/</span>
                  {tNav("projects")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5 py-1"
                >
                  <span className="text-border-grid">/</span>
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Channels Hub */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-technical text-text-muted">
              // {t("socials")}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {socialChannels.map((channel) => {
                const Icon = getSocialIcon(channel.platform);
                const styling = getPlatformStyling(channel.platform);
                return (
                  <a
                    key={channel.name}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`min-h-[48px] p-2 sm:p-2.5 bg-bg-elevated/70 hover:bg-bg-elevated border border-border-grid transition-all duration-200 flex items-center justify-between gap-2 group ${styling.hoverBorder}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-border-grid bg-bg-surface text-text-muted transition-all duration-200 flex-shrink-0 ${styling.hoverText} ${styling.hoverBg}`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <div className="min-w-0 text-start">
                        <span className="block font-mono text-xs font-bold uppercase tracking-wider text-text-primary group-hover:text-text-primary truncate">
                          {channel.name}
                        </span>
                        <span
                          className={`block font-mono text-[9px] text-text-muted transition-colors tracking-technical ${styling.hoverText}`}
                        >
                          {styling.tag}
                        </span>
                      </div>
                    </div>

                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted/40 group-hover:text-accent-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5 transition-all flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Technical Metadata Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-text-muted text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>&copy; {currentYear} Devyx Corp.</span>
            <span>//</span>
            <span>ALL_RIGHTS_RESERVED</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-[11px]">
            <span>LOCALE: {locale.toUpperCase()}</span>
            <span>//</span>
            <span>STACK: NEXT15_EDGE</span>
            <span>//</span>
            <Link
              href="/admin/login"
              className="text-text-muted hover:text-accent-primary transition-colors inline-block py-1"
            >
              [ADMIN_PORTAL]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
