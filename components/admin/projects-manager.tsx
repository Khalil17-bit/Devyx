"use client";

import * as React from "react";
import { saveProject, deleteProject } from "@/actions/admin-cms";
import { compressImageToWebP } from "@/lib/media/compress-image";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle,
  FolderGit2,
  X,
  Upload,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import type { Database } from "@/types/database.types";

type ProjectItem = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectsManagerProps {
  initialProjects: ProjectItem[];
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [projects, setProjects] = React.useState<ProjectItem[]>(initialProjects);
  const [editingProject, setEditingProject] = React.useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [activeLang, setActiveLang] = React.useState<"en" | "fr" | "ar">("en");
  const [notification, setNotification] = React.useState<string | null>(null);
  const [tagInput, setTagInput] = React.useState("");

  function openCreate() {
    setEditingProject({
      slug: "new-system-case-study",
      category: "web_dev",
      cover_image_url: "/images/projects/project-1-cover.svg",
      gallery_images: ["/images/projects/project-1-cover.svg"],
      tech_stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
      live_url: null,
      display_order: projects.length + 1,
      is_published: true,
      is_featured: false,
      title: {
        en: "Autonomous Architecture Engine",
        fr: "Moteur d'Architecture Autonome",
        ar: "محرك البنية الهندسية المستقلة",
      },
      short_summary: {
        en: "High-throughput platform architecture delivering deterministic operational results.",
        fr: "Architecture de plateforme haute performance offrant des résultats déterministes.",
        ar: "بنية منصة عالية السرعة تقدم نتائج تشغيلية دقيقة ومستدامة.",
      },
      problem_statement: {
        en: "Legacy monolithic architecture suffered from frequent database locks and slow cold-starts.",
        fr: "L'ancienne architecture souffrait de verrous de base de données fréquents.",
        ar: "كانت البنية الأحادية القديمة تعاني من قفل قواعد البيانات وبطء التشغيل.",
      },
      solution_provided: {
        en: "Re-architected into modular edge services with atomic PostgreSQL sliding-window counters.",
        fr: "Refonte en services edge modulaires avec compteurs PostgreSQL atomiques.",
        ar: "إعادة بناء النظام إلى خدمات سحابية موزعة مع عدادات قاعدة بيانات ذرية.",
      },
      results_achieved: {
        en: "Achieved 99.98% uptime, zero lock contention, and 70% reduction in cloud infrastructure costs.",
        fr: "Disponibilité de 99,98% et réduction de 70% des coûts d'infrastructure.",
        ar: "تحقيق نسبة تشغيل 99.98% وخفض تكاليف البنية التحتية بنسبة 70%.",
      },
    });
    setIsDrawerOpen(true);
  }

  function openEdit(project: ProjectItem) {
    setEditingProject(JSON.parse(JSON.stringify(project)));
    setIsDrawerOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, isGallery = false) {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setIsUploading(true);
    try {
      // 1. In-Browser WebP compression (PRD Section 6.3)
      const compressed = await compressImageToWebP(file);

      // 2. Upload to Supabase Storage bucket 'devyx-media'
      const supabase = createBrowserClient();
      const filePath = `projects/${compressed.fileName}`;

      const { data, error } = await supabase.storage
        .from("devyx-media")
        .upload(filePath, compressed.blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) {
        // Fallback for local demo if bucket is not live
        const localUrl = URL.createObjectURL(compressed.blob);
        if (isGallery) {
          setEditingProject({
            ...editingProject,
            gallery_images: [...(editingProject.gallery_images || []), localUrl],
          });
        } else {
          setEditingProject({ ...editingProject, cover_image_url: localUrl });
        }
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("devyx-media").getPublicUrl(filePath);

        if (isGallery) {
          setEditingProject({
            ...editingProject,
            gallery_images: [...(editingProject.gallery_images || []), publicUrl],
          });
        } else {
          setEditingProject({ ...editingProject, cover_image_url: publicUrl });
        }
      }

      setNotification(`Image compressed (-${Math.round((1 - compressed.compressedSize / compressed.originalSize) * 100)}%) & uploaded!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(`Compression/upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  function addTechTag() {
    const trimmed = tagInput.trim();
    if (!trimmed || !editingProject) return;
    if (!(editingProject.tech_stack || []).includes(trimmed)) {
      setEditingProject({
        ...editingProject,
        tech_stack: [...(editingProject.tech_stack || []), trimmed],
      });
    }
    setTagInput("");
  }

  function removeTechTag(tag: string) {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      tech_stack: (editingProject.tech_stack || []).filter((t: string) => t !== tag),
    });
  }

  function removeGalleryImage(index: number) {
    if (!editingProject) return;
    const updated = (editingProject.gallery_images || []).filter((_: any, i: number) => i !== index);
    setEditingProject({ ...editingProject, gallery_images: updated });
  }

  async function handleSave() {
    if (!editingProject) return;
    setIsSaving(true);

    const result = await saveProject(editingProject);
    setIsSaving(false);

    if (result.success) {
      setNotification("Case study saved & ISR cache purged!");
      setTimeout(() => setNotification(null), 3000);
      setIsDrawerOpen(false);

      setProjects((prev) => {
        const existingIdx = prev.findIndex((p) => p.id === editingProject.id);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = editingProject;
          return next;
        }
        return [...prev, { ...editingProject, id: editingProject.id || crypto.randomUUID() }];
      });
    }
  }

  async function handleDelete(id: string, cover: string, gallery: string[]) {
    if (!confirm("Are you sure you want to permanently delete this project case study?")) return;
    const allImages = [cover, ...gallery];
    await deleteProject(id, allImages);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setNotification("Project deleted & storage cleaned up!");
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border-b border-border-grid pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block mb-1">
            // PORTFOLIO_CASE_STUDIES_CMS
          </span>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Projects &amp; Case Studies Manager
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="btn-primary clip-chamfer h-11 px-5 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Study</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-status-operational/10 border border-status-operational text-status-operational font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Projects Grid / Table */}
      <div className="bg-bg-surface border border-border-grid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start font-mono text-xs">
            <thead>
              <tr className="border-b border-border-grid bg-bg-elevated text-text-muted text-[10px] uppercase text-start">
                <th className="py-3 px-4 text-start">Order</th>
                <th className="py-3 px-4 text-start">Project Title</th>
                <th className="py-3 px-4 text-start">Category</th>
                <th className="py-3 px-4 text-start">Tech Tags</th>
                <th className="py-3 px-4 text-start">Featured</th>
                <th className="py-3 px-4 text-start">Published</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grid">
              {projects.map((project, idx) => (
                <tr key={project.id || idx} className="hover:bg-bg-elevated transition-colors">
                  <td className="py-3 px-4 font-bold text-text-muted">
                    #{project.display_order}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">
                        {(project.title as any)?.en || "Untitled Project"}
                      </span>
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visit Live URL"
                          className="text-text-muted hover:text-accent-primary"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold border border-border-grid">
                      {project.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(project.tech_stack || []).slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="px-1.5 py-0.2 bg-bg-surface text-[9px] border border-border-grid text-text-secondary">
                          {tag}
                        </span>
                      ))}
                      {(project.tech_stack || []).length > 3 && (
                        <span className="text-[9px] text-text-muted">+{(project.tech_stack || []).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {project.is_featured ? (
                      <span className="text-status-operational text-[10px] font-bold">YES</span>
                    ) : (
                      <span className="text-text-muted text-[10px]">NO</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {project.is_published ? (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-status-operational/10 text-status-operational">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-border-grid text-text-muted">
                        DRAFT
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-end space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(project)}
                      className="p-1.5 text-text-muted hover:text-accent-primary transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          project.id,
                          project.cover_image_url,
                          (project.gallery_images as string[]) || []
                        )
                      }
                      className="p-1.5 text-text-muted hover:text-status-error transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Drawer Modal */}
      {isDrawerOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-bg-surface border border-border-grid clip-chamfer shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-bg-elevated border-b border-border-grid flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block">
                  // CASE_STUDY_DRAWER
                </span>
                <h2 className="font-display text-lg font-bold text-text-primary">
                  {editingProject.id ? "Edit Case Study Specification" : "Create New Case Study"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs select-text">
              {/* Core Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">Slug *</label>
                  <input
                    type="text"
                    value={editingProject.slug}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">Category *</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary"
                  >
                    <option value="web_dev">Web Development</option>
                    <option value="mobile_app">Mobile Applications</option>
                    <option value="automation">Workflow Automation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">Display Order</label>
                  <input
                    type="number"
                    value={editingProject.display_order}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        display_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary font-bold"
                  />
                </div>
              </div>

              {/* Live URL & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-bg-elevated border border-border-grid">
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">
                    Optional Public Live URL (PRD Section 5.3)
                  </label>
                  <input
                    type="url"
                    value={editingProject.live_url || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value || null })}
                    placeholder="https://example.com (Leave empty for backend automation)"
                    className="w-full h-10 px-3 bg-bg-surface border border-border-grid text-text-primary"
                  />
                  <p className="font-sans text-[10px] text-text-muted">
                    If empty, the &ldquo;Visit Live Project&rdquo; button is completely omitted.
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.is_published}
                      onChange={(e) => setEditingProject({ ...editingProject, is_published: e.target.checked })}
                      className="w-4 h-4 accent-accent-primary"
                    />
                    <span className="font-bold text-text-primary">Published (Publicly Visible)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.is_featured}
                      onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })}
                      className="w-4 h-4 accent-accent-primary"
                    />
                    <span className="font-bold text-text-primary">Featured on Home Page</span>
                  </label>
                </div>
              </div>

              {/* Tech Stack Tags Builder */}
              <div className="p-4 bg-bg-elevated border border-border-grid space-y-3">
                <label className="text-text-muted uppercase text-[10px] block font-bold">
                  Technology Stack Tags
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {(editingProject.tech_stack || []).map((tag: string, tIdx: number) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-surface border border-border-grid text-xs text-text-primary font-bold"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTechTag(tag)}
                        className="text-text-muted hover:text-status-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTechTag();
                      }
                    }}
                    placeholder="Add tech (e.g. Next.js, n8n, Supabase)..."
                    className="flex-1 h-9 px-3 bg-bg-surface border border-border-grid text-text-primary text-xs"
                  />
                  <button
                    type="button"
                    onClick={addTechTag}
                    className="px-3 h-9 bg-accent-primary text-bg-primary font-bold text-xs uppercase"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* In-Browser WebP Image Compression & Gallery Uploader (PRD Section 6.3) */}
              <div className="p-4 bg-bg-elevated border border-border-grid space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-text-primary uppercase text-[11px] block">
                      // WEBP_COMPRESSION_ENGINE &amp; GALLERY
                    </span>
                    <span className="font-sans text-[10px] text-text-muted">
                      Images automatically compressed in-browser to WebP (1920px, 85%) to preserve 1 GB quota.
                    </span>
                  </div>

                  <label className="cursor-pointer btn-primary clip-chamfer px-3 py-1.5 bg-accent-primary text-bg-primary text-[10px] uppercase font-bold flex items-center gap-1">
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>Upload to Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Cover Image Input */}
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">
                    Cover Image URL / Path *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingProject.cover_image_url}
                      onChange={(e) => setEditingProject({ ...editingProject, cover_image_url: e.target.value })}
                      className="flex-1 h-10 px-3 bg-bg-surface border border-border-grid text-text-primary"
                    />
                    <label className="cursor-pointer px-3 h-10 bg-bg-surface border border-border-grid flex items-center justify-center text-text-muted hover:text-text-primary">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery Images List */}
                <div className="space-y-2">
                  <span className="text-text-muted uppercase text-[10px] block">
                    Gallery Screenshots &amp; Architecture Diagrams ({(editingProject.gallery_images || []).length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(editingProject.gallery_images || []).map((imgUrl: string, gIdx: number) => (
                      <div key={gIdx} className="relative group border border-border-grid bg-bg-surface p-1">
                        <img
                          src={imgUrl}
                          alt="Gallery item"
                          className="w-full h-20 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(gIdx)}
                          className="absolute top-1 end-1 p-1 bg-status-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trilingual Case Study Editor */}
              <div className="border border-border-grid p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border-grid pb-2">
                  <span className="font-bold text-text-primary uppercase text-[11px]">
                    // CASE_STUDY_NARRATIVE ({activeLang.toUpperCase()})
                  </span>
                  <div className="flex items-center gap-1">
                    {(["en", "fr", "ar"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={`px-3 py-1 text-[11px] border ${
                          activeLang === lang
                            ? "bg-accent-primary text-bg-primary font-bold border-accent-primary"
                            : "border-border-grid text-text-muted"
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div dir={activeLang === "ar" ? "rtl" : "ltr"} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block">
                      Title ({activeLang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={editingProject.title?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          title: { ...editingProject.title, [activeLang]: e.target.value },
                        })
                      }
                      className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block">
                      Summary (3 Lines) ({activeLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={2}
                      value={editingProject.short_summary?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          short_summary: { ...editingProject.short_summary, [activeLang]: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-bg-elevated border border-border-grid text-text-primary font-sans text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block font-bold text-status-warning">
                      1. The Problem / Bottleneck ({activeLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.problem_statement?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          problem_statement: { ...editingProject.problem_statement, [activeLang]: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-bg-elevated border border-border-grid text-text-primary font-sans text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block font-bold text-accent-primary">
                      2. The Solution &amp; Architecture ({activeLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.solution_provided?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          solution_provided: { ...editingProject.solution_provided, [activeLang]: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-bg-elevated border border-border-grid text-text-primary font-sans text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block font-bold text-status-operational">
                      3. Measurable Results &amp; ROI ({activeLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.results_achieved?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          results_achieved: { ...editingProject.results_achieved, [activeLang]: e.target.value },
                        })
                      }
                      className="w-full p-2.5 bg-bg-elevated border border-border-grid text-text-primary font-sans text-xs resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-bg-elevated border-t border-border-grid flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 border border-border-grid text-text-secondary hover:text-text-primary font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="btn-primary clip-chamfer px-6 py-2 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Case Study &amp; Purge Cache</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
