"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectModal } from "@/components/projects/project-modal";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedText } from "@/lib/i18n/localize";
import type { Database, ProjectCategory } from "@/types/database.types";

type ProjectItem = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectGridProps {
  initialProjects: ProjectItem[];
  showFilters?: boolean;
  limit?: number;
}

/**
 * Devyx Interactive Projects Grid with Instant Client-Side Category Filtering
 * Strictly avoids fragile live iframes, rendering high-conversion visual cards.
 */
export function ProjectGrid({
  initialProjects,
  showFilters = true,
  limit,
}: ProjectGridProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [activeProject, setActiveProject] = React.useState<ProjectItem | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const locale = useLocale();
  const tCat = useTranslations("categories");
  const tCta = useTranslations("cta");

  const categories: { key: string; label: string }[] = [
    { key: "all", label: tCat("all") },
    { key: "web_dev", label: tCat("web_dev") },
    { key: "mobile_app", label: tCat("mobile_app") },
    { key: "automation", label: tCat("automation") },
  ];

  const filteredProjects = React.useMemo(() => {
    let list = initialProjects;
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (limit) {
      list = list.slice(0, limit);
    }
    return list;
  }, [initialProjects, selectedCategory, limit]);

  function handleOpenProject(project: ProjectItem) {
    setActiveProject(project);
    setModalOpen(true);
  }

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      {showFilters && (
        <div
          role="tablist"
          aria-label="Project categories"
          className="flex flex-wrap items-center gap-2 border-b border-border-grid pb-4 font-mono text-xs select-none"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 border font-semibold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? "bg-accent-primary text-bg-primary border-accent-primary"
                    : "bg-bg-surface border-border-grid text-text-secondary hover:text-text-primary hover:border-text-muted"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => {
          const title = getLocalizedText(project.title, locale);
          const summary = getLocalizedText(project.short_summary, locale);

          return (
            <Card
              key={project.id}
              code={`PRJ_0${index + 1} // ${project.category.toUpperCase()}`}
              metric={project.live_url ? "LIVE_APP" : "INTERNAL_AUTOMATION"}
              className="cursor-pointer group flex flex-col justify-between"
              onClick={() => handleOpenProject(project)}
            >
              <div>
                {/* 16:10 Visual Preview Container */}
                <div className="relative w-full aspect-[16/10] bg-bg-elevated border border-border-grid overflow-hidden mb-4 group-hover:border-accent-primary transition-colors">
                  {project.cover_image_url && (project.cover_image_url.startsWith("http") || project.cover_image_url.startsWith("/")) ? (
                    <img
                      src={project.cover_image_url}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = e.currentTarget.parentElement?.querySelector(".schematic-cover-fb");
                        if (fb) fb.classList.remove("hidden");
                      }}
                    />
                  ) : null}

                  {/* Schematic Cover Fallback */}
                  <div className="schematic-cover-fb w-full h-full p-4 flex flex-col justify-between font-mono text-xs bg-bg-surface/60 select-none">
                    <div className="flex items-center justify-between text-text-muted text-[10px]">
                      <span>DIAGRAM // 01</span>
                      <span className="text-accent-signal">VERIFIED</span>
                    </div>
                    <div className="text-center py-4">
                      <span className="px-2 py-1 bg-bg-elevated border border-border-grid text-text-primary font-bold text-xs">
                        [ {project.category.toUpperCase()} ]
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted truncate">
                      LCP &lt; 0.8s // ZERO-SSR
                    </div>
                  </div>
                </div>

                <CardHeader className="p-0 mb-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="signal" className="text-[10px]">
                      {project.category.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1">
                    {title}
                  </CardTitle>
                </CardHeader>

                <CardDescription className="line-clamp-3 text-xs mb-4">
                  {summary}
                </CardDescription>
              </div>

              <div>
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech_stack.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="default" className="text-[10px]">
                      {tech}
                    </Badge>
                  ))}
                  {project.tech_stack.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{project.tech_stack.length - 3}
                    </Badge>
                  )}
                </div>

                <CardFooter className="p-0 pt-3 border-t border-border-grid flex items-center justify-between font-mono text-xs">
                  <span className="text-text-muted group-hover:text-text-primary transition-colors">
                    {tCta("viewDetails")}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-accent-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </CardFooter>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={activeProject}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
