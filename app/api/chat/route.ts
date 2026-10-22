import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema, type ChatApiResponse } from "@/lib/validation/chat";
import { hashClientIp } from "@/lib/security/ip-hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";
import {
  DEVYX_AGENCY_CONTEXT,
  buildGeminiSystemPrompt,
  generateDevSimulationResponse,
  type JarvisAction,
  type HandoffData,
  type EstimateData,
} from "@/lib/ai/assistant-context";
import {
  checkAndRecordTokenBudget,
  estimateTokens,
  getTokenLimitMessage,
} from "@/lib/security/token-budget";
import { acquireChatSlot, releaseChatSlot } from "@/lib/queue/chat-queue";
import {
  analyzeAttachmentMultimodal,
  translateToAlgéroisDarija,
  sanitizeDarijaTextV2,
} from "@/lib/ai/darija-engine";

// Vercel Serverless maximum execution duration (PRD Section 7.2)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Standard CORS headers for cross-origin or n8n webhook communication
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-n8n-secret",
};

/**
 * Localized resilient fallback messages when n8n is unreachable or times out
 */
const FALLBACK_RESPONSES: Record<string, string> = {
  darija:
    "سمح لينا، مسار التأهيل الآلي مشغول حالياً بزاف أو غير متاح مؤقتاً. تقدر تواصل مباشرة مع فريق الهندسة ديالنا عبر [واتساب](https://wa.me/213000000000) أو عبر [صفحة التواصل](/ar/contact) باش نجاوبوك فالحين وبأولوية.",
  "ar-MA":
    "سمح لينا، مسار التأهيل الآلي مشغول حالياً بزاف أو غير متاح مؤقتاً. تقدر تواصل مباشرة مع فريق الهندسة ديالنا عبر [واتساب](https://wa.me/213000000000) أو عبر [صفحة التواصل](/ar/contact) باش نجاوبوك فالحين وبأولوية.",
  ar: "مهندس التأهيل الآلي يعالج حالياً عدداً كبيراً من الطلبات أو غير متاح مؤقتاً. يُرجى التواصل مباشرة مع إدارة الهندسة عبر [واتساب](https://wa.me/213000000000) أو [تيليجرام](https://t.me/devyx_official) للحصول على أولوية الدعم الفني.",
  fr: "Notre ingénieur de qualification automatisé traite actuellement un volume élevé de requêtes. Veuillez contacter directement un directeur technique via [WhatsApp](https://wa.me/213000000000) ou [Telegram](https://t.me/devyx_official) pour une prise en charge immédiate.",
  en: "Our automated qualification engineer is currently processing high computational demand or temporarily unreachable. Please connect with an engineering director directly via [WhatsApp](https://wa.me/213000000000) or [Telegram](https://t.me/devyx_official) for immediate technical assistance.",
};

/**
 * Dispatches a formatted Human Handoff alert to the team's Telegram Channel/Group
 */
async function sendTelegramAlert(data: {
  clientName?: string;
  contact?: string;
  summary?: string;
  budget?: string;
  language: string;
  currentPage: string;
  recentQuery: string;
}): Promise<{ dispatched: boolean; simulated?: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.info(
      "[Telegram Alert Simulated] No TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID configured in .env.local. Payload:",
      data
    );
    return { dispatched: true, simulated: true };
  }

  const text =
    `🚨 <b>DEVYX SPECIALIST ALERT: Human Handoff Request</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Client:</b> ${data.clientName || "Direct Website Visitor"}\n` +
    `📱 <b>Contact:</b> <code>${data.contact || "Direct Callback Requested"}</code>\n` +
    `🌐 <b>Language:</b> ${data.language.toUpperCase()}\n` +
    `📍 <b>Origin Page:</b> <code>${data.currentPage}</code>\n` +
    `💰 <b>Budget/Scope:</b> ${data.budget || "Custom Inquiry"}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 <b>Executive Summary:</b>\n` +
    `${data.summary || "Client requested direct communication with technical specialist."}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 <b>Client Message:</b>\n<i>"${data.recentQuery}"</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ <i>Dispatched by Devyx Autonomous AI Terminal</i>`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const resJson = await res.json();
    return { dispatched: !!resJson.ok, simulated: false };
  } catch (err) {
    console.warn("[Telegram Dispatch Network Error]", err);
    return { dispatched: false, simulated: false };
  }
}

/**
 * Returns a localized attachment acknowledgement when Multimodal Vision is not available
 */
