/**
 * Devyx End-to-End System Verification Test Harness
 * Evaluates Phase 10 validation points:
 * 1. Localization fallback engine & JSON message trees
 * 2. Blueprint CSS invariants & anti-AI design constraints
 * 3. Rate limiting hashing & honeypot validation
 * 4. Cache tag alignment across mutations and queries
 * 5. Zod schema contracts
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { hashClientIp } from "../lib/security/ip-hash";
import { leadSchema } from "../lib/validation/lead";
import { chatMessageSchema } from "../lib/validation/chat";
import { getLocalizedText } from "../lib/i18n/localize";

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${testName}`);
  }
}

async function runVerification() {
  console.log("\n=======================================================");
  console.log("DEVYX PHASE 10: AUTOMATED END-TO-END VERIFICATION SUITE");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------------
  // 1. LOCALIZATION ENGINE & TRANSLATION FALLBACK
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing Trilingual Localization & Fallback Engine ---");
  const completeText = {
    en: "English Title",
    fr: "Titre Français",
    ar: "العنوان بالعربية",
  };
  assert(getLocalizedText(completeText, "en") === "English Title", "Resolves exact English translation");
  assert(getLocalizedText(completeText, "fr") === "Titre Français", "Resolves exact French translation");
  assert(getLocalizedText(completeText, "ar") === "العنوان بالعربية", "Resolves exact Arabic translation");

  // Incomplete JSONB fallback
  const missingArabic = { en: "Base Title", fr: "Titre Base" };
  assert(
    getLocalizedText(missingArabic as any, "ar") === "Base Title",
    "Missing Arabic safely falls back to English value"
  );

  const missingEnglish = { fr: "Seul Français" };
  assert(
    getLocalizedText(missingEnglish as any, "en") === "Seul Français",
    "Missing English safely falls back to next available language (French)"
  );

  // Verify message files exist and are valid JSON
  const rootDir = process.cwd();
  ["ar", "fr", "en"].forEach((locale) => {
    const filePath = join(rootDir, "messages", `${locale}.json`);
    assert(existsSync(filePath), `Translation message file exists: messages/${locale}.json`);
    const content = JSON.parse(readFileSync(filePath, "utf-8"));
    assert(typeof content.nav === "object", `${locale}.json has valid 'nav' section`);
    assert(typeof content.cta === "object", `${locale}.json has valid 'cta' section`);
  });

  // -------------------------------------------------------------------------
  // 2. DESIGN SYSTEM & ANTI-AI GEOMETRY AUDIT
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Auditing Design System & Anti-AI Geometry ---");
  const globalsCss = readFileSync(join(rootDir, "app", "globals.css"), "utf-8");
  assert(globalsCss.includes(".clip-chamfer"), "Defines .clip-chamfer 45-degree geometric cutout utility");
  assert(globalsCss.includes(".blueprint-container"), "Defines .blueprint-container 1360px max width container");
  assert(globalsCss.includes(".blueprint-grid"), "Defines exposed 1px technical grid background");

  // Confirm ZERO forbidden text gradient clips in globals.css
  assert(!globalsCss.includes("bg-clip-text"), "Strict Anti-AI: Zero text gradient clips in design tokens");

  // -------------------------------------------------------------------------
  // 3. SECURITY, HONEYPOT & RATE LIMITING LOGIC
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing Security, Honeypot & Rate Limiting ---");
  const ip1 = "192.168.1.100";
  const hash1 = hashClientIp(ip1);
  const hash2 = hashClientIp(ip1);
  const hashOther = hashClientIp("10.0.0.1");

  assert(typeof hash1 === "string" && hash1.length === 64, "SHA-256 IP hash is valid 64-char hex string");
  assert(hash1 === hash2, "IP hash is deterministic for consistent rate limiting");
  assert(hash1 !== hashOther, "Different IPs generate distinct cryptographic hashes");

  // Honeypot Lead Validation
  const validLead = {
    full_name: "Sarah Connor",
    phone: "+213 555 0192",
    state_province: "Algiers",
    service_type: "web-development",
    message: "We require a deterministic high-performance web platform.",
    locale: "en",
    honeypot: "",
  };
  const validParsed = leadSchema.safeParse(validLead);
  assert(validParsed.success, "Valid lead submission successfully passes Zod schema");

  const spamLead = {
    ...validLead,
    honeypot: "automated_spam_bot_input",
  };
  const spamParsed = leadSchema.safeParse(spamLead);
  assert(!spamParsed.success, "Honeypot violation is caught by Zod schema");

  // Chat Schema Validation
  const validChat = {
    sessionId: "123e4567-e89b-12d3-a456-426614174000",
    message: "What is your typical delivery SLA for an n8n workflow?",
    language: "en",
    currentPage: "/en/services",
  };
  const chatParsed = chatMessageSchema.safeParse(validChat);
  assert(chatParsed.success, "Valid chat message payload passes Zod validation");

  const excessiveChat = {
    ...validChat,
    message: "A".repeat(1501), // Limit is 1500 chars
  };
  const excessiveParsed = chatMessageSchema.safeParse(excessiveChat);
  assert(!excessiveParsed.success, "Message exceeding 1500 characters is rejected by schema");

  // -------------------------------------------------------------------------
  // 4. CACHE TAG REVALIDATION ALIGNMENT
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Auditing Cache Tags & Invalidation Matrix ---");
  const cachedQueriesTs = readFileSync(join(rootDir, "lib", "data", "cached-queries.ts"), "utf-8");
  const adminCmsTs = readFileSync(join(rootDir, "actions", "admin-cms.ts"), "utf-8");

  const REQUIRED_TAGS = [
    "cms:site_settings",
    "cms:page_content",
    "cms:services",
    "cms:projects",
    "cms:social_links",
  ];

  REQUIRED_TAGS.forEach((tag) => {
    assert(cachedQueriesTs.includes(tag), `Cached query layer implements tag: ${tag}`);
    assert(adminCmsTs.includes(tag), `Admin CMS mutations invalidate tag: ${tag}`);
  });

  // -------------------------------------------------------------------------
  // 5. VERCEL CONFIGURATION AUDIT
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Auditing Vercel Cron Configuration ---");
  const vercelJsonPath = join(rootDir, "vercel.json");
  assert(existsSync(vercelJsonPath), "vercel.json configuration exists");
  const vercelConfig = JSON.parse(readFileSync(vercelJsonPath, "utf-8"));
  assert(Array.isArray(vercelConfig.crons) && vercelConfig.crons.length > 0, "vercel.json defines active crons array");
  assert(vercelConfig.crons[0].path === "/api/cron/keep-alive", "Cron path correctly points to /api/cron/keep-alive");
  assert(vercelConfig.crons[0].schedule === "0 0 * * *", "Cron schedule is daily midnight (0 0 * * *)");

  console.log("\n=======================================================");
  console.log("🎉 ALL AUTOMATED VERIFICATION SUITE CHECKS PASSED (100%)");
  console.log("=======================================================\n");
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
