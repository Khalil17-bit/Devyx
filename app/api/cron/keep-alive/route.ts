import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Free-Tier Database Inactivity Keep-Alive Cron Endpoint
 * Strictly adheres to PRD Section 2.2 & Phase 8:
 *
 * 1. Verifies Bearer CRON_SECRET or x-cron-secret header (Vercel Cron standard)
 * 2. Executes a lightweight single-row primary-key read on site_settings
 * 3. Keeps Supabase PostgreSQL active to prevent free-tier 7-day auto-pausing
 */
async function handleKeepAlive(req: NextRequest) {
  try {
    // 1. Authorization Verification
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const customCronHeader = req.headers.get("x-cron-secret");

    // Enforce authorization if CRON_SECRET is configured
    if (cronSecret && cronSecret.trim() !== "") {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isCustomHeaderValid = customCronHeader === cronSecret;

      if (!isBearerValid && !isCustomHeaderValid) {
        return NextResponse.json(
          {
            error: "UNAUTHORIZED",
            message: "Missing or invalid cron authorization secret",
          },
          { status: 401 }
        );
      }
    }

    // 2. Resolve database client (Prefer Admin Service Role, fallback to Static Client)
    let client: any;
    try {
      client = createAdminClient();
    } catch {
      client = createStaticClient();
    }

    // 3. Execute lightweight single-row read against site_settings (id = 1)
    const { data, error } = await client
      .from("site_settings")
      .select("id, brand_name, updated_at")
      .eq("id", 1)
      .single();

    if (error) {
      console.warn("[Keep-Alive Warning] Database query reported issue:", error.message);
      return NextResponse.json(
        {
          status: "degraded",
          database: "query_error",
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 200 } // Return 200 so Vercel doesn't mark the cron execution as crashed
      );
    }

    // 4. Return success telemetry
    return NextResponse.json({
      status: "alive",
      database: "connected",
      record: {
        id: data?.id,
        brand: data?.brand_name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Keep-Alive Exception]", err);
    return NextResponse.json(
      {
        status: "error",
        message: err?.message || "Internal server error during keep-alive ping",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Vercel Cron sends GET requests by default
export async function GET(req: NextRequest) {
  return handleKeepAlive(req);
}

// Also accept POST for manual administrative triggering
export async function POST(req: NextRequest) {
  return handleKeepAlive(req);
}
