"use client";

import * as React from "react";
import { updatePageSection } from "@/actions/admin-cms";
import { Save, Loader2, CheckCircle, Terminal, Plus, Trash2 } from "lucide-react";

interface PageSectionData {
  section_key: string;
  badge_text: { en: string; fr: string; ar: string };
  headline: { en: string; fr: string; ar: string };
  subheadline?: { en: string; fr: string; ar: string };
  body_text?: { en: string; fr: string; ar: string };
  primary_cta_label?: { en: string; fr: string; ar: string };
  secondary_cta_label?: { en: string; fr: string; ar: string };
  metadata_items?: Array<{ label: string; value: string }>;
}

interface ContentEditorProps {
  initialSections: Record<string, PageSectionData>;
}

const SECTION_OPTIONS = [
  { key: "home_hero", label: "Home: Hero & Signature Section" },
  { key: "home_why_us", label: "Home: Why Us / Value Proposition" },
  { key: "services_header", label: "Services Page: Header & Pillar Banner" },
  { key: "projects_header", label: "Projects Page: Header & Filter Banner" },
  { key: "about_story", label: "About Page: Engineering Manifesto" },
  { key: "contact_header", label: "Contact Page: Header & Pipeline Intro" },
];

export function ContentEditor({ initialSections }: ContentEditorProps) {
  const [activeSectionKey, setActiveSectionKey] = React.useState("home_hero");
  const [activeLang, setActiveLang] = React.useState<"en" | "fr" | "ar">("en");
  const [sections, setSections] = React.useState(initialSections);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const currentSection = sections[activeSectionKey] || {
    section_key: activeSectionKey,
    badge_text: { en: "", fr: "", ar: "" },
    headline: { en: "", fr: "", ar: "" },
    subheadline: { en: "", fr: "", ar: "" },
    body_text: { en: "", fr: "", ar: "" },
    primary_cta_label: { en: "", fr: "", ar: "" },
    secondary_cta_label: { en: "", fr: "", ar: "" },
    metadata_items: [],
  };

  function updateField(field: string, value: string) {
    setSections((prev) => {
      const section = prev[activeSectionKey] || {
        section_key: activeSectionKey,
        badge_text: { en: "", fr: "", ar: "" },
        headline: { en: "", fr: "", ar: "" },
      };

      const localizedObj = (section as any)[field] || { en: "", fr: "", ar: "" };

      return {
        ...prev,
        [activeSectionKey]: {
          ...section,
          [field]: {
            ...localizedObj,
            [activeLang]: value,
          },
        },
      };
    });
    setSaveSuccess(false);
  }

  function handleMetricChange(index: number, key: "label" | "value", value: string) {
    setSections((prev) => {
      const section = prev[activeSectionKey];
      const items = [...(section?.metadata_items || [])];
      if (items[index]) {
        items[index] = { ...items[index], [key]: value };
      }
      return {
        ...prev,
        [activeSectionKey]: {
          ...section,
          metadata_items: items,
        },
      };
    });
  }

  function addMetricItem() {
    setSections((prev) => {
      const section = prev[activeSectionKey];
      const items = [...(section?.metadata_items || []), { label: "NEW METRIC", value: "100%" }];
      return {
        ...prev,
        [activeSectionKey]: {
          ...section,
          metadata_items: items,
        },
      };
    });
  }

  function removeMetricItem(index: number) {
    setSections((prev) => {
      const section = prev[activeSectionKey];
      const items = (section?.metadata_items || []).filter((_, i) => i !== index);
      return {
        ...prev,
        [activeSectionKey]: {
          ...section,
          metadata_items: items,
        },
      };
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveSuccess(false);

    await updatePageSection(activeSectionKey, {
      badge_text: currentSection.badge_text,
      headline: currentSection.headline,
      subheadline: currentSection.subheadline,
      body_text: currentSection.body_text,
      primary_cta_label: currentSection.primary_cta_label,
      secondary_cta_label: currentSection.secondary_cta_label,
      metadata_items: currentSection.metadata_items,
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  return (
    <div className="space-y-6 select-none">
      {/* Editor Header */}
      <div className="border-b border-border-grid pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block mb-1">
            // CONTENT_MANAGEMENT_SYSTEM
          </span>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Trilingual Page Copy Editor
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary clip-chamfer h-11 px-6 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Purging ISR Cache...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Published &amp; Cached!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Publish Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Section Navigation */}
        <div className="lg:col-span-4 space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block mb-2 px-1">
            SELECT SECTION TO EDIT:
          </span>
          <div className="space-y-1 font-mono text-xs">
            {SECTION_OPTIONS.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => {
                  setActiveSectionKey(sec.key);
                  setSaveSuccess(false);
                }}
                className={`w-full p-3 text-start border transition-colors block ${
                  activeSectionKey === sec.key
                    ? "bg-accent-primary/10 border-accent-primary text-accent-primary font-bold"
                    : "border-border-grid bg-bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column (8 cols): Trilingual Form Editor */}
        <div className="lg:col-span-8 bg-bg-surface border border-border-grid p-6 space-y-6">
          {/* Language Tabs */}
          <div className="flex items-center justify-between border-b border-border-grid pb-3">
            <span className="font-mono text-xs font-bold text-text-primary uppercase">
              // SECTION: {activeSectionKey.toUpperCase()}
            </span>

            <div className="flex items-center gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveLang("en")}
                className={`px-3 py-1 border ${
                  activeLang === "en"
                    ? "bg-accent-primary text-bg-primary font-bold border-accent-primary"
                    : "border-border-grid text-text-muted hover:text-text-primary"
                }`}
              >
                EN (English)
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("fr")}
                className={`px-3 py-1 border ${
                  activeLang === "fr"
                    ? "bg-accent-primary text-bg-primary font-bold border-accent-primary"
                    : "border-border-grid text-text-muted hover:text-text-primary"
                }`}
              >
                FR (Français)
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("ar")}
                className={`px-3 py-1 border ${
                  activeLang === "ar"
                    ? "bg-accent-primary text-bg-primary font-bold border-accent-primary"
                    : "border-border-grid text-text-muted hover:text-text-primary"
                }`}
              >
                AR (العربية)
              </button>
            </div>
          </div>

          {/* Form Fields for Active Language */}
          <div
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            className="space-y-4 font-mono text-xs select-text"
          >
            {/* Badge Text */}
            <div className="space-y-1.5">
              <label className="text-text-muted uppercase text-[10px] block">
                Technical Eyebrow Badge ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={currentSection.badge_text?.[activeLang] || ""}
                onChange={(e) => updateField("badge_text", e.target.value)}
                placeholder="e.g. // SYS_ONLINE // ARCHITECTURE"
                className="w-full h-11 px-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <label className="text-text-muted uppercase text-[10px] block">
                Primary Headline ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={currentSection.headline?.[activeLang] || ""}
                onChange={(e) => updateField("headline", e.target.value)}
                className="w-full h-11 px-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none font-bold"
              />
            </div>

            {/* Subheadline (if applicable) */}
            {currentSection.subheadline !== undefined && (
              <div className="space-y-1.5">
                <label className="text-text-muted uppercase text-[10px] block">
                  Sub-headline / Description ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={currentSection.subheadline?.[activeLang] || ""}
                  onChange={(e) => updateField("subheadline", e.target.value)}
                  className="w-full p-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none resize-none font-sans"
                />
              </div>
            )}

            {/* Body Text (if applicable) */}
            {currentSection.body_text !== undefined && (
              <div className="space-y-1.5">
                <label className="text-text-muted uppercase text-[10px] block">
                  Body Narrative / Manifesto ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={5}
                  value={currentSection.body_text?.[activeLang] || ""}
                  onChange={(e) => updateField("body_text", e.target.value)}
                  className="w-full p-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none resize-none font-sans"
                />
              </div>
            )}

            {/* CTA Buttons (for hero) */}
            {activeSectionKey === "home_hero" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">
                    Primary CTA Label ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={currentSection.primary_cta_label?.[activeLang] || ""}
                    onChange={(e) => updateField("primary_cta_label", e.target.value)}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-muted uppercase text-[10px] block">
                    Secondary CTA Label ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={currentSection.secondary_cta_label?.[activeLang] || ""}
                    onChange={(e) => updateField("secondary_cta_label", e.target.value)}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Hero Quantitative Impact Metric Items */}
            {activeSectionKey === "home_hero" && (
              <div className="pt-4 border-t border-border-grid space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted uppercase text-[10px] block font-bold">
                    HERO QUANTITATIVE METRIC COUNTERS
                  </span>
                  <button
                    type="button"
                    onClick={addMetricItem}
                    className="inline-flex items-center gap-1 text-[10px] text-accent-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Counter</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(currentSection.metadata_items || []).map((item, mIdx) => (
                    <div key={mIdx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleMetricChange(mIdx, "label", e.target.value)}
                        placeholder="Label (e.g. CORE VELOCITY)"
                        className="flex-1 h-9 px-3 bg-bg-elevated border border-border-grid text-text-primary text-xs"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleMetricChange(mIdx, "value", e.target.value)}
                        placeholder="Value (e.g. 99.9%)"
                        className="w-28 h-9 px-3 bg-bg-elevated border border-border-grid text-text-primary font-bold text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeMetricItem(mIdx)}
                        className="p-2 text-text-muted hover:text-status-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
