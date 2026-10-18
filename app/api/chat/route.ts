import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema } from "@/lib/validation/chat";
import { hashClientIp } from "@/lib/security/ip-hash";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";

// Vercel Serverless maximum execution duration (PRD Section 7.2)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Localized resilient fallback messages when n8n is unreachable or times out (PRD Section 8)
 */
const FALLBACK_RESPONSES: Record<string, string> = {
  ar: "مهندس التأهيل الآلي يعالج حالياً عدداً كبيراً من الطلبات أو غير متاح مؤقتاً. يُرجى التواصل مباشرة مع إدارة الهندسة عبر [واتساب](https://wa.me/213000000000) أو [تيليجرام](https://t.me/devyx) للحصول على أولوية الدعم الفني.",
  fr: "Notre ingénieur de qualification automatisé traite actuellement un volume élevé de requêtes. Veuillez contacter directement un directeur technique via [WhatsApp](https://wa.me/213000000000) ou [Telegram](https://t.me/devyx) pour une prise en charge immédiate.",
  en: "Our automated qualification engineer is currently processing high computational demand or temporarily unreachable. Please connect with an engineering director directly via [WhatsApp](https://wa.me/213000000000) or [Telegram](https://t.me/devyx) for immediate technical assistance.",
};

const DEV_SIMULATION_RESPONSES: Record<string, string> = {
  ar: "أهلاً بك في ديفيكس! أنظمتنا الهندسية متخصصة في منصات الويب فائقة السرعة، وتطبيقات الهواتف الذكية، وأتمتة مسارات n8n. يمكنك كتابة استفسارك بالتفصيل أو تحديد موعد مباشرة عبر [صفحة التواصل](/ar/contact).",
  fr: "Bienvenue chez Devyx ! Nos systèmes d'ingénierie sont spécialisés dans les plateformes web haute performance, les applications mobiles et l'automatisation n8n. Quel est l'objectif de votre projet ? Vous pouvez également planifier une consultation sur notre [Page Contact](/fr/contact).",
  en: "Welcome to Devyx! Our engineering architecture specializes in high-throughput web applications, cross-platform mobile systems, and autonomous n8n automation pipelines. What are the core parameters of your project? You can also schedule an architectural consultation on our [Contact Page](/en/contact).",
};

export async function POST(req: NextRequest) {
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
        { status: 403 }
      );
    }

    // 2. Parse and validate JSON body
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload in request body" },
        { status: 400 }
      );
    }

    const validation = chatMessageSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Payload validation failure",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { sessionId, message, language, currentPage } = validation.data;

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
          language === "ar"
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
          { status: 429 }
        );
      }
    } catch {
      // Non-blocking if database rate-limit table is offline
    }

    // 5. Check upstream n8n webhook configuration
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;

    // If n8n webhook URL is not configured in local environment, provide a realistic AI simulation
    if (!n8nWebhookUrl || n8nWebhookUrl.trim() === "") {
      const simReply = DEV_SIMULATION_RESPONSES[language] || DEV_SIMULATION_RESPONSES.en;
      return NextResponse.json({
        reply: `${simReply}\n\n*System Note: n8n webhook is not configured in this environment. Reply generated by local qualification stub.*`,
        sessionId,
      });
    }

    // 6. Upstream n8n dispatch with 55s timeout controller (PRD Section 7.2)
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, 55000); // 55 seconds upstream timeout (well within Vercel 60s maxDuration)

    try {
      const upstreamResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-n8n-secret": n8nWebhookSecret || "",
        },
        body: JSON.stringify({
          sessionId,
          message,
          language,
          currentPage,
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutHandle);

      if (!upstreamResponse.ok) {
        throw new Error(`Upstream n8n responded with status ${upstreamResponse.status}`);
      }

      const upstreamData = await upstreamResponse.json();
      const reply =
        upstreamData.reply ||
        upstreamData.output ||
        upstreamData.message ||
        upstreamData.text ||
        "Payload ingested by Devyx workflow agent.";

      return NextResponse.json({
        reply,
        sessionId: upstreamData.sessionId || sessionId,
      });
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      const isTimeout = err?.name === "AbortError";
      console.warn(`[Devyx Chat Proxy] Upstream failure (${isTimeout ? "Timeout 55s" : err?.message})`);

      // 7. Resilient Fallback mechanism (PRD Section 8)
      const fallbackReply = FALLBACK_RESPONSES[language] || FALLBACK_RESPONSES.en;
      return NextResponse.json({
        reply: fallbackReply,
        sessionId,
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error("[Chat Route Invariant Error]", error);
    return NextResponse.json(
      {
        error: "Internal server error occurred while processing message",
        reply: FALLBACK_RESPONSES.en,
      },
      { status: 500 }
    );
  }
}
