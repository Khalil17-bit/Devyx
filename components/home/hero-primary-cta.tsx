"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, MessageSquare } from "lucide-react";

interface HeroPrimaryCtaProps {
  action: "open_chat" | "navigate_contact";
  label: string;
}

export function HeroPrimaryCta({ action, label }: HeroPrimaryCtaProps) {
  if (action === "open_chat") {
    return (
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("devyx:open-chat"));
        }}
        className="btn-primary clip-chamfer inline-flex items-center gap-2 px-7 py-3.5 bg-accent-primary text-bg-primary font-mono text-sm font-semibold uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
      >
        <span>{label}</span>
        <MessageSquare className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Link
      href="/contact"
      className="btn-primary clip-chamfer inline-flex items-center gap-2 px-7 py-3.5 bg-accent-primary text-bg-primary font-mono text-sm font-semibold uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
    >
      <span>{label}</span>
      <ArrowUpRight className="w-4 h-4" />
    </Link>
  );
}
