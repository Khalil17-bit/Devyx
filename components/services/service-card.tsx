"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, Check, Globe, Smartphone, Cpu, Database, Bot, Network } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedText, getLocalizedFeatures } from "@/lib/i18n/localize";
import type { Database as DBType } from "@/types/database.types";

type ServiceItem = DBType["public"]["Tables"]["services"]["Row"];

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Smartphone,
  Cpu,
  Database,
  Bot,
  Network,
};

/**
 * Devyx Service Card Component
 * Strictly adheres to PRD Section 5.2:
 * - Technical header with system coordinate
 * - Deliverables bullet-point checklist
 * - Contextual CTA linking to contact with pre-selected service
 */
export function ServiceCard({ service, index }: ServiceCardProps) {
  const locale = useLocale();
  const tCta = useTranslations("cta");

  const title = getLocalizedText(service.title, locale);
  const shortDesc = getLocalizedText(service.short_description, locale);
  const ctaLabel = getLocalizedText(service.cta_label, locale) || tCta("initialize");
  const features = getLocalizedFeatures(service.features, locale);

  const IconComponent = iconMap[service.icon_name] || Cpu;

  return (
    <Card
      code={`SRV_0${index + 1} // ${service.category.toUpperCase()}`}
      metric={service.category.replace("_", " ").toUpperCase()}
      className="flex flex-col justify-between group"
    >
      <div>
        <CardHeader className="p-0 mb-4">
          <div className="w-10 h-10 border border-border-grid bg-bg-elevated flex items-center justify-center text-accent-primary group-hover:border-accent-primary group-hover:bg-bg-surface transition-colors mb-4">
            <IconComponent className="w-5 h-5" />
          </div>

          <CardTitle className="text-xl font-bold mb-2">
            {title}
          </CardTitle>

          <CardDescription className="text-xs sm:text-sm">
            {shortDesc}
          </CardDescription>
        </CardHeader>

        {/* Deliverables Checklist */}
        {features.length > 0 && (
          <CardContent className="p-0 my-4 space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-technical text-text-muted mb-2">
              // VERIFIED_DELIVERABLES:
            </div>
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                <Check className="w-3.5 h-3.5 text-status-operational mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </CardContent>
        )}
      </div>

      <CardFooter className="p-0 pt-6 border-t border-border-grid">
        <Link
          href={`/contact?service=${encodeURIComponent(service.slug)}`}
          className="w-full inline-flex items-center justify-between min-h-[44px] px-4 py-2.5 bg-bg-elevated border border-border-grid text-text-primary font-mono text-xs uppercase tracking-wider group-hover:border-accent-primary group-hover:bg-accent-primary group-hover:text-bg-primary transition-all"
        >
          <span>{ctaLabel}</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
