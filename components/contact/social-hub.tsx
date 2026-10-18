import * as React from "react";
import { getLocalizedText } from "@/lib/i18n/localize";
import { getSocialIcon, getPlatformStyling } from "@/components/icons/social-icons";
import { ArrowUpRight } from "lucide-react";
import type { Database } from "@/types/database.types";

type SocialLinkItem = Database["public"]["Tables"]["social_links"]["Row"];

interface SocialHubProps {
  socialLinks: SocialLinkItem[];
  locale: string;
}

/**
 * Devyx Dynamic Social Media Hub
 * Renders active direct channels (WhatsApp, Telegram, Messenger, Instagram, TikTok, YouTube)
 * with authentic SVG brand icons and technical blueprint hover micro-interactions.
 */
export function SocialHub({ socialLinks, locale }: SocialHubProps) {
  const activeLinks = socialLinks.filter((s) => s.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
        <span className="text-accent-signal">// DIRECT_COMMUNICATION_CHANNELS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {activeLinks.map((link) => {
          const Icon = getSocialIcon(link.platform);
          const styling = getPlatformStyling(link.platform);
          const label = getLocalizedText(link.custom_label, locale) || link.platform;

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3.5 sm:p-4 bg-bg-surface border border-border-grid transition-all duration-200 flex items-center justify-between group ${styling.hoverBorder}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 bg-bg-elevated border border-border-grid flex items-center justify-center text-text-muted transition-all duration-200 flex-shrink-0 ${styling.hoverText} ${styling.hoverBg}`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div className="min-w-0 text-start">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary group-hover:text-text-primary truncate">
                    {label}
                  </h4>
                  <p className="font-mono text-[10px] text-text-muted truncate">
                    {link.display_handle}
                  </p>
                </div>
              </div>

              <ArrowUpRight className="w-4 h-4 text-text-muted/50 group-hover:text-accent-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5 transition-all flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
