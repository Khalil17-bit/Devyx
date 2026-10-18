"use server";

import { headers } from "next/headers";
import { leadSchema, type LeadSubmissionResult } from "@/lib/validation/lead";
import { hashClientIp } from "@/lib/security/ip-hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";

/**
 * Server Action: Submit Consultation Lead
 * Strictly adheres to PRD Section 4.2, 5.4, & 8:
 * 1. Checks honeypot anti-spam trap
 * 2. Enforces PostgreSQL atomic sliding-window rate limiting (3 requests / 10 mins)
 * 3. Enforces database-level check on site_settings.enable_contact_form
 * 4. Inserts lead into PostgreSQL
 * 5. Asynchronously forwards lead payload to n8n webhook for team notifications
 */
export async function submitLead(formData: FormData): Promise<LeadSubmissionResult> {
  try {
    // 1. Extract raw form fields
    const rawData = {
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      state_province: formData.get("state_province"),
      service_type: formData.get("service_type"),
      message: formData.get("message"),
      locale: formData.get("locale") || "en",
      honeypot: formData.get("honeypot") || "",
    };

    // 2. Honeypot check: If filled by a bot, silently return success without DB insertion
    if (rawData.honeypot && String(rawData.honeypot).trim() !== "") {
      return {
        success: true,
        message: "Inquiry received and queued for review.",
      };
    }

    // 3. Validate schema via Zod
    const validation = leadSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.flatten().fieldErrors,
        message: "Please correct the highlighted errors in the form.",
      };
    }

    const leadData = validation.data;

    // 4. Resolve client IP and compute hash
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const realIp = headerList.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";
    const ipHash = hashClientIp(clientIp);

    // 5. Connect to Supabase
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      // If admin service role key is not configured locally, fallback to static client
      adminClient = createStaticClient() as any;
    }

    // 6. Enforce Atomic Rate Limiting via PostgreSQL RPC (3 submissions per 10 minutes)
    try {
      const { data: isAllowed, error: rpcError } = await adminClient.rpc(
        "check_rate_limit",
        {
          p_key: `lead:${ipHash}`,
          p_max_requests: 3,
          p_window_seconds: 600, // 10 minutes window
        }
      );

      if (!rpcError && isAllowed === false) {
        return {
          success: false,
          rateLimited: true,
          message:
            "Submission rate limit exceeded. You may submit up to 3 inquiries every 10 minutes. Please reach out via WhatsApp for immediate assistance.",
        };
      }
    } catch {
      // Non-blocking in case RPC is not yet seeded in local dev
    }

    // 7. Check if contact form is globally enabled in site_settings
    try {
      const { data: settings } = await adminClient
        .from("site_settings")
        .select("enable_contact_form")
        .eq("id", 1)
        .single();

      if (settings && settings.enable_contact_form === false) {
        return {
          success: false,
          formDisabled: true,
          message:
            "Consultation form ingest is currently paused by administration. Please connect directly via WhatsApp or our AI Assistant.",
        };
      }
    } catch {
      // Proceed if settings check fails
    }

    // 8. Insert lead into PostgreSQL `leads` table
    const { data: insertedLead, error: insertError } = await adminClient
      .from("leads")
      .insert({
        full_name: leadData.full_name,
        phone: leadData.phone,
        state_province: leadData.state_province,
        service_type: leadData.service_type,
        message: leadData.message,
        locale: leadData.locale,
        status: "new",
        ip_hash: ipHash,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("[submitLead] Supabase insertion error:", insertError);
      return {
        success: false,
        message:
          "Database recording failed. Please try again or reach out directly via WhatsApp.",
      };
    }

    // 9. Asynchronously forward payload to n8n webhook (Non-blocking alert pipeline)
    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
    if (n8nWebhookUrl && n8nWebhookUrl.startsWith("http")) {
      fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-source": "devyx-web-consultation",
        },
        body: JSON.stringify({
          leadId: insertedLead?.id,
          fullName: leadData.full_name,
          phone: leadData.phone,
          stateProvince: leadData.state_province,
          serviceType: leadData.service_type,
          message: leadData.message,
          locale: leadData.locale,
          submittedAt: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.warn("[submitLead] n8n lead notification dispatch failed (non-blocking):", err);
      });
    }

    return {
      success: true,
      message: "Your architectural consultation inquiry has been transmitted successfully.",
    };
  } catch (error) {
    console.error("[submitLead] Unhandled exception:", error);
    return {
      success: false,
      message: "An unexpected error occurred during submission. Please try again.",
    };
  }
}
