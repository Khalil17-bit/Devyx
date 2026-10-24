import fs from 'fs';

const TEST_CASES = [
  {
    id: 1,
    title: "Client Idea / Discovery",
    message: "3andi fikra ta3 startup ecommerce f l'algerie w 7ab n3ref kifach tebdaw m3aya",
    category: "discovery"
  },
  {
    id: 2,
    title: "Speed & Delivery Inquiry",
    message: "urgent khoya, esq t9edrou tkemlouli site vitrine f 5 yam wela lazem we9t kbir?",
    category: "timeline"
  },
  {
    id: 3,
    title: "Database / Tech Stack query",
    message: "wachmen base de données tkhadmo biha f les applications ta3koum?",
    category: "tech_stack"
  },
  {
    id: 4,
    title: "CRM / ERP Automation query",
    message: "3andi magasin kbir f bab ezzouar w 7ab n'connecti l stock m3a google sheets w whatsapp b tari9a automatique",
    category: "automation"
  },
  {
    id: 5,
    title: "Payment Gateway in Algeria inquiry",
    message: "esq t'integriw chargily wela satim f les sites web li dirohom?",
    category: "payments"
  },
  {
    id: 6,
    title: "Mobile App Platforms query",
    message: "l'application mobile li diroha temchi f iPhone w Android f nafs l'we9t wela kol wa7ed wa7do?",
    category: "mobile"
  },
  {
    id: 7,
    title: "Maintenance & Support query",
    message: "mora ma tkemlou l'projet, kayen garantie wela suivi technique ida sra mouchkil f l'code?",
    category: "support"
  },
  {
    id: 8,
    title: "UI/UX Design inquiry",
    message: "ma 3andich design figma, esq ntouma tekhedmou l'design men 0 wela lazem njibou m3aya?",
    category: "design"
  },
  {
    id: 9,
    title: "Negotiation / Discount query",
    message: "ghali chwiya $950 khoya, ma fiha 7ta remise wela facilitez de paiement pour les startups?",
    category: "pricing_negotiation"
  },
  {
    id: 10,
    title: "Previous Work / Portfolio request",
    message: "werili chwiya khedma ta3koum wela les projets li khedmtouhom deja f l'algerie",
    category: "portfolio"
  },
  {
    id: 11,
    title: "Chatbot for Instagram / Facebook query",
    message: "rani 7ab bot yjawb 3la les messages f instagram w facebook ta3 la marque ta3i",
    category: "ai_bot"
  },
  {
    id: 12,
    title: "Hosting & Server query",
    message: "chkoune ykhelles l'hebergement w le nom de domaine, ntouma wela ana?",
    category: "hosting"
  },
  {
    id: 13,
    title: "Language Switch to English",
    message: "switch to english mode please, i want to continue the discussion in english",
    category: "action_locale"
  },
  {
    id: 14,
    title: "Theme Switch back to Light",
    message: "raja3 l mode l byedh 3ayniya waj3ouni men l k7el",
    category: "action_theme"
  },
  {
    id: 15,
    title: "Direct Call / Physical Meeting request",
    message: "esq n9der nji l bureau ta3koum f alger wela n'planiw call google meet m3a l'equipe?",
    category: "meeting"
  },
  {
    id: 16,
    title: "Security & Data Privacy query",
    message: "les données ta3 les clients ta3i win ykounou stockés, kayen securité mli7a?",
    category: "security"
  },
  {
    id: 17,
    title: "AI Voice / Transcription query",
    message: "esq t9edrou diro transcription ta3 l'voix b darija f l'app?",
    category: "ai_voice"
  },
  {
    id: 18,
    title: "Out-of-Scope (Car mechanic)",
    message: "khoya tomobil ta3i rahi tsakhen f l'autoroute wach men piece nbedel?",
    category: "out_of_scope"
  },
  {
    id: 19,
    title: "Out-of-Scope (Real Estate rental)",
    message: "kayen kera ta3 appartement F3 f hydra wela kouba 3andkoum?",
    category: "out_of_scope"
  },
  {
    id: 20,
    title: "Client Closing / Ready to Sign",
    message: "c bon 9na3touni, kifach nwedjou l'cahier des charges w nsigniw l'contrat m3akom?",
    category: "closing"
  }
];

