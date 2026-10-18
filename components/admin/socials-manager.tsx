"use client";

import * as React from "react";
import { updateSocialLink } from "@/actions/admin-cms";
import {
  Share2,
  CheckCircle,
  Loader2,
  Save,
  MessageCircle,
  Send,
  Instagram,
  Video,
  Youtube,
  Phone,
} from "lucide-react";
import type { Database } from "@/types/database.types";

type SocialLinkItem = Database["public"]["Tables"]["social_links"]["Row"];

interface SocialsManagerProps {
  initialSocialLinks: SocialLinkItem[];
}

const PLATFORM_ICONS: Record<string, any> = {
  whatsapp: Phone,
  telegram: Send,
  messenger: MessageCircle,
  instagram: Instagram,
  tiktok: Video,
  youtube: Youtube,
};

export function SocialsManager({ initialSocialLinks }: SocialsManagerProps) {
  const [links, setLinks] = React.useState<SocialLinkItem[]>(initialSocialLinks);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<string | null>(null);

  function handleFieldChange(id: string, field: keyof SocialLinkItem, value: any) {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  async function handleSave(link: SocialLinkItem) {
    setSavingId(link.id);

    const result = await updateSocialLink(link.id, {
      display_handle: link.display_handle,
      url: link.url,
      is_active: link.is_active,
      display_order: link.display_order,
    });

    setSavingId(null);

    if (result.success) {
      setNotification(`${link.platform.toUpperCase()} channel updated & ISR cache purged!`);
      setTimeout(() => setNotification(null), 3000);
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border-b border-border-grid pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block mb-1">
            // DIRECT_COMMUNICATION_CHANNELS
          </span>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Social Media &amp; Priority Ingest Hub
          </h1>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-status-operational/10 border border-status-operational text-status-operational font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid of 6 Platform Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => {
          const Icon = PLATFORM_ICONS[link.platform] || Share2;
          const isSavingThis = savingId === link.id;

          return (
            <div
              key={link.id}
              className={`p-5 bg-bg-surface border transition-colors space-y-4 ${
                link.is_active ? "border-border-grid" : "border-border-grid/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border-grid pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-bg-elevated border border-border-grid flex items-center justify-center text-accent-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-text-primary uppercase block">
                      {link.platform}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      ORDER #{link.display_order}
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                  <input
                    type="checkbox"
                    checked={link.is_active}
                    onChange={(e) => handleFieldChange(link.id, "is_active", e.target.checked)}
                    className="w-4 h-4 accent-accent-primary"
                  />
                  <span className={link.is_active ? "text-status-operational font-bold" : "text-text-muted"}>
                    {link.is_active ? "ACTIVE" : "DISABLED"}
                  </span>
                </label>
              </div>

              <div className="space-y-3 font-mono text-xs select-text">
                <div className="space-y-1">
                  <label className="text-text-muted uppercase text-[10px] block">
                    Public Handle / Number
                  </label>
                  <input
                    type="text"
                    value={link.display_handle}
                    onChange={(e) => handleFieldChange(link.id, "display_handle", e.target.value)}
                    className="w-full h-9 px-3 bg-bg-elevated border border-border-grid text-text-primary text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-text-muted uppercase text-[10px] block">
                    Direct External Link URL
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleFieldChange(link.id, "url", e.target.value)}
                    className="w-full h-9 px-3 bg-bg-elevated border border-border-grid text-text-primary text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-text-muted uppercase text-[10px]">Order:</label>
                    <input
                      type="number"
                      value={link.display_order}
                      onChange={(e) =>
                        handleFieldChange(link.id, "display_order", parseInt(e.target.value) || 1)
                      }
                      className="w-16 h-8 px-2 bg-bg-elevated border border-border-grid text-text-primary text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSavingThis}
                    onClick={() => handleSave(link)}
                    className="btn-primary clip-chamfer px-4 py-1.5 bg-accent-primary text-bg-primary font-mono text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    {isSavingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
