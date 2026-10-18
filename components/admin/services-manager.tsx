"use client";

import * as React from "react";
import { saveService, deleteService } from "@/actions/admin-cms";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle,
  Layers,
  ArrowUp,
  ArrowDown,
  X,
  Globe,
  Smartphone,
  Cpu,
} from "lucide-react";
import type { Database } from "@/types/database.types";

type ServiceItem = Database["public"]["Tables"]["services"]["Row"];

interface ServicesManagerProps {
  initialServices: ServiceItem[];
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = React.useState<ServiceItem[]>(initialServices);
  const [editingService, setEditingService] = React.useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeLang, setActiveLang] = React.useState<"en" | "fr" | "ar">("en");
  const [notification, setNotification] = React.useState<string | null>(null);

  function openCreate() {
    setEditingService({
      slug: "new-service-architecture",
      category: "web_dev",
      icon_name: "Globe",
      display_order: services.length + 1,
      is_active: true,
      is_featured_home: false,
      title: { en: "New Architecture Offering", fr: "Nouvelle Offre", ar: "خدمة هندسية جديدة" },
      short_description: { en: "High-level summary...", fr: "Résumé...", ar: "ملخص..." },
      full_description: { en: "Detailed technical specification...", fr: "Spécification...", ar: "تفاصيل..." },
      cta_label: { en: "Initialize Architecture", fr: "Initialiser", ar: "بدء الاستشارة" },
      features: [
        { en: "High-throughput deterministic pipeline", fr: "Pipeline déterministe", ar: "مسار دقيق عالي السرعة" },
      ],
    });
    setIsDrawerOpen(true);
  }

  function openEdit(service: ServiceItem) {
    setEditingService(JSON.parse(JSON.stringify(service)));
    setIsDrawerOpen(true);
  }

  async function handleSave() {
    if (!editingService) return;
    setIsSaving(true);

    const result = await saveService(editingService);
    setIsSaving(false);

    if (result.success) {
      setNotification("Service saved & ISR cache purged!");
      setTimeout(() => setNotification(null), 3000);
      setIsDrawerOpen(false);

      setServices((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === editingService.id);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = editingService;
          return next;
        }
        return [...prev, { ...editingService, id: editingService.id || crypto.randomUUID() }];
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this service?")) return;
    await deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    setNotification("Service deleted & ISR cache purged!");
    setTimeout(() => setNotification(null), 3000);
  }

  function addFeature() {
    if (!editingService) return;
    const features = [
      ...(editingService.features || []),
      { en: "New technical deliverable", fr: "Nouveau livrable", ar: "ميزة جديدة" },
    ];
    setEditingService({ ...editingService, features });
  }

  function removeFeature(idx: number) {
    if (!editingService) return;
    const features = editingService.features.filter((_: any, i: number) => i !== idx);
    setEditingService({ ...editingService, features });
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border-b border-border-grid pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block mb-1">
            // SERVICES_CATALOG_MANAGEMENT
          </span>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Agency Services Manager
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="btn-primary clip-chamfer h-11 px-5 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-status-operational/10 border border-status-operational text-status-operational font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Services List Table */}
      <div className="bg-bg-surface border border-border-grid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start font-mono text-xs">
            <thead>
              <tr className="border-b border-border-grid bg-bg-elevated text-text-muted text-[10px] uppercase text-start">
                <th className="py-3 px-4 text-start">Order</th>
                <th className="py-3 px-4 text-start">Icon &amp; Title</th>
                <th className="py-3 px-4 text-start">Slug</th>
                <th className="py-3 px-4 text-start">Category</th>
                <th className="py-3 px-4 text-start">Featured</th>
                <th className="py-3 px-4 text-start">Status</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grid">
              {services.map((service, idx) => (
                <tr key={service.id || idx} className="hover:bg-bg-elevated transition-colors">
                  <td className="py-3 px-4 font-bold text-text-muted">
                    #{service.display_order}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-bg-surface border border-border-grid text-accent-primary font-mono text-xs">
                        {service.icon_name}
                      </span>
                      <span className="font-bold text-text-primary">
                        {(service.title as any)?.en || "Untitled Service"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-[11px]">
                    {service.slug}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold border border-border-grid">
                      {service.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {service.is_featured_home ? (
                      <span className="text-status-operational text-[10px] font-bold">YES</span>
                    ) : (
                      <span className="text-text-muted text-[10px]">NO</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {service.is_active ? (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-status-operational/10 text-status-operational">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-border-grid text-text-muted">
                        DISABLED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-end space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(service)}
                      className="p-1.5 text-text-muted hover:text-accent-primary transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 text-text-muted hover:text-status-error transition-colors"
                      title="Delete Service"
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
      {isDrawerOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-bg-surface border border-border-grid clip-chamfer shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-bg-elevated border-b border-border-grid flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block">
                  // SERVICE_DRAWER
                </span>
                <h2 className="font-display text-lg font-bold text-text-primary">
                  {editingService.id ? "Edit Agency Service" : "Create New Agency Service"}
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
                    value={editingService.slug}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">Category *</label>
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary"
                  >
                    <option value="web_dev">Web Development</option>
                    <option value="mobile_app">Mobile Applications</option>
                    <option value="automation">Workflow Automation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">Lucide Icon Name</label>
                  <input
                    type="text"
                    value={editingService.icon_name}
                    onChange={(e) => setEditingService({ ...editingService, icon_name: e.target.value })}
                    placeholder="Globe, Smartphone, Cpu..."
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary"
                  />
                </div>
              </div>

              {/* Toggles & Order */}
              <div className="flex flex-wrap items-center gap-6 p-4 bg-bg-elevated border border-border-grid">
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">Display Order</label>
                  <input
                    type="number"
                    value={editingService.display_order}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        display_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-24 h-9 px-3 bg-bg-surface border border-border-grid text-text-primary font-bold"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={editingService.is_active}
                    onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                    className="w-4 h-4 accent-accent-primary"
                  />
                  <span className="font-bold text-text-primary">Is Active (Publicly Visible)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={editingService.is_featured_home}
                    onChange={(e) =>
                      setEditingService({ ...editingService, is_featured_home: e.target.checked })
                    }
                    className="w-4 h-4 accent-accent-primary"
                  />
                  <span className="font-bold text-text-primary">Feature on Home Page Grid</span>
                </label>
              </div>

              {/* Trilingual Copy Tabs */}
              <div className="border border-border-grid p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border-grid pb-2">
                  <span className="font-bold text-text-primary uppercase text-[11px]">
                    // TRILINGUAL_COPY
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

                <div dir={activeLang === "ar" ? "rtl" : "ltr"} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block">
                      Title ({activeLang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={editingService.title?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          title: { ...editingService.title, [activeLang]: e.target.value },
                        })
                      }
                      className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block">
                      Short Description ({activeLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={2}
                      value={editingService.short_description?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          short_description: {
                            ...editingService.short_description,
                            [activeLang]: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2.5 bg-bg-elevated border border-border-grid text-text-primary font-sans text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-text-muted uppercase text-[10px] block">
                      Full Technical Description ({activeLang.toUpperCase()})
                    </label>
                    <textarea
                      rows={4}
                      value={editingService.full_description?.[activeLang] || ""}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          full_description: {
                            ...editingService.full_description,
                            [activeLang]: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2.5 bg-bg-elevated border border-border-grid text-text-primary font-sans text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Deliverable Bullet Points */}
              <div className="border border-border-grid p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary uppercase text-[11px]">
                    // DELIVERABLE_FEATURES ({activeLang.toUpperCase()})
                  </span>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center gap-1 text-[10px] text-accent-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Deliverable</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingService.features || []).map((feat: any, fIdx: number) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <span className="text-accent-primary text-[10px] font-bold">#{fIdx + 1}</span>
                      <input
                        type="text"
                        dir={activeLang === "ar" ? "rtl" : "ltr"}
                        value={feat[activeLang] || ""}
                        onChange={(e) => {
                          const updated = [...editingService.features];
                          updated[fIdx] = { ...updated[fIdx], [activeLang]: e.target.value };
                          setEditingService({ ...editingService, features: updated });
                        }}
                        className="flex-1 h-9 px-3 bg-bg-elevated border border-border-grid text-text-primary text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(fIdx)}
                        className="p-1.5 text-text-muted hover:text-status-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
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
                  <span>Save Service &amp; Purge Cache</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