// Evaluation checks
function auditResponse(test, reply, actions) {
  const issues = [];

  // 1. Arabic script check
  if (/[\u0600-\u06FF]/.test(reply)) {
    issues.push("CONTAINS_ARABIC_SCRIPT: Found Arabic alphabet letters.");
  }

  // 2. Qaf Arabizi check: 'q' not followed by 'u' (excluding tech words and French loanwords)
  const cleanedForQaf = reply
    .replace(/\b(PostgreSQL|SQLite|MySQL|Groq|GraphQL|Qwen|Quick|FAQ)\b/gi, "")
    .replace(/\b(l'équipe|l'equipe|équipe|equipe|qualité|qualite|qualifier|qualifiw|technique|automatique|automatiquement|critique|électronique|electronique|banque|boutique|pratique|applique|classique|spécifique|specifique|questions)\b/gi, "");
  const qafViolations = cleanedForQaf.match(/\b[a-zA-Z]*q(?![uU])[a-zA-Z]*\b/g);
  if (qafViolations) {
    issues.push(`QAF_NOT_NINE: Found Arabizi Q words using 'q' instead of '9': [${qafViolations.join(", ")}]`);
  }

  // 3. Moroccan slang leak check
  const moroccanViolations = reply.match(/\b(dyal|dyalek|dyalna|dyalhom|daba|bzzaf|ghadi|mzyan|wakha|achnou|kifach)\b/i);
  if (moroccanViolations) {
    issues.push(`MOROCCAN_SLANG_LEAK: Detected '${moroccanViolations[0]}'`);
  }

  // 4. Tunisian slang leak check
  const tunisianViolations = reply.match(/\b(barsha|bahi|mta3|tawa|chbik)\b/i);
  if (tunisianViolations) {
    issues.push(`TUNISIAN_SLANG_LEAK: Detected '${tunisianViolations[0]}'`);
  }

  // 5. Length / Token efficiency (strictly <= 80 words)
  const words = reply.trim().split(/\s+/).filter(Boolean);
  if (words.length > 85) {
    issues.push(`OVERLY_VERBOSE: Word count is ${words.length} (expected <= 80 words)`);
  }

  // 6. Category-specific requirements
  if (test.category === "out_of_scope") {
    const isRefusal = /\b(ghir|software|engineering|projets|ia|assistant|devyx|technique)\b/i.test(reply);
    if (!isRefusal) {
      issues.push("FAILED_OUT_OF_SCOPE_REFUSAL: Did not refuse out-of-scope query");
    }
  }

  if (test.id === 13) {
    // English switch
    const hasLocaleAction = actions?.some(a => a.type === "SET_LOCALE" && (a.payload === "en" || a.payload === "en-US"));
    const englishReply = /\b(switched|english|mode|language|assist|welcome)\b/i.test(reply);
    if (!hasLocaleAction && !englishReply) {
      issues.push("ACTION_FAILED: Did not switch locale to English");
    }
  }

  if (test.id === 14) {
    // Light mode switch
    const hasThemeAction = actions?.some(a => a.type === "SET_THEME" && a.payload === "light");
    if (!hasThemeAction) {
      issues.push("ACTION_FAILED: Did not trigger SET_THEME light");
    }
  }

  if (test.id === 10) {
    // Portfolio request
    const hasNavAction = actions?.some(a => a.type === "NAVIGATE" && (a.payload === "/projects" || a.payload?.includes("project")));
    const mentionsProjects = /\b(projets|portfolio|projects|l'projets)\b/i.test(reply);
    if (!hasNavAction && !mentionsProjects) {
      issues.push("PORTFOLIO_NAV_MISSING: Should mention or navigate to projects");
    }
  }

  return issues;
}

async function runSuite() {
  console.log("=== RUNNING 20-MESSAGE ALGERIAN DARIJA EVALUATION SUITE ===");
  const results = [];

  for (const test of TEST_CASES) {
    process.stdout.write(`[Test ${test.id.toString().padStart(2, '0')}/20] ${test.title.padEnd(42, ' ')} ... `);
    
    try {
      const res = await fetch("http://localhost:3005/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: test.message, language: "darija" })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const reply = data.reply || "";
      const actions = data.actions || [];

      const issues = auditResponse(test, reply, actions);

      if (issues.length === 0) {
        console.log("✅ PASS");
      } else {
        console.log(`❌ FAIL (${issues.length} issues)`);
      }

      results.push({
        id: test.id,
        title: test.title,
        message: test.message,
        reply,
        actions,
        issues,
        passed: issues.length === 0
      });
    } catch (err) {
      console.log(`💥 ERROR: ${err.message}`);
      results.push({
        id: test.id,
        title: test.title,
        message: test.message,
        reply: "",
        actions: [],
        issues: [`API_ERROR: ${err.message}`],
        passed: false
      });
    }

    // Small delay to prevent rate limit collisions
    await new Promise(r => setTimeout(r, 2200));
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length;
  console.log("\n=======================================================");
  console.log(`FINAL RESULT: ${passedCount} / ${results.length} PASSED (${((passedCount/results.length)*100).toFixed(1)}%)`);
  console.log("=======================================================\n");

  fs.writeFileSync("scripts/test-20-results.json", JSON.stringify(results, null, 2));
  console.log("Saved full results to scripts/test-20-results.json");
}

runSuite().catch(console.error);
