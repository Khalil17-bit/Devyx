"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Lightbox } from "@/components/ui/lightbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedText } from "@/lib/i18n/localize";
import type { Database } from "@/types/database.types";

type ProjectItem = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectModalProps {
  project: ProjectItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Devyx Project Detail Modal
 * Strictly adheres to PRD Section 5.3:
 * - High-res Lightbox Gallery with architecture schematics
 * - 3-part structured case study: Problem, Solution, Results
 * - Technology stack pill tags
 * - Conditional "Visit Live Project" button (rendered ONLY when live_url exists)
 */
export function ProjectModal({ project, open, onOpenChange }: ProjectModalProps) {
  const locale = useLocale();
  const t = useTranslations("modal");
  const tCta = useTranslations("cta");

  if (!project) return null;

  const title = getLocalizedText(project.title, locale);
  const problem = getLocalizedText(project.problem_statement, locale);
  const solution = getLocalizedText(project.solution_provided, locale);
  const results = getLocalizedText(project.results_achieved, locale);

  const allImages = [
    ...(project.cover_image_url ? [project.cover_image_url] : []),
    ...(project.gallery_images || []),
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      code={`CASE_STUDY // ${project.category.toUpperCase()}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-8">
        {/* Gallery / Lightbox Stage */}
        <Lightbox images={allImages} title={title} />

        {/* Project Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-grid">
          <div>
            <Badge variant="signal" className="mb-2">
              {project.category.replace("_", " ").toUpperCase()}
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
              {title}
            </h2>
          </div>

          {/* Conditional External Link Button */}
          {project.live_url && project.live_url.trim() !== "" ? (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider clip-chamfer hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform flex-shrink-0 text-center"
            >
              <span>{tCta("visitLive")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="w-full sm:w-auto text-center font-mono text-xs text-text-muted px-3 py-2 border border-border-grid bg-bg-elevated flex-shrink-0">
              [ PRIVATE_INFRASTRUCTURE // NO_PUBLIC_URL ]
            </div>
          )}
        </div>

        {/* 3-Part Structured Case Study */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Problem */}
          <div className="p-4 bg-bg-elevated/40 border border-border-grid space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-status-warning uppercase">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{t("problem")}</span>
            </div>
            <p className="font-sans text-xs text-text-secondary leading-relaxed">
              {problem || "Custom client operational bottlenecks resolved through deterministic engineering."}
            </p>
          </div>

          {/* Solution */}
          <div className="p-4 bg-bg-elevated/40 border border-border-grid space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent-signal uppercase">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{t("solution")}</span>
            </div>
            <p className="font-sans text-xs text-text-secondary leading-relaxed">
              {solution || "Next.js App Router, Supabase PostgreSQL with RLS, and automated n8n workflows."}
            </p>
          </div>

          {/* Results */}
          <div className="p-4 bg-bg-elevated/40 border border-border-grid space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-status-operational uppercase">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{t("results")}</span>
            </div>
            <p className="font-sans text-xs text-text-secondary leading-relaxed">
              {results || "Sub-second LCP, zero downtime, and verified throughput increase."}
            </p>
          </div>
        </div>

        {/* Technology Stack Tags */}
        <div className="space-y-3 pt-2">
          <h4 className="font-mono text-xs uppercase tracking-technical text-text-muted">
            // {t("techStack")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack && project.tech_stack.length > 0 ? (
              project.tech_stack.map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Next.js</Badge>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
