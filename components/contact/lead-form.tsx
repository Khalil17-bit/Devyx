"use client";

import * as React from "react";
import { submitLead } from "@/actions/submit-lead";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedText } from "@/lib/i18n/localize";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  MessageSquare,
  Phone,
} from "lucide-react";
import type { Database } from "@/types/database.types";

type ServiceItem = Database["public"]["Tables"]["services"]["Row"];

interface LeadFormProps {
  services: ServiceItem[];
  defaultService?: string;
}

/**
 * Devyx Consultation Ingest Form Component
 * Strictly adheres to PRD Section 5.4:
 * - Hidden anti-spam honeypot input field
 * - Client-side validation + Server Action submission
 * - IP rate limiting feedback
 * - Success modal with 1-click WhatsApp follow-up option
 */
export function LeadForm({ services, defaultService }: LeadFormProps) {
  const locale = useLocale();
  const tCta = useTranslations("cta");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [submittedData, setSubmittedData] = React.useState<{
    fullName: string;
    serviceType: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("locale", locale);

    const result = await submitLead(formData);

    setIsSubmitting(false);

    if (result.success) {
      const fullName = (formData.get("full_name") as string) || "";
      const serviceType = (formData.get("service_type") as string) || "";
      setSubmittedData({ fullName, serviceType });
      setSuccessModalOpen(true);
      form.reset();
    } else {
      if (result.errors) {
        setFieldErrors(result.errors);
      }
      if (result.message) {
        setServerError(result.message);
      }
    }
  }

  // Pre-configured WhatsApp link for instant follow-up
  const whatsappUrl = submittedData
    ? `https://wa.me/213000000000?text=${encodeURIComponent(
        `Hello Devyx, I have submitted an architectural consultation request for "${submittedData.serviceType}" under the name ${submittedData.fullName}.`
      )}`
    : "https://wa.me/213000000000";

  return (
    <div className="space-y-6">
      {/* Server Error Alert Banner */}
      {serverError && (
        <div className="p-4 bg-status-error/10 border border-status-error text-status-error font-mono text-xs flex items-start gap-3 select-text">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-bold uppercase block">// INGEST_ERROR</span>
            <p className="font-sans text-xs">{serverError}</p>
          </div>
        </div>
      )}

      {/* Consultation Form */}
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs select-none">
        {/* Full Name & Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-start">
            <label htmlFor="full_name" className="text-text-muted uppercase text-[10px] block">
              Full Name *
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              required
              placeholder="e.g. Sarah Connor"
              className={`w-full h-11 px-3 bg-bg-elevated border text-text-primary focus:outline-none transition-colors ${
                fieldErrors.full_name
                  ? "border-status-error focus:border-status-error"
                  : "border-border-grid focus:border-accent-primary"
              }`}
            />
            {fieldErrors.full_name && (
              <p className="text-status-error text-[10px] font-sans">
                {fieldErrors.full_name[0]}
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-start">
            <label htmlFor="phone" className="text-text-muted uppercase text-[10px] block">
              Phone Number (International) *
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              required
              placeholder="+213 555 0192"
              className={`w-full h-11 px-3 bg-bg-elevated border text-text-primary focus:outline-none transition-colors ${
                fieldErrors.phone
                  ? "border-status-error focus:border-status-error"
                  : "border-border-grid focus:border-accent-primary"
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-status-error text-[10px] font-sans">
                {fieldErrors.phone[0]}
              </p>
            )}
          </div>
        </div>

        {/* State/Province & Service Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-start">
            <label htmlFor="state_province" className="text-text-muted uppercase text-[10px] block">
              State / Province / Region *
            </label>
            <input
              id="state_province"
              type="text"
              name="state_province"
              required
              placeholder="e.g. Algiers / Paris / Delaware"
              className={`w-full h-11 px-3 bg-bg-elevated border text-text-primary focus:outline-none transition-colors ${
                fieldErrors.state_province
                  ? "border-status-error focus:border-status-error"
                  : "border-border-grid focus:border-accent-primary"
              }`}
            />
            {fieldErrors.state_province && (
              <p className="text-status-error text-[10px] font-sans">
                {fieldErrors.state_province[0]}
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-start">
            <label htmlFor="service_type" className="text-text-muted uppercase text-[10px] block">
              Requested Service Architecture *
            </label>
            <select
              id="service_type"
              name="service_type"
              defaultValue={defaultService || services[0]?.slug || "web-platform-architecture"}
              className="w-full h-11 px-3 bg-bg-elevated border border-border-grid text-text-primary focus:border-accent-primary focus:outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.slug}>
                  {getLocalizedText(s.title, locale)}
                </option>
              ))}
              <option value="custom-system">Custom Enterprise Architecture</option>
            </select>
          </div>
        </div>

        {/* Project Details Message */}
        <div className="space-y-1.5 text-start">
          <label htmlFor="message" className="text-text-muted uppercase text-[10px] block">
            System Requirements &amp; Project Details (10–3000 chars) *
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Describe your current bottlenecks, target timeline, technical integrations, and expected throughput..."
            className={`w-full p-3 bg-bg-elevated border text-text-primary focus:outline-none resize-none transition-colors ${
              fieldErrors.message
                ? "border-status-error focus:border-status-error"
                : "border-border-grid focus:border-accent-primary"
            }`}
          />
          {fieldErrors.message && (
            <p className="text-status-error text-[10px] font-sans">
              {fieldErrors.message[0]}
            </p>
          )}
        </div>

        {/* Anti-Spam Honeypot Field (Invisible to human users, traps automated crawlers) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="honeypot">Leave this field blank</label>
          <input
            type="text"
            id="honeypot"
            name="honeypot"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary clip-chamfer h-12 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{tCta("sending")}</span>
            </>
          ) : (
            <>
              <span>{tCta("sendMessage")}</span>
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Confirmation Success Modal */}
      <Dialog
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Consultation Ingest Confirmed"
        code="STATUS_200 // TRANSMITTED"
        maxWidth="max-w-lg"
      >
        <div className="text-center space-y-6 py-4 select-text">
          <div className="w-14 h-14 bg-status-operational/10 border border-status-operational text-status-operational flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs text-accent-signal uppercase tracking-technical block">
              // SPECIFICATION_RECORDED
            </span>
            <h3 className="font-display text-2xl font-bold text-text-primary">
              Lead Transmitted Successfully
            </h3>
            <p className="font-sans text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
              Your architectural consultation payload has been written to our secure PostgreSQL cluster. An engineering director will review your requirements within 24 business hours.
            </p>
          </div>

          <div className="p-3 bg-bg-elevated border border-border-grid font-mono text-xs text-start space-y-1">
            <div className="flex justify-between text-text-muted text-[10px]">
              <span>QUEUE_ID:</span>
              <span className="text-text-primary font-bold">#DVX-CONFIRMED</span>
            </div>
            <div className="flex justify-between text-text-muted text-[10px]">
              <span>STATUS:</span>
              <span className="text-status-operational font-bold">QUEUED_FOR_EVALUATION</span>
            </div>
          </div>

          {/* Instant WhatsApp Priority Connect */}
          <div className="pt-2 flex flex-col gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-11 bg-status-operational text-white font-mono text-xs font-semibold uppercase tracking-wider clip-chamfer hover:bg-status-operational/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Priority Follow-up on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setSuccessModalOpen(false)}
              className="w-full h-10 border border-border-grid bg-bg-surface text-text-secondary hover:text-text-primary font-mono text-xs uppercase"
            >
              Close Confirmation
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
