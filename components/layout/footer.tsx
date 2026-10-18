import * as React from "react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";

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
    { name: "WhatsApp", url: "https://wa.me/213000000000", tag: "SYS_WA" },
    { name: "Telegram", url: "https://t.me/devyx_official", tag: "SYS_TG" },
    { name: "Messenger", url: "https://m.me/devyx", tag: "SYS_MSG" },
    { name: "Instagram", url: "https://instagram.com/devyx.tech", tag: "SYS_IG" },
    { name: "TikTok", url: "https://tiktok.com/@devyx.tech", tag: "SYS_TT" },
    { name: "YouTube", url: "https://youtube.com/@devyx", tag: "SYS_YT" },
  ];

  return (
    <footer className="w-full bg-bg-surface border-t border-border-grid mt-24 transition-colors">
      <div className="blueprint-container px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Blueprint Crosshairs */}
        <span className="blueprint-crosshair top-0 left-0 hidden md:flex">+</span>
        <span className="blueprint-crosshair top-0 right-0 hidden md:flex">+</span>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-border-grid">
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
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5"
                >
                  <span className="text-border-grid">/</span>
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5"
                >
                  <span className="text-border-grid">/</span>
                  {tNav("services")}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5"
                >
                  <span className="text-border-grid">/</span>
                  {tNav("projects")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5"
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
            <div className="grid grid-cols-2 gap-2">
              {socialChannels.map((channel) => (
                <a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-bg-elevated border border-border-grid hover:border-accent-primary text-text-secondary hover:text-text-primary transition-colors font-mono text-[11px] flex items-center justify-between group"
                >
                  <span>{channel.name}</span>
                  <span className="text-[9px] text-text-muted group-hover:text-accent-signal">
                    {channel.tag}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Technical Metadata Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} Devyx Corp.</span>
            <span>//</span>
            <span>ALL_RIGHTS_RESERVED</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>LOCALE: {locale.toUpperCase()}</span>
            <span>//</span>
            <span>STACK: NEXT15_EDGE</span>
            <span>//</span>
            <Link
              href="/admin/login"
              className="text-text-muted hover:text-accent-primary transition-colors"
            >
              [ADMIN_PORTAL]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
