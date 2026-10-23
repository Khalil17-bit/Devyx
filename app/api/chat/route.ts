import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema, type ChatApiResponse } from "@/lib/validation/chat";
import { hashClientIp } from "@/lib/security/ip-hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";
import {
  DEVYX_AGENCY_CONTEXT,
  buildGeminiSystemPrompt,
  generateDevSimulationResponse,
  detectLanguage,
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
import { getSessionHistory, appendSessionHistory } from "@/lib/redis/client";
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
  history?: Array<{ role: string; content: string }>;
}): Promise<{ dispatched: boolean; simulated?: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005";

  if (!token || !chatId) {
    console.info(
      "[Telegram Alert Simulated] No TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID configured in .env.local. Payload:",
      data
    );
    return { dispatched: true, simulated: true };
  }

  // Extract phone number or email if present in contact, recentQuery, or history
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,6}/;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  let detectedPhone: string | null = null;
  let detectedEmail: string | null = null;

  if (data.contact && data.contact !== "Requesting Callback") {
    const p = data.contact.match(phoneRegex);
    if (p) detectedPhone = p[0].trim();
    const e = data.contact.match(emailRegex);
    if (e) detectedEmail = e[0].trim();
  }

  if (!detectedPhone) {
    const p = data.recentQuery.match(phoneRegex);
    if (p) detectedPhone = p[0].trim();
  }
  if (!detectedEmail) {
    const e = data.recentQuery.match(emailRegex);
    if (e) detectedEmail = e[0].trim();
  }

  if ((!detectedPhone || !detectedEmail) && data.history && data.history.length > 0) {
    for (const h of data.history) {
      if (!detectedPhone) {
        const p = h.content.match(phoneRegex);
        if (p) detectedPhone = p[0].trim();
      }
      if (!detectedEmail) {
        const e = h.content.match(emailRegex);
        if (e) detectedEmail = e[0].trim();
      }
    }
  }

  // Build clean international phone number for WhatsApp link
  let cleanPhone = "";
  if (detectedPhone) {
    cleanPhone = detectedPhone.replace(/[^\d+]/g, "");
    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
      cleanPhone = "213" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("+")) {
      cleanPhone = cleanPhone.slice(1);
    }
  }

  // Format multi-turn conversation recap for admin context
  let recapBlock = "";
  if (data.history && data.history.length > 0) {
    const turns = data.history.slice(-5).map((h) => {
      const speaker = h.role === "user" ? "👤 Client" : "🤖 Assistant";
      const cleanContent = h.content
        .replace(/<[^>]*>/g, "")
        .replace(/\[ACTION:[^\]]+\]/g, "")
        .trim()
        .slice(0, 160);
      return `<b>${speaker}:</b> <i>"${cleanContent}"</i>`;
    }).join("\n");
    recapBlock = `\n━━━━━━━━━━━━━━━━━━━━━\n💬 <b>Conversation Context:</b>\n${turns}\n`;
  }

  const contactDisplay = detectedPhone
    ? `<code>${detectedPhone}</code> (WhatsApp / Tel)`
    : detectedEmail
    ? `<code>${detectedEmail}</code> (Email)`
    : data.contact && data.contact !== "Requesting Callback"
    ? `<code>${data.contact}</code>`
    : `⚠️ <i>Pending visitor input (Active on site)</i>`;

  const text =
    `🚨 <b>DEVYX SPECIALIST ALERT: Human Handoff Request</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Client:</b> ${data.clientName || "Direct Website Visitor"}\n` +
    `📱 <b>Contact:</b> ${contactDisplay}\n` +
    `🌐 <b>Language:</b> ${data.language.toUpperCase()}\n` +
    `📍 <b>Origin Page:</b> <code>${data.currentPage}</code>\n` +
    (data.budget ? `💰 <b>Budget/Scope:</b> ${data.budget}\n` : "") +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 <b>Executive Summary:</b>\n` +
    `${data.summary || "Client requested direct communication with a technical specialist."}\n` +
    recapBlock +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 <b>Client Message:</b>\n<i>"${data.recentQuery}"</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ <i>Dispatched by Devyx Autonomous AI Terminal</i>`;

  // Inline action buttons for admin to immediately speak with client
  const inlineButtons: Array<Array<{ text: string; url: string }>> = [];
  const contactRow: Array<{ text: string; url: string }> = [];

  if (cleanPhone) {
    contactRow.push({ text: "💬 Chat on WhatsApp", url: `https://wa.me/${cleanPhone}` });
    contactRow.push({ text: "📞 Call Client", url: `tel:${cleanPhone}` });
  } else if (detectedEmail) {
    contactRow.push({ text: "✉️ Email Client", url: `mailto:${detectedEmail}` });
  }

  if (contactRow.length > 0) {
    inlineButtons.push(contactRow);
  }

  const pageUrl = data.currentPage.startsWith("http")
    ? data.currentPage
    : `${siteUrl}${data.currentPage}`;
  inlineButtons.push([{ text: "🌐 Open Origin Page", url: pageUrl }]);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: inlineButtons,
        },
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
 * Returns a notice when the upstream n8n automation engine is offline/sleeping
 */
