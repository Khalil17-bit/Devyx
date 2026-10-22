/**
 * Devyx Gemini-Powered Darija Chatbot Integration Test Suite
 * Validates:
 * 1. Zod schema validation for all language codes including Darija
 * 2. 2-Stage n8n Workflow with Devyx Assistant Agent + Perfect Darija Translator Chain + Sanitize Output
 * 3. Exact regex sanitizer clamps from benchmark suite ('9' for Qaf, lazmek->lazem, 7it->3la khater, script purity)
 * 4. Local simulation engine adhering to the 2-stage architecture
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { chatMessageSchema } from "../lib/validation/chat";
import {
  DEVYX_AGENCY_CONTEXT,
  buildGeminiSystemPrompt,
  sanitizeDarijaText,
  generateDevSimulationResponse,
  PERFECT_DARIJA_TRANSLATOR_MANDATES,
} from "../lib/ai/assistant-context";

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${testName}`);
  }
}

async function runChatbotTests() {
  console.log("\n=======================================================");
  console.log("DEVYX 2-STAGE AI ASSISTANT & DARIJA TRANSLATOR SUITE");
  console.log("=======================================================\n");

  // 1. ZOD SCHEMA & DARIJA CONTRACT
  console.log("--- 1. Testing Chat Zod Schema & Language Contracts ---");
  const testLanguages = ["darija", "ar-MA", "ar", "fr", "en"] as const;

  testLanguages.forEach((lang) => {
    const payload = {
      sessionId: "123e4567-e89b-12d3-a456-426614174000",
      message: "Test message for " + lang,
      language: lang,
      currentPage: "/services",
    };
    const parsed = chatMessageSchema.safeParse(payload);
    assert(parsed.success, `Schema accepts language: '${lang}'`);
  });

  // Invalid language rejection
  const invalidLangPayload = {
    sessionId: "123e4567-e89b-12d3-a456-426614174000",
    message: "Test message",
    language: "es", // unsupported
    currentPage: "/",
  };
  assert(!chatMessageSchema.safeParse(invalidLangPayload).success, "Schema rejects unsupported language");

  // 2. PERFECT DARIJA SANITIZER LOGIC (FROM BENCHMARK SUITE)
  console.log("\n--- 2. Auditing Benchmark Regex Sanitizer & Clamps ---");
  
  // Test Qaf '9' enforcement
  const qafTest = sanitizeDarijaText("qbel ma yji qalli waqt lqdim dqiqa");
  assert(qafTest.includes("9bel"), "Enforces '9bel' instead of 'qbel'");
  assert(qafTest.includes("9alli"), "Enforces '9alli' instead of 'qalli'");
  assert(qafTest.includes("we9t"), "Enforces 'we9t' instead of 'waqt'");
  assert(qafTest.includes("l9dim"), "Enforces 'l9dim' instead of 'lqdim'");
  assert(qafTest.includes("d9i9a"), "Enforces 'd9i9a' instead of 'dqiqa'");

  // Test Lazmek / Lazim block
  const lazmekTest = sanitizeDarijaText("lazmek tkhales f lwe9t w lazim tsigni");
  assert(!lazmekTest.includes("lazmek"), "Purges 'lazmek'");
  assert(!lazmekTest.includes("lazim"), "Purges 'lazim'");
  assert(lazmekTest.includes("lazem"), "Enforces impersonal 'lazem'");

  // Test Dialect leak purges
  const dialectTest = sanitizeDarijaText("ghadi nchoufou l'projet 7it daba kayen dyalna");
  assert(dialectTest.includes("ra7"), "Converts 'ghadi' -> 'ra7'");
  assert(dialectTest.includes("3la khater"), "Converts '7it' -> '3la khater'");
  assert(dialectTest.includes("doka"), "Converts 'daba' -> 'doka'");
  assert(dialectTest.includes("ta3na"), "Converts 'dyalna' -> 'ta3na'");

  // Test Script purity (removes stray Arabic script in Arabizi)
  const hybridTest = sanitizeDarijaText("chرف w nرحب بيك f l'appartement");
  assert(!hybridTest.includes("chرف"), "Purges hybrid Arabic script");
  assert(hybridTest.includes("nre7eb bik"), "Normalizes greeting to Arabizi 'nre7eb bik'");

  // 3. AUDIT 2-STAGE N8N WORKFLOW SPECIFICATION
  console.log("\n--- 3. Auditing 2-Stage n8n Workflow JSON Export ---");
  const rootDir = process.cwd();
  const n8nWorkflowPath = join(rootDir, "n8n", "devyx-gemini-darija-workflow.json");
  assert(existsSync(n8nWorkflowPath), "devyx-gemini-darija-workflow.json exists");
  
  const workflowData = JSON.parse(readFileSync(n8nWorkflowPath, "utf-8"));
  assert(Array.isArray(workflowData.nodes) && workflowData.nodes.length >= 8, "n8n workflow contains full 2-stage node pipeline");
  
  const webhookNode = workflowData.nodes.find((n: any) => n.name.includes("Webhook"));
  assert(!!webhookNode, "n8n workflow contains Webhook trigger node");
  
  const assistantAgentNode = workflowData.nodes.find((n: any) => n.name === "Devyx Assistant Agent");
  assert(!!assistantAgentNode, "Stage 1: Devyx Assistant Agent node present");

  const ifDarijaNode = workflowData.nodes.find((n: any) => n.name === "Is Darija?");
  assert(!!ifDarijaNode, "Router: Is Darija? branching node present");

  const translatorNode = workflowData.nodes.find((n: any) => n.name === "Basic LLM Chain - Perfect Darija Translator");
  assert(!!translatorNode, "Stage 2: Basic LLM Chain - Perfect Darija Translator node present");

  const sanitizeNode = workflowData.nodes.find((n: any) => n.name === "Sanitize Output");
  assert(!!sanitizeNode, "Stage 2 Post-Processing: Sanitize Output node present");

  const respondNode = workflowData.nodes.find((n: any) => n.name === "Respond to Webhook");
  assert(!!respondNode, "Response: Respond to Webhook node present");

  // 4. INTELLIGENT 2-STAGE LOCAL SIMULATION RESPONSES
  console.log("\n--- 4. Testing Local Simulation with Sanitizer ---");
  const webReplyDarija = generateDevSimulationResponse("bghit na3ref 3la les sites web", "darija");
  assert(webReplyDarija.includes("Next.js 15"), "Simulation answers web inquiries with Next.js 15");
  assert(webReplyDarija.includes("WhatsApp") || webReplyDarija.includes("Contact"), "Simulation contains contact actions");

  const n8nReply = generateDevSimulationResponse("kidayr khoya bghit n8n automation", "darija");
  assert(n8nReply.includes("n8n"), "Simulation answers n8n workflow inquiries");
  assert(n8nReply.includes("Self-hosted") || n8nReply.includes("serveurs"), "Mentions self-hosted n8n infrastructure");

  console.log("\n=======================================================");
  console.log("🎉 ALL 2-STAGE CHATBOT INTEGRATION TESTS PASSED (100%)");
  console.log("=======================================================\n");
}

runChatbotTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
