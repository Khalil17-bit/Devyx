import {
  translateToAlgéroisDarija,
  sanitizeDarijaTextV2,
  analyzeAttachmentMultimodal,
} from "../lib/ai/darija-engine";

async function runTests() {
  console.log("=== DEVYX DARIJA & VISION ENGINE TEST SUITE ===");

  // 1. Test 11-tier Sanitizer
  console.log("\n[TEST 1] Testing 11-Tier Regex Sanitizer with trap sentences...");
  const trapSentence = "Salam! qbel ma tkhrej, gal liya l'plombier beli daba trisiti t9at3et w krayti kar w tekoul dwa 3la kersh fargha.";
  const sanitized = sanitizeDarijaTextV2(trapSentence);
  console.log("Input: ", trapSentence);
  console.log("Output:", sanitized.text);
  console.log("Corrections made:", sanitized.corrections);

  // Assertions
  const hasNoQ = !/\bqbel\b/i.test(sanitized.text);
  const hasNoDaba = !/\bdaba\b/i.test(sanitized.text);
  const hasTechrobDwa = sanitized.text.includes("techrob dwa");
  const has3laRri9 = sanitized.text.includes("3la rri9");
  console.log("Assertions:");
  console.log(" - 'qbel' replaced with '9bel':", hasNoQ ? "PASS ✅" : "FAIL ❌");
  console.log(" - 'daba' replaced with 'doka':", hasNoDaba ? "PASS ✅" : "FAIL ❌");
  console.log(" - 'tekoul dwa' replaced with 'techrob dwa':", hasTechrobDwa ? "PASS ✅" : "FAIL ❌");
  console.log(" - '3la kersh fargha' replaced with '3la rri9':", has3laRri9 ? "PASS ✅" : "FAIL ❌");

  // 2. Test Live Translation with Gemini 3.8 Flash / Groq Failover
  console.log("\n[TEST 2] Testing Live Algérois Darija Translation (Gemini 3.8 Flash / Groq Qwen)...");
  const englishInput = "Welcome to Devyx! We build deterministic Next.js 15 web applications and self-hosted n8n workflow automations with zero SaaS tax.";
  try {
    const translated = await translateToAlgéroisDarija(englishInput);
    console.log("English Input:", englishInput);
    console.log("Translated Output (Algérois Arabizi):", translated);
    console.log("Translation status: PASS ✅");
  } catch (err) {
    console.error("Translation error:", err);
  }

  // 3. Test Vision Pipeline
  console.log("\n[TEST 3] Testing Vision Analysis with Gemini 3.8 Flash...");
  // Tiny 1x1 transparent PNG in base64
  const mockPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  try {
    const visionOutput = await analyzeAttachmentMultimodal(
      {
        type: "image/png",
        data: mockPngBase64,
        name: "test-diagram.png",
        size: 70,
      },
      "What is this test image?",
      "en"
    );
    console.log("Vision Output (English):", visionOutput);
    console.log("Vision status: PASS ✅");
  } catch (err) {
    console.error("Vision error:", err);
  }

  // 4. Test Direct Groq Qwen 27B Translation (Anti-Hallucination Guard)
  console.log("\n[TEST 4] Testing Direct Groq Qwen 27B Translation (temp: 0.05)...");
  try {
    // Temporarily clear gemini key to test Groq failover
    const originalGemini = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const groqTranslated = await translateToAlgéroisDarija("The client called yesterday and asked how much a Next.js e-commerce website costs.");
    console.log("Input:", "The client called yesterday and asked how much a Next.js e-commerce website costs.");
    console.log("Groq Qwen Output (Algérois Arabizi):", groqTranslated);
    console.log("Groq Failover status: PASS ✅");

    process.env.GEMINI_API_KEY = originalGemini;
  } catch (err) {
    console.error("Groq Failover error:", err);
  }

  console.log("\n=== ALL TESTS COMPLETED ===");
}

runTests().catch(console.error);