function getN8nSleepingNotice(language: string): string {
  if (language === "darija" || language === "ar-MA") {
    return "😴 *(L'moteur n8n raho na3es doka — l'assistant IA raho khdam f mode standby)*\n\n";
  }
  if (language === "ar") {
    return "😴 *(محرك الأتمتة n8n في وضع النوم حالياً — المساعد الذكي يعمل في وضع الاستعداد المستقل)*\n\n";
  }
  if (language === "fr") {
    return "😴 *(Le moteur n8n est actuellement en veille — l'assistant IA fonctionne en mode autonome)*\n\n";
  }
  return "😴 *(n8n automation engine is currently sleeping — AI assistant is operating in local standby mode)*\n\n";
}

/**
 * Returns a localized attachment acknowledgement when Multimodal Vision is not available
 */
function getAttachmentFallbackMessage(
  attachmentName: string,
  attachmentType: string,
  language: string
): string {
  if (language === "darija" || language === "ar-MA") {
    return `Waslatni tswira **${attachmentName}** 📎. T9der t'contactina direct f [WhatsApp](https://wa.me/213000000000) bach nchoufouha m3ak f lwe9t.`;
  }
  if (language === "ar") {
    return `تم استلام الصورة **${attachmentName}** 📎 بنجاح. يمكنك مناقشتها معنا عبر [واتساب](https://wa.me/213000000000).`;
  }
  if (language === "fr") {
    return `Image **${attachmentName}** bien reçue 📎. Discutons-en directement via [WhatsApp](https://wa.me/213000000000).`;
  }
  return `Image **${attachmentName}** received 📎. Feel free to connect via [WhatsApp](https://wa.me/213000000000) for instant engineering review.`;
}

/**
 * Extracts action tags (e.g. [ACTION:NAVIGATE:/projects], [ACTION:THEME:dark]) from LLM output,
 * strips them from the visible response, and converts them to structured JarvisAction objects.
 */