function getAttachmentFallbackMessage(
  attachmentName: string,
  attachmentType: string,
  language: string
): string {
  const isImage = attachmentType.startsWith("image/");
  const isPdf = attachmentType === "application/pdf";
  const fileLabel = isImage ? (language === "fr" ? "image" : "image") : isPdf ? "PDF" : "fichier";

  if (language === "darija" || language === "ar-MA") {
    return `Waslatni ${isImage ? "tswira" : "l'fichier PDF"} **${attachmentName}** 📎. Rahom les serveurs ta3 l'analyse occupés chwiya doka. T9der t'contactina direct f [WhatsApp](https://wa.me/213000000000) w tsifet l'fichier bach nchoufouh f lwe9t.`;
  }
  if (language === "ar") {
    return `تم استلام ${isImage ? "الصورة" : "ملف PDF"} **${attachmentName}** 📎. يُرجى إرسال الملف مباشرة عبر [واتساب](https://wa.me/213000000000) للحصول على تحليل فوري من مهندسينا.`;
  }
  if (language === "fr") {
    return `${fileLabel} **${attachmentName}** bien reçu 📎. Notre équipe technique peut analyser votre document directement via [WhatsApp](https://wa.me/213000000000).`;
  }
  return `${fileLabel} **${attachmentName}** received 📎. Please feel free to send this file directly via [WhatsApp](https://wa.me/213000000000) for instant engineering review.`;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  let sessionId = "";
  let slotAcquired = false;

  try {
    // 1. Origin header security validation
    const origin = req.headers.get("origin");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (
      process.env.NODE_ENV === "production" &&
      origin &&
      siteUrl &&
      !origin.includes(new URL(siteUrl).host) &&
      !origin.includes("localhost")
    ) {
      return NextResponse.json(
        { error: "Forbidden cross-origin request" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // 2. Parse and validate JSON body
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload in request body" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const validation = chatMessageSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Payload validation failure",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422, headers: CORS_HEADERS }
      );
    }

    const { sessionId: sid, message, language, currentPage, theme, attachment } = validation.data;
    sessionId = sid;

    // 3. Extract and hash client IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";
    const ipHash = hashClientIp(clientIp);

    // 4. Rate Limiting via PostgreSQL RPC (20 messages per 5 minutes)
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      adminClient = createStaticClient() as any;
    }

    try {
      const { data: isAllowed, error: rpcError } = await adminClient.rpc(
        "check_rate_limit",
        {
          p_key: `chat:${ipHash}`,
          p_max_requests: 20,
          p_window_seconds: 300, // 5 minutes sliding window
        }
      );

      if (!rpcError && isAllowed === false) {
        const rateLimitReply =
          language === "darija" || language === "ar-MA"
            ? "فات الحد الأقصى ديال الرسائل (20 ميساج فـ 5 دقايق). عافاك تسنى شوية ولا تواصل معانا ديريكت فـ واتساب."
            : language === "ar"
            ? "لقد تجاوزت الحد الأقصى المسموح به للمحادثة (20 رسالة لكل 5 دقائق). يُرجى الانتظار قليلاً أو التواصل مباشرة عبر واتساب."
            : language === "fr"
            ? "Limite de requêtes atteinte (20 messages par 5 minutes). Veuillez patienter un instant ou nous contacter sur WhatsApp."
            : "Rate limit exceeded (20 messages per 5-minute window). Please wait a few moments or connect directly via WhatsApp.";

        return NextResponse.json(
          {
            reply: rateLimitReply,
            sessionId,
            error: "RATE_LIMIT_EXCEEDED",
          },
          { status: 429, headers: CORS_HEADERS }
        );
      }
    } catch {
      // Non-blocking if database rate-limit table is offline
    }

    // 5. Token Budget Check (Redis-based, daily + per-session caps)
    const inputTokens = estimateTokens(message + (attachment ? attachment.name + " [attachment]" : ""));
    const budgetResult = await checkAndRecordTokenBudget(ipHash, sessionId, inputTokens);

    if (!budgetResult.allowed) {
      const budgetReply = getTokenLimitMessage(budgetResult.reason!, language);
      return NextResponse.json(
        {
          reply: budgetReply,
          sessionId,
          error: "TOKEN_BUDGET_EXCEEDED",
          tokenBudget: {
            dailyRemaining: budgetResult.dailyRemaining,
            sessionRemaining: budgetResult.sessionRemaining,
          },
        },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    // 6. Concurrent Request Queue — acquire a slot
    const queueState = await acquireChatSlot(sessionId);
    if (queueState.status === "queued") {
      const queueMsg = language === "darija" || language === "ar-MA"
        ? `⏳ كاين ${queueState.position} ${queueState.position === 1 ? "مستخدم" : "مستخدمين"} قدامك. تقدر تسنى حوالي ${Math.round((queueState.estimatedWaitMs || 8000) / 1000)} ثانية — Jarvis غادي يجاوبك فـ دورتك 🤖`
        : language === "ar"
        ? `⏳ يوجد ${queueState.position} ${queueState.position === 1 ? "مستخدم" : "مستخدمين"} أمامك في الطابور. الوقت المتوقع للانتظار: ~${Math.round((queueState.estimatedWaitMs || 8000) / 1000)} ثانية — سيجيبك Jarvis في دورتك`
        : language === "fr"
        ? `⏳ ${queueState.position} utilisateur(s) devant vous. Temps d'attente estimé : ~${Math.round((queueState.estimatedWaitMs || 8000) / 1000)}s — Jarvis vous répondra dès que possible`
        : `⏳ ${queueState.position} user(s) ahead of you. Estimated wait: ~${Math.round((queueState.estimatedWaitMs || 8000) / 1000)}s — Jarvis will respond when it's your turn 🤖`;

      return NextResponse.json(
        {
          reply: queueMsg,
          sessionId,
          queued: true,
          queuePosition: queueState.position,
          estimatedWaitMs: queueState.estimatedWaitMs,
          tokenBudget: {
            dailyRemaining: budgetResult.dailyRemaining,
            sessionRemaining: budgetResult.sessionRemaining,
          },
        },
        { status: 202, headers: CORS_HEADERS }
      );
    }

    slotAcquired = true;

    // 7. Handle File Attachment (Multimodal Analysis: Gemini 3.8 Flash + Groq Qwen Failover)
    let attachmentAnalysis: string | null = null;
    if (attachment) {
      attachmentAnalysis = await analyzeAttachmentMultimodal(
        attachment,
        message,
        language
      );
      if (!attachmentAnalysis) {
        attachmentAnalysis = getAttachmentFallbackMessage(attachment.name, attachment.type, language);
      }
    }

    // 8. Run Local Action & Handoff Detection
    const effectiveMessage = message || (attachment ? `[File: ${attachment.name}]` : "");
    const localJarvis = generateDevSimulationResponse(effectiveMessage, language);

    // If a human handoff or lead was detected, trigger Telegram Dispatch
    if (localJarvis.handoff?.requested) {
      const tgResult = await sendTelegramAlert({
        clientName: localJarvis.handoff.clientName,
        contact: localJarvis.handoff.contact,
        summary: localJarvis.handoff.summary,
        budget: localJarvis.handoff.budget,
        language,
        currentPage,
        recentQuery: effectiveMessage,
      });
      localJarvis.handoff.dispatched = tgResult.dispatched;
    }

    // Helper to format/translate reply according to selected language
    const formatFinalReply = async (rawReply: string): Promise<string> => {
      if (language === "darija" || language === "ar-MA") {
        // If the reply contains English words or Fus'ha/Moroccan leaks, run through translation + 11-tier sanitizer
        if (
          /^[a-zA-Z\s.,!?'"#-]+$/.test(rawReply) &&
          !/\b(salam|mar7ba|kayen|doka|ra7|ta3|mli7|bghit|khedma)\b/i.test(rawReply)
        ) {
          return await translateToAlgéroisDarija(rawReply);
        }
        return sanitizeDarijaTextV2(rawReply).text;
      }
      return rawReply;
    };

    // If attachment was analyzed by Multimodal Vision, use that as the primary reply
    if (attachmentAnalysis) {
      const responsePayload: ChatApiResponse = {
        reply: attachmentAnalysis,
        sessionId,
        actions: localJarvis.actions,
        handoff: localJarvis.handoff,
        estimate: localJarvis.estimate,
        mode: "vision",
        tokenBudget: {
          dailyRemaining: budgetResult.dailyRemaining,
          sessionRemaining: budgetResult.sessionRemaining,
        },
      };
      return NextResponse.json(responsePayload, { headers: CORS_HEADERS });
    }

    // 9. Check upstream n8n webhook configuration
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;

    // If n8n webhook URL is not configured or in local simulation mode
    if (!n8nWebhookUrl || n8nWebhookUrl.trim() === "") {
      const formattedReply = await formatFinalReply(localJarvis.reply);
      const responsePayload: ChatApiResponse = {
        reply: formattedReply,
        sessionId,
        actions: localJarvis.actions,
        handoff: localJarvis.handoff,
        estimate: localJarvis.estimate,
        mode: "simulation",
        tokenBudget: {
          dailyRemaining: budgetResult.dailyRemaining,
          sessionRemaining: budgetResult.sessionRemaining,
        },
      };
      return NextResponse.json(responsePayload, { headers: CORS_HEADERS });
    }

    // 10. Upstream n8n dispatch with 55s timeout controller
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, 55000);

    const upstreamPayload = {
      sessionId,
      message: effectiveMessage,
      language,
      currentPage,
      theme: theme || "dark",
      systemPrompt: buildGeminiSystemPrompt(language),
      websiteContext: {
        agencyName: DEVYX_AGENCY_CONTEXT.name,
        tagline: DEVYX_AGENCY_CONTEXT.brandSubtitle,
        contact: DEVYX_AGENCY_CONTEXT.contact,
        services: DEVYX_AGENCY_CONTEXT.services,
      },
    };

    try {
      const upstreamResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-n8n-secret": n8nWebhookSecret || "",
        },
        body: JSON.stringify(upstreamPayload),
        signal: abortController.signal,
      });

      clearTimeout(timeoutHandle);

      if (!upstreamResponse.ok) {
        throw new Error(`Upstream n8n responded with status ${upstreamResponse.status}`);
      }

      let upstreamData = await upstreamResponse.json();

      // Handle array responses returned by n8n Webhook nodes
      if (Array.isArray(upstreamData) && upstreamData.length > 0) {
        upstreamData = upstreamData[0];
      }

      const rawReply =
        upstreamData.reply ||
        upstreamData.output ||
        upstreamData.message ||
        upstreamData.text ||
        upstreamData.response ||
        localJarvis.reply;

      const reply = await formatFinalReply(rawReply);

      // Merge actions: allow n8n actions or fall back to local Jarvis actions
      const actions: JarvisAction[] =
        Array.isArray(upstreamData.actions) && upstreamData.actions.length > 0
          ? upstreamData.actions
          : localJarvis.actions || [];

      // Check for upstream handoff or trigger telegram alert
      const handoff: HandoffData | undefined = upstreamData.handoff || localJarvis.handoff;
      if (handoff?.requested && !handoff.dispatched) {
        const tgResult = await sendTelegramAlert({
          clientName: handoff.clientName,
          contact: handoff.contact,
          summary: handoff.summary,
          budget: handoff.budget,
          language,
          currentPage,
          recentQuery: effectiveMessage,
        });
        handoff.dispatched = tgResult.dispatched;
      }

      const estimate: EstimateData | undefined = upstreamData.estimate || localJarvis.estimate;

      const responsePayload: ChatApiResponse = {
        reply,
        sessionId: upstreamData.sessionId || sessionId,
        actions,
        handoff,
        estimate,
        tokenBudget: {
          dailyRemaining: budgetResult.dailyRemaining,
          sessionRemaining: budgetResult.sessionRemaining,
        },
      };

      return NextResponse.json(responsePayload, { headers: CORS_HEADERS });
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      const isTimeout = err?.name === "AbortError";
      console.warn(`[Devyx Chat Proxy] Upstream n8n unreachable (${isTimeout ? "Timeout 55s" : err?.message}). Using local Jarvis engine.`);

      const fallbackText = localJarvis.reply || (FALLBACK_RESPONSES[language] || FALLBACK_RESPONSES.en);
      const reply = await formatFinalReply(fallbackText);

      // Resilient Fallback to local Jarvis engine instead of generic error
      const responsePayload: ChatApiResponse = {
        reply,
        sessionId,
        actions: localJarvis.actions,
        handoff: localJarvis.handoff,
        estimate: localJarvis.estimate,
        fallback: true,
        tokenBudget: {
          dailyRemaining: budgetResult.dailyRemaining,
          sessionRemaining: budgetResult.sessionRemaining,
        },
      };
      return NextResponse.json(responsePayload, { headers: CORS_HEADERS });
    }
  } catch (error: any) {
    console.error("[Chat Route Invariant Error]", error);
    return NextResponse.json(
      {
        error: "Internal server error occurred while processing message",
        reply: FALLBACK_RESPONSES.en,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  } finally {
    // Always release the queue slot
    if (slotAcquired && sessionId) {
      await releaseChatSlot(sessionId);
    }
  }
}
