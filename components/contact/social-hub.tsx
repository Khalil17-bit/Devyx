import * as React from "react";
import { getLocalizedText } from "@/lib/i18n/localize";
import { ArrowUpRight, MessageCircle, Send, Video, Camera, Phone } from "lucide-react";
import type { Database } from "@/types/database.types";

type SocialLinkItem = Database["public"]["Tables"]["social_links"]["Row"];

interface SocialHubProps {
  socialLinks: SocialLinkItem[];
  locale: string;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp: Phone,
  telegram: Send,
  messenger: MessageCircle,
  instagram: Camera,
  tiktok: Video,
  youtube: Video,
};

/**
 * Devyx Dynamic Social Media Hub
 * Renders active direct channels (WhatsApp, Telegram, Messenger, Instagram, TikTok, YouTube).
 * Disables channels instantly when marked inactive by Admin.
 */
export function SocialHub({ socialLinks, locale }: SocialHubProps) {
  const activeLinks = socialLinks.filter((s) => s.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
        <span className="text-accent-signal">// DIRECT_COMMUNICATION_CHANNELS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeLinks.map((link) => {
          const Icon = platformIcons[link.platform] || MessageCircle;
          const label = getLocalizedText(link.custom_label, locale) || link.platform;

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-bg-surface border border-border-grid hover:border-accent-primary transition-all duration-150 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-bg-elevated border border-border-grid flex items-center justify-center text-text-primary group-hover:border-accent-primary group-hover:text-accent-primary transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
                    {label}
                  </h4>
                  <p className="font-mono text-[10px] text-text-muted">
                    {link.display_handle}
                  </p>
                </div>
              </div>

              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