function parseActionTags(raw: string): { cleanedText: string; actions: JarvisAction[] } {
  const actions: JarvisAction[] = [];
  if (!raw) return { cleanedText: "", actions };

  let cleaned = raw;

  // 1. Navigation tags: [ACTION:NAVIGATE:/path]
  const navMatches = [...cleaned.matchAll(/\[ACTION:NAVIGATE:(.+?)\]/gi)];
  for (const match of navMatches) {
    let target = match[1]?.trim();
    if (target) {
      // Strip any locale prefix like /en/projects -> /projects
      target = target.replace(/^\/(?:en|fr|ar)(\/.*)?$/, "$1") || target;
      if (!target.startsWith("/")) target = `/${target}`;
      actions.push({ type: "NAVIGATE", payload: target });
    }
  }
  cleaned = cleaned.replace(/\[ACTION:NAVIGATE:.+?\]/gi, "").trim();

  // 2. Theme tags: [ACTION:THEME:dark] or [ACTION:THEME:light]
  const themeMatches = [...cleaned.matchAll(/\[ACTION:THEME:(dark|light)\]/gi)];
  for (const match of themeMatches) {
    actions.push({ type: "SET_THEME", payload: match[1].toLowerCase() as "dark" | "light" });
  }
  cleaned = cleaned.replace(/\[ACTION:THEME:.+?\]/gi, "").trim();

  // 3. Language / Locale tags: [ACTION:SET_LOCALE:fr] or [ACTION:LOCALE:darija]
  const localeMatches = [...cleaned.matchAll(/\[ACTION:(?:SET_)?LOCALE:(fr|darija|en|ar)\]/gi)];
  for (const match of localeMatches) {
    actions.push({ type: "SET_LOCALE", payload: match[1].toLowerCase() });
  }
  cleaned = cleaned.replace(/\[ACTION:(?:SET_)?LOCALE:.+?\]/gi, "").trim();

  return { cleanedText: cleaned, actions };
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

    const {
      sessionId: sid,
      message,
      language: rawLanguage,
      currentPage,
      theme,
      attachment,
      history: clientHistory,
    } = validation.data;
    sessionId = sid;

    // Resolve conversation history (client-provided for 0ms latency; fallback to Redis)
    let conversationHistory = clientHistory && clientHistory.length > 0 ? clientHistory : [];
    if (conversationHistory.length === 0 && sessionId) {
      try {
        conversationHistory = await getSessionHistory(sessionId);
      } catch {
        // Non-blocking fallback
      }
    }

    // Resolve language dynamically if set to "auto" or omitted
    const language =
      rawLanguage === "auto" || !rawLanguage
        ? detectLanguage(message)
        : rawLanguage;

    // 3. Extract and hash client IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";
    const ipHash = hashClientIp(clientIp);

    // 4. Rate Limiting via PostgreSQL RPC (skipped if using placeholder URL)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isLiveSupabase = supabaseUrl && !supabaseUrl.includes("placeholder.supabase.co");

    if (isLiveSupabase) {
      try {
        let adminClient;
        try {
          adminClient = createAdminClient();
        } catch {
          adminClient = createStaticClient() as any;
        }

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
    }

    // 5. Token Budget Check (Redis-based, daily + per-session caps)
    const inputTokens = estimateTokens(message + (attachment ? attachment.name + " [attachment]" : ""));
    const budgetResult = await checkAndRecordTokenBudget(ipHash, sessionId, inputTokens);

    if (!budgetResult.allowed) {
      const budgetReply = getTokenLimitMessage(budgetResult.reason!, language, budgetResult.resetsInMinutes);
      return NextResponse.json(
        {
          reply: budgetReply,
          sessionId,
          error: "TOKEN_BUDGET_EXCEEDED",
          tokenBudget: {
            hourlyRemaining: budgetResult.hourlyRemaining,
            sessionRemaining: budgetResult.sessionRemaining,
            hourlyLimit: budgetResult.hourlyLimit,
            resetsInMinutes: budgetResult.resetsInMinutes,
            dailyRemaining: budgetResult.hourlyRemaining,
          },
        },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    // 6. Concurrent Request Queue — acquire a slot (with micro-wait)
    const queueState = await acquireChatSlot(sessionId);
    if (queueState.status === "queued") {
      const waitSeconds = Math.max(1, Math.round((queueState.estimatedWaitMs || 1200) / 1000));
      const queueMsg =
        language === "darija" || language === "ar-MA"
          ? `⏳ كاين ${queueState.position} مستخدم قدامك فـ الطابور. وقت الانتظار: ~${waitSeconds} ثانية — المساعد الذكي غادي يجاوبك فـ دورتك 🤖`
          : language === "ar"
          ? `⏳ يوجد ${queueState.position} مستخدم أمامك في طابور الانتظار. وقت الانتظار: ~${waitSeconds} ثانية — سيجيبك المساعد الذكي تلقائياً`
          : language === "fr"
          ? `⏳ Requête en file d'attente (position #${queueState.position}). Attente estimée : ~${waitSeconds}s — traitement en cours`
          : `⏳ High traffic: Position #${queueState.position} in queue. Estimated wait: ~${waitSeconds}s — processing shortly 🤖`;

      return NextResponse.json(
        {
          reply: queueMsg,
          sessionId,
          queued: true,
          queuePosition: queueState.position,
          estimatedWaitMs: queueState.estimatedWaitMs,
          tokenBudget: {
            hourlyRemaining: budgetResult.hourlyRemaining,
            sessionRemaining: budgetResult.sessionRemaining,
            hourlyLimit: budgetResult.hourlyLimit,
            resetsInMinutes: budgetResult.resetsInMinutes,
            dailyRemaining: budgetResult.hourlyRemaining,
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
    const localJarvis = generateDevSimulationResponse(effectiveMessage, language, conversationHistory);

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
        history: conversationHistory,
      });
      localJarvis.handoff.dispatched = tgResult.dispatched;
    }

    // Helper to format/translate reply according to selected language
    const formatFinalReply = async (rawReply: string, targetLocale?: string): Promise<string> => {
      const activeLanguage = targetLocale || language;
      if (activeLanguage === "darija" || activeLanguage === "ar-MA") {
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
        reply: await formatFinalReply(attachmentAnalysis),
        sessionId,
        actions: localJarvis.actions,
        handoff: localJarvis.handoff,
        estimate: localJarvis.estimate,
        mode: "vision",
        tokenBudget: {
          hourlyRemaining: budgetResult.hourlyRemaining,
          sessionRemaining: budgetResult.sessionRemaining,
          hourlyLimit: budgetResult.hourlyLimit,
          resetsInMinutes: budgetResult.resetsInMinutes,
          dailyRemaining: budgetResult.hourlyRemaining,
        },
      };
      appendSessionHistory(sessionId, effectiveMessage, responsePayload.reply).catch(() => {});
      return NextResponse.json(responsePayload, { headers: CORS_HEADERS });
    }

    // 9. Instant pure action bypass (Theme change, Navigation, Locale switch = 0ms response)
    const isPureAction = localJarvis.actions?.some(
      (a) => a.type === "SET_THEME" || a.type === "NAVIGATE" || a.type === "SET_LOCALE"
    );

    if (isPureAction) {
      const localeAction = localJarvis.actions?.find((a) => a.type === "SET_LOCALE");
      const targetLocale = typeof localeAction?.payload === "string" ? localeAction.payload : undefined;
      const responsePayload: ChatApiResponse = {
        reply: await formatFinalReply(localJarvis.reply, targetLocale),
        sessionId,
        actions: localJarvis.actions,
        handoff: localJarvis.handoff,
        estimate: localJarvis.estimate,
        tokenBudget: {
          hourlyRemaining: budgetResult.hourlyRemaining,
          sessionRemaining: budgetResult.sessionRemaining,
          hourlyLimit: budgetResult.hourlyLimit,
          resetsInMinutes: budgetResult.resetsInMinutes,
          dailyRemaining: budgetResult.hourlyRemaining,
        },
      };
      appendSessionHistory(sessionId, effectiveMessage, responsePayload.reply).catch(() => {});
      return NextResponse.json(responsePayload, { headers: CORS_HEADERS });
    }

    // 10. Ultra-Fast Multi-Provider AI Engine (Groq LPU Priority #1: ~150-250ms)
    const sysPrompt = buildGeminiSystemPrompt(language);

    const groqHistoryTurns = conversationHistory.slice(-8).map((h) => ({
      role: (h.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: h.content,
    }));

    const callGroq = async (key: string, label: string) => {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: [
              { role: "system", content: sysPrompt },
              ...groqHistoryTurns,
              { role: "user", content: effectiveMessage },
            ],
            temperature: 0.15,
            max_tokens: 300,
          }),
          signal: AbortSignal.timeout(3500),
        });
        if (res.ok) {
          const j = await res.json();
          return j.choices?.[0]?.message?.content?.trim() || null;
        }
      } catch (e) {
        console.warn(`[Direct ${label} Failed]`, e);
      }
      return null;
    };

    const geminiHistoryTurns = conversationHistory.slice(-6).map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));

    const callGemini = async (key: string, label: string) => {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: sysPrompt }] },
              contents: [
                ...geminiHistoryTurns,
                { role: "user", parts: [{ text: effectiveMessage }] },
              ],
              generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
            }),
            signal: AbortSignal.timeout(2500),
          }
        );
        if (res.ok) {
          const j = await res.json();
          return j.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
        }
      } catch (e) {
        console.warn(`[Direct ${label} Failed]`, e);
      }
      return null;
    };

    const resolveFastAi = async (): Promise<string | null> => {
      // Tier 1: Groq Primary (LPU engine, fastest response)
      const groqKey1 = process.env.GROQ_API_KEY?.trim();
      if (groqKey1) {
        const r = await callGroq(groqKey1, "Groq Primary");
        if (r) return r;
      }

      // Tier 2: Groq Secondary
      const groqKey2 = process.env.GROQ_API_KEY_SECONDARY?.trim();
      if (groqKey2 && groqKey2 !== groqKey1) {
        const r = await callGroq(groqKey2, "Groq Secondary");
        if (r) return r;
      }

      // Tier 3: Gemini Primary (Fallback)
      const geminiKey1 = process.env.GEMINI_API_KEY?.trim();
      if (geminiKey1) {
        const r = await callGemini(geminiKey1, "Gemini Primary");
        if (r) return r;
      }

      // Tier 4: Gemini Secondary (Fallback)
      const geminiKey2 = process.env.GEMINI_API_KEY_SECONDARY?.trim();
      if (geminiKey2 && geminiKey2 !== geminiKey1) {
        const r = await callGemini(geminiKey2, "Gemini Secondary");
        if (r) return r;
      }

      return null;
    };

    // 11. Upstream n8n webhook runner with fast 1.2s timeout
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;

    const tryN8n = async (): Promise<{ reply?: string; actions?: JarvisAction[]; handoff?: HandoffData; estimate?: EstimateData } | null> => {
      if (!n8nWebhookUrl || n8nWebhookUrl.trim() === "") return null;
      try {
        const upstreamPayload = {
          sessionId,
          message: effectiveMessage,
          language,
          currentPage,
          theme: theme || "dark",
          systemPrompt: sysPrompt,
          history: conversationHistory.slice(-8),
          websiteContext: {
            agencyName: DEVYX_AGENCY_CONTEXT.name,
            tagline: DEVYX_AGENCY_CONTEXT.brandSubtitle,
            contact: DEVYX_AGENCY_CONTEXT.contact,
            services: DEVYX_AGENCY_CONTEXT.services,
          },
        };

        const upstreamResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-n8n-secret": n8nWebhookSecret || "",
          },
          body: JSON.stringify(upstreamPayload),
          signal: AbortSignal.timeout(1200),
        });

        if (!upstreamResponse.ok) return null;
        let upstreamData = await upstreamResponse.json();
        if (Array.isArray(upstreamData) && upstreamData.length > 0) upstreamData = upstreamData[0];
        const r = upstreamData?.reply || upstreamData?.output || upstreamData?.message || upstreamData?.text;
        if (r && typeof r === "string" && r.trim() !== "") {
          return {
            reply: r.trim(),
            actions: upstreamData.actions,
            handoff: upstreamData.handoff,
            estimate: upstreamData.estimate,
          };
        }
        return null;
      } catch {
        return null;
      }
    };

    // 12. High-Speed Parallel Race: Groq LPU + n8n Webhook concurrently
    let finalRawReply: string | null | undefined = null;
    let n8nActions: JarvisAction[] | undefined;
    let n8nHandoff: HandoffData | undefined;
    let n8nEstimate: EstimateData | undefined;

    const fastAiPromise = resolveFastAi();
    const n8nPromise = tryN8n();

    try {
      const winner = await Promise.any([
        fastAiPromise.then((aiReply) => {
          if (!aiReply) throw new Error("AI returned empty");
          return { source: "fastAi" as const, reply: aiReply, actions: undefined, handoff: undefined, estimate: undefined };
        }),
        n8nPromise.then((n8nRes) => {
          if (!n8nRes || !n8nRes.reply) throw new Error("n8n returned empty");
          return { source: "n8n" as const, ...n8nRes };
        }),
      ]);

      finalRawReply = winner.reply;
      if (winner.source === "n8n") {
        n8nActions = winner.actions;
        n8nHandoff = winner.handoff;
        n8nEstimate = winner.estimate;
      }
    } catch {
      finalRawReply = (await fastAiPromise) || (await n8nPromise)?.reply || localJarvis.reply || (FALLBACK_RESPONSES[language] || FALLBACK_RESPONSES.en);
    }

    // Parse autonomous action tags from AI response
    const parsedAction = parseActionTags(finalRawReply || localJarvis.reply || "");
    const localeAction =
      parsedAction.actions.find((a) => a.type === "SET_LOCALE") ||
      localJarvis.actions?.find((a) => a.type === "SET_LOCALE");
    const targetLocale = typeof localeAction?.payload === "string" ? localeAction.payload : undefined;
    const reply = await formatFinalReply(
      parsedAction.cleanedText || localJarvis.reply || FALLBACK_RESPONSES.en,
      targetLocale
    );

    // Merge actions from n8n, parsed tags, and local Jarvis
    const actions: JarvisAction[] = [];
    if (Array.isArray(n8nActions) && n8nActions.length > 0) {
      actions.push(...n8nActions);
    }
    if (parsedAction.actions.length > 0) {
      for (const act of parsedAction.actions) {
        if (!actions.some((a) => a.type === act.type && a.payload === act.payload)) {
          actions.push(act);
        }
      }
    }
    if (localJarvis.actions && localJarvis.actions.length > 0) {
      for (const act of localJarvis.actions) {
        if (!actions.some((a) => a.type === act.type)) {
          actions.push(act);
        }
      }
    }

    // Heuristic navigation fallback: if text confirms navigation but action was omitted
    const hasNav = actions.some((a) => a.type === "NAVIGATE");
    if (!hasNav) {
      const combined = `${effectiveMessage} ${reply}`.toLowerCase();
      if (
        (combined.includes("/projects") || combined.includes("projects") || combined.includes("portfolio") || combined.includes("مشاريع")) &&
        (combined.includes("navigate") || combined.includes("open") || combined.includes("taking you") || combined.includes("redirige") || combined.includes("ditek") || combined.includes("explore"))
      ) {
        actions.push({ type: "NAVIGATE", payload: "/projects" });
      } else if (
        (combined.includes("/services") || combined.includes("services") || combined.includes("خدمات")) &&
        (combined.includes("navigate") || combined.includes("open") || combined.includes("taking you") || combined.includes("redirige") || combined.includes("ditek"))
      ) {
        actions.push({ type: "NAVIGATE", payload: "/services" });
      } else if (
        (combined.includes("/contact") || combined.includes("contact") || combined.includes("تواصل")) &&
        (combined.includes("navigate") || combined.includes("open") || combined.includes("taking you") || combined.includes("redirige") || combined.includes("ditek"))
      ) {
        actions.push({ type: "NAVIGATE", payload: "/contact" });
      }
    }

    const handoff: HandoffData | undefined = n8nHandoff || localJarvis.handoff;
    const estimate: EstimateData | undefined = n8nEstimate || localJarvis.estimate;

    // Check for handoff or trigger telegram alert
    if (handoff?.requested && !handoff.dispatched) {
      const tgResult = await sendTelegramAlert({
        clientName: handoff.clientName,
        contact: handoff.contact,
        summary: handoff.summary,
        budget: handoff.budget,
        language,
        currentPage,
        recentQuery: effectiveMessage,
        history: conversationHistory,
      });
      handoff.dispatched = tgResult.dispatched;
    }

    // Asynchronously record turn to Redis session history
    appendSessionHistory(sessionId, effectiveMessage, reply).catch((err) => {
      console.warn("[Redis appendSessionHistory Error]", err);
    });

    const responsePayload: ChatApiResponse = {
      reply,
      sessionId,
      actions,
      handoff,
      estimate,
      tokenBudget: {
        hourlyRemaining: budgetResult.hourlyRemaining,
        sessionRemaining: budgetResult.sessionRemaining,
        hourlyLimit: budgetResult.hourlyLimit,
        resetsInMinutes: budgetResult.resetsInMinutes,
        dailyRemaining: budgetResult.hourlyRemaining,
      },
    };
    return NextResponse.json(responsePayload, { headers: CORS_HEADERS });
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
