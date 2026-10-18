"use client";

import * as React from "react";
import { toggleSetting, updatePrimaryCta } from "@/actions/admin-cms";
import { ShieldAlert, Bot, MessageSquare, Loader2, Check } from "lucide-react";

interface MasterTogglesProps {
  initialContactFormEnabled: boolean;
  initialChatbotEnabled: boolean;
  initialPrimaryCtaAction: "open_chat" | "navigate_contact";
}

export function MasterToggles({
  initialContactFormEnabled,
  initialChatbotEnabled,
  initialPrimaryCtaAction,
}: MasterTogglesProps) {
  const [formEnabled, setFormEnabled] = React.useState(initialContactFormEnabled);
  const [chatEnabled, setChatEnabled] = React.useState(initialChatbotEnabled);
  const [primaryCta, setPrimaryCta] = React.useState(initialPrimaryCtaAction);

  const [isUpdatingForm, setIsUpdatingForm] = React.useState(false);
  const [isUpdatingChat, setIsUpdatingChat] = React.useState(false);
  const [isUpdatingCta, setIsUpdatingCta] = React.useState(false);

  async function handleToggleForm() {
    setIsUpdatingForm(true);
    const nextVal = !formEnabled;
    setFormEnabled(nextVal);
    await toggleSetting("enable_contact_form", nextVal);
    setIsUpdatingForm(false);
  }

  async function handleToggleChat() {
    setIsUpdatingChat(true);
    const nextVal = !chatEnabled;
    setChatEnabled(nextVal);
    await toggleSetting("chatbot_enabled", nextVal);
    setIsUpdatingChat(false);
  }

  async function handleCtaChange(action: "open_chat" | "navigate_contact") {
    setIsUpdatingCta(true);
    setPrimaryCta(action);
    await updatePrimaryCta(action);
    setIsUpdatingCta(false);
  }

  return (
    <div className="bg-bg-surface border border-border-grid p-6 space-y-6">
      <div className="border-b border-border-grid pb-3 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block">
            // LIVE_CIRCUIT_BREAKERS
          </span>
          <h2 className="font-display text-xl font-bold text-text-primary">
            Master Infrastructure Switches
          </h2>
        </div>
        <span className="font-mono text-[10px] text-text-muted">
          INSTANT_CACHE_REVALIDATION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggle 1: Contact Form Master Switch */}
        <div className="p-4 bg-bg-elevated border border-border-grid flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent-primary" />
              <span className="font-mono text-xs font-bold text-text-primary">
                Public Consultation Ingest Form
              </span>
            </div>
            <p className="font-sans text-[11px] text-text-muted">
              When toggled OFF, unmounts the form on /contact and locks the database RLS insert policy.
            </p>
          </div>

          <button
            type="button"
            disabled={isUpdatingForm}
            onClick={handleToggleForm}
            className={`w-14 h-8 p-1 transition-colors flex items-center ${
              formEnabled ? "bg-status-operational justify-end" : "bg-border-grid justify-start"
            }`}
          >
            {isUpdatingForm ? (
              <Loader2 className="w-6 h-6 text-white animate-spin mx-auto" />
            ) : (
              <span className="w-6 h-6 bg-white block shadow-md" />
            )}
          </button>
        </div>

        {/* Toggle 2: AI Chatbot Master Switch */}
        <div className="p-4 bg-bg-elevated border border-border-grid flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-accent-signal" />
              <span className="font-mono text-xs font-bold text-text-primary">
                Floating AI Qualification Chatbot
              </span>
            </div>
            <p className="font-sans text-[11px] text-text-muted">
              When toggled OFF, completely unmounts the floating chat widget across all public routes.
            </p>
          </div>

          <button
            type="button"
            disabled={isUpdatingChat}
            onClick={handleToggleChat}
            className={`w-14 h-8 p-1 transition-colors flex items-center ${
              chatEnabled ? "bg-status-operational justify-end" : "bg-border-grid justify-start"
            }`}
          >
            {isUpdatingChat ? (
              <Loader2 className="w-6 h-6 text-white animate-spin mx-auto" />
            ) : (
              <span className="w-6 h-6 bg-white block shadow-md" />
            )}
          </button>
        </div>
      </div>

      {/* Primary CTA Routing Action */}
      <div className="p-4 bg-bg-elevated border border-border-grid space-y-3 font-mono text-xs">
        <span className="font-bold text-text-primary uppercase tracking-wider block">
          // HERO_PRIMARY_CTA_ROUTING
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isUpdatingCta}
            onClick={() => handleCtaChange("open_chat")}
            className={`p-3 border text-start flex items-center justify-between transition-colors ${
              primaryCta === "open_chat"
                ? "border-accent-primary bg-accent-primary/10 text-accent-primary font-bold"
                : "border-border-grid text-text-secondary hover:text-text-primary"
            }`}
          >
            <div>
              <span className="block font-bold">1. Open AI Chatbot</span>
              <span className="font-sans text-[10px] text-text-muted">
                Directly triggers floating qualification window
              </span>
            </div>
            {primaryCta === "open_chat" && <Check className="w-4 h-4 text-accent-primary" />}
          </button>

          <button
            type="button"
            disabled={isUpdatingCta}
            onClick={() => handleCtaChange("navigate_contact")}
            className={`p-3 border text-start flex items-center justify-between transition-colors ${
              primaryCta === "navigate_contact"
                ? "border-accent-primary bg-accent-primary/10 text-accent-primary font-bold"
                : "border-border-grid text-text-secondary hover:text-text-primary"
            }`}
          >
            <div>
              <span className="block font-bold">2. Navigate to /contact</span>
              <span className="font-sans text-[10px] text-text-muted">
                Redirects prospect to consultation ingest page
              </span>
            </div>
            {primaryCta === "navigate_contact" && <Check className="w-4 h-4 text-accent-primary" />}
          </button>
        </div>
      </div>
    </div>
  );
}
