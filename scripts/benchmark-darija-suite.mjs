import fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// Load Environment
// ─────────────────────────────────────────────────────────────────────────────
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[key] = val.trim();
  }
}

const GROQ_KEY = env.GROQ_API_KEY;
const GROQ_SEC = env.GROQ_API_KEY_SECONDARY;
const GEMINI_KEY = env.GEMINI_API_KEY;
const GEMINI_SEC = env.GEMINI_API_KEY_SECONDARY;

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 Prompt: English Technical Reasoner
// ─────────────────────────────────────────────────────────────────────────────
export const STAGE_1_SYSTEM_PROMPT = `You are the Lead Technical AI Consultant for Devyx, a software engineering agency based in Algiers.
You must understand queries in ANY language: Algerian Darija (Latin Arabizi or Arabic script), French, Arabic, or English.

DEVYX CORE SERVICES & DATA:
1. High-Performance Web Platforms: Next.js 15, sub-0.8s LCP, Tailwind CSS, PostgreSQL/Supabase, multi-language RTL/LTR. ($950 – $1,800 | 10 – 20 days)
2. Cross-Platform Mobile Apps: Flutter & React Native for iOS & Android, offline-first SQLite cache, biometric auth. ($1,400 – $2,600 | 14 – 28 days)
3. Autonomous n8n Workflow Automations: Self-hosted n8n pipelines, zero per-task SaaS fees, CRM/WhatsApp routing, payments. ($600 – $1,200 | 5 – 12 days)
4. Autonomous AI Agents: Gemini & Groq multi-modal agents qualifying leads 24/7.
Direct Contact: WhatsApp (https://wa.me/213000000000) or Contact page (/contact).

CRITICAL UNDERSTANDING OF ALGERIAN DARIJA:
The visitor often communicates in Algerian Darija Arabizi. Examples:
- "salam khoya labass" / "saha" = Greeting -> Greet warmly, introduce Devyx AI consultant, ask how to assist with software project.
- "ch7al ykellef site web" = Website cost -> IN-SCOPE ($950–$1,800, 10–20 days, Next.js 15).
- "rani 7ab ndir app mobile delivery" = Mobile delivery app -> IN-SCOPE ($1,400–$2,600, 14–28 days, Flutter/React Native).
- "fhamni wach ma3natha n8n" = Explain n8n -> IN-SCOPE (Self-hosted automations connecting CRM/WhatsApp with zero SaaS fees).
- "werili les projets" / "portfolio" = Show projects -> IN-SCOPE, include [ACTION:NAVIGATE:/projects].
- "dini l la page contact" = Open contact -> IN-SCOPE, include [ACTION:NAVIGATE:/contact].
- "nahdar m3a un developpeur" / "عيطولي" / phone number = Talk to developer -> IN-SCOPE (Alert sent to team on Telegram, provide WhatsApp number or use WhatsApp link).
- "badali l mode l k7el" = Dark mode -> IN-SCOPE, include [ACTION:THEME:dark].
- "badali l mode byad" = Light mode -> IN-SCOPE, include [ACTION:THEME:light].
- "switch language to french" = Switch to French -> Respond in French: "Parfait ! J'ai basculé le mode de discussion en français 🇫🇷. Comment puis-je vous accompagner sur votre projet technique ? [ACTION:SET_LOCALE:fr]"
- "switch to english" = Switch to English -> Respond in English with [ACTION:SET_LOCALE:en].

CRITICAL CONSTRAINTS:
1. OUTPUT LANGUAGE: ALWAYS output 100% in concise, professional ENGLISH (unless user explicitly requests French/Arabic).
2. BREVITY: Strictly 1 to 3 short sentences maximum (under 60 words). Never write long essays or bullet points.
3. DOMAIN RESTRICTION: Devyx ONLY handles software engineering. If the query is about cooking/recipes, football/sports, clothes/shoes, school homework, politics, refuse politely in 1-2 sentences:
   "I am an AI assistant for Devyx. I only answer questions related to software engineering, web development (Next.js 15), mobile apps, n8n automations, and AI systems. How can I assist with your software project?"
4. ACTION TAGS: Append matching tags at the very end when relevant:
   [ACTION:NAVIGATE:/projects], [ACTION:NAVIGATE:/services], [ACTION:NAVIGATE:/contact], [ACTION:NAVIGATE:/]
   [ACTION:THEME:dark], [ACTION:THEME:light]
   [ACTION:SET_LOCALE:fr], [ACTION:SET_LOCALE:en], [ACTION:SET_LOCALE:darija]`;

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 Prompt: Specialized Algérois Darija Translator
// ─────────────────────────────────────────────────────────────────────────────
export const STAGE_2_SYSTEM_PROMPT = `=== STRICT NATIVE ALGÉROIS (ALGIERS DIALECT) TRANSLATION MANDATES ===
You are an expert native Algerian translator born and raised in Algiers (Algérois dialect, Algeria).
Your ONLY mission is to translate English technical text into authentic, natural, flowing Algérois Darija written EXCLUSIVELY in Latin Arabizi.
Translate the TRUE COMMUNICATIVE MEANING with ease, friendliness, and cultural authenticity, NOT literal word-for-word phrasing.

CRITICAL HARD MANDATES:
1. ARABIZI SCRIPT ONLY (100% LATIN SCRIPT):
   - Absolutely ZERO Arabic script characters (U+0600 - U+06FF). Zero hybrid tokens.
   - Numerals: 3 for Ain (ع), 7 for Haa (ح), 9 for Qaf (ق), 5 or kh for Khaa (خ).

2. STRICT '9' FOR QAF (ق) (ZERO TOLERANCE FOR MISTAKES):
   - ALWAYS write '9' for Qaf in Arabizi words:
     'n9der' (NEVER 'nqder'), 'n9edrou' (NEVER 'nqedrou'), 't9der' (NEVER 'tqder'), '9bel' (NEVER 'qbel'),
     '9alli' (NEVER 'qalli'), '9rib' (NEVER 'qrib'), 'we9t' (NEVER 'weqt' or 'waqt'), 'd9i9a' (NEVER 'dqiqa'),
     't9at3et' (NEVER 'tqat3et'), 'l9dim' (NEVER 'lqdim'), '9a3ed' (NEVER 'qa3ed').
   - 'q' is ONLY allowed in genuine French loanwords: 'technique', 'bloqué', 'équipe', 'qualité'.

3. NATURAL FRENCH LOANWORDS (ALGIERS TECH REGISTER):
   - Seamlessly blend natural French loanwords with Arabic prefixes as spoken in Algiers tech offices:
     'l\'projet', 'l\'équipe', 'le site web', 'l\'application mobile', 'l\'automatisation', 'les workflows n8n',
     'le devis gratuit', 'l\'estimation', 'l\'architecture', 'le client', 'les fonctionnalités'.

4. STRICT BAN ON MOROCCAN, TUNISIAN, AND FUS'HA LEAKS:
   - BAN Moroccan:
     * NEVER use 'dyal' alone -> use 'ta3' (or 'ta3na' / 'dyalna').
     * NEVER use 'daba' -> use 'doka' or 'dorka'.
     * NEVER use 'mzyan' -> use 'mli7' or 'chbab'.
     * NEVER use 'ghadi' -> use 'ra7'.
     * NEVER use 'bzzaf' / 'bzaf' -> use 'bezzef'.
     * NEVER use '7it' -> use '3la khater' or 'pask'.
     * NEVER use 'wakha' -> use 'd\'accord' or 'safy'.
     * NEVER use 'ach' or 'chno' -> use 'wach' or 'chnou'.
     * NEVER use 'kifach' -> use 'kifech'.
   - BAN Tunisian: NO 'barsha' (use 'bezzef'), NO 'bahi' (use 'mli7' / 'd\'accord'), NO 'chbik', NO 'tawa'.
   - BAN Fus'ha: NO 'hal yumkin', NO 'akhi' (use 'khoya'), NO 'shukran' (use 'sa7a' or 'bla mziya').

5. PRESERVE MARKDOWN LINKS & FORMATTING:
   - Exactly preserve links: [WhatsApp](https://wa.me/213000000000), [Page Contact](/contact), [Page Projets](/projects).

FEW-SHOT ANCHOR EXAMPLES (DEVYX TECH AGENCY):
- Example 1 (Greeting):
  English: "Hello! Welcome to Devyx. How can I assist you with your software project today?"
  Algérois Darija: "Salam! Mar7ba bik f Devyx 👋 Kifech n9der n3awnek f l'projet ta3ek lyoum?"

- Example 2 (Web Dev Pricing & Stack):
  English: "We build ultra-fast Next.js 15 web platforms with sub-0.8s load times. Web projects typically range between $950 and $1,800 delivered in 10 to 20 days. Let's discuss on [WhatsApp](https://wa.me/213000000000) or check our [Projects page](/projects)."
  Algérois Darija: "N'développiw des plateformes web Next.js 15 ultra-rapides (LCP < 0.8s). Les projets web ykellfou bin $950 w $1,800 f 10 7tal 20 jours. T9der tahdar m3ana direct f [WhatsApp](https://wa.me/213000000000) wela tchouf [Page Projets](/projects)!"

- Example 3 (Mobile App):
  English: "We engineer cross-platform mobile apps for iOS and Android using Flutter with offline-first caching. A delivery app typically costs between $1,400 and $2,600 in 14 to 28 days. You can request a quote on [WhatsApp](https://wa.me/213000000000)."
  Algérois Darija: "N'développiw des applications mobile unifiées pour iOS w Android b Flutter m3a cache offline-first. Application ta3 livraison tkellef bin $1,400 w $2,600 f 14 7tal 28 jours. T9der t'demandi devis gratuit direct f [WhatsApp](https://wa.me/213000000000)!"

- Example 4 (n8n Automation):
  English: "Self-hosted n8n automation connects your CRM, WhatsApp, and billing workflows with zero recurring SaaS fees. Which business processes do you want to automate?"
  Algérois Darija: "L'automatisation n8n (self-hosted) tconnecti l'CRM, WhatsApp, w la facturation ta3ek bla ma tkhales des abonnements kol chher (0$ SaaS fees). Chnouma les processus li 7ab t'automatisihom?"

- Example 5 (Human Handoff):
  English: "I dispatched an alert to our lead engineering team on Telegram. Please provide your WhatsApp number or email, or connect with us directly on [WhatsApp](https://wa.me/213000000000)."
  Algérois Darija: "Sayeft alerte direct l l'équipe technique ta3na f Telegram 🚨. 3tina noumrou WhatsApp ta3ek wela email bach y'contactik un développeur f lwe9t, wela hder direct f [WhatsApp](https://wa.me/213000000000)."

- Example 6 (Out-of-Scope Refusal):
  English: "I am an AI assistant for Devyx. I only answer questions related to software engineering, web development (Next.js 15), mobile apps, n8n automations, and AI systems. How can I assist with your software project?"
  Algérois Darija: "Ana l'assistant technique IA ta3 Devyx. Njawb ghir 3la l'projets ta3 software engineering (Next.js 15, apps mobile, automations n8n w l'intelligence artificielle). Kifech n9der n3awnek f l'projet digital ta3ek?"

FORMAT: Output ONLY the translated Darija text. No explanations, no markdown backticks, no quotes.`;

// ─────────────────────────────────────────────────────────────────────────────
// Stage 3: Fortified 11-Tier Regex Sanitizer
// ─────────────────────────────────────────────────────────────────────────────
export function sanitizeDarija(input) {
  let t = input;
  let corrections = 0;

  const replaceAndCount = (regex, rep) => {
    const matches = t.match(regex);
    if (matches) corrections += matches.length;
    t = t.replace(regex, rep);
  };

  // 1. Script purity: Eliminate Arabic characters & known hybrid leaks
  replaceAndCount(/[\u0600-\u06FF]/g, '');
  replaceAndCount(/nchofoك/gi, 'nchoufouk');
  replaceAndCount(/nرحب\s*بيك/gi, 'nre7eb bik');
  replaceAndCount(/chرف/gi, 'charaf');

  // 2. Strict '9' for Qaf in Arabizi words
  replaceAndCount(/\bnqder\b/gi, 'n9der');
  replaceAndCount(/\bnqedrou\b/gi, 'n9edrou');
  replaceAndCount(/\btqder\b/gi, 't9der');
  replaceAndCount(/\bqbel\b/gi, '9bel');
  replaceAndCount(/\bqbal\b/gi, '9bel');
  replaceAndCount(/\bqalli\b/gi, '9alli');
  replaceAndCount(/\bqrib\b/gi, '9rib');
  replaceAndCount(/\bqriba\b/gi, '9riba');
  replaceAndCount(/\bwaqt\b/gi, 'we9t');
  replaceAndCount(/\blwaqt\b/gi, 'lwe9t');
  replaceAndCount(/\bweqt\b/gi, 'we9t');
  replaceAndCount(/\blweqt\b/gi, 'lwe9t');
  replaceAndCount(/\bdqiqa\b/gi, 'd9i9a');
  replaceAndCount(/\btqta3et\b/gi, 't9at3et');
  replaceAndCount(/\blqdim\b/gi, 'l9dim');
  replaceAndCount(/\blqdam\b/gi, 'l9dam');
  replaceAndCount(/\bqa3ed\b/gi, '9a3ed');
  replaceAndCount(/\bqa3da\b/gi, '9a3da');

  // 3. Moroccan dialect purge
  replaceAndCount(/\bdaba\b/gi, 'doka');
  replaceAndCount(/\bghadi\b/gi, 'ra7');
  replaceAndCount(/\b7it\b/gi, '3la khater');
  replaceAndCount(/\bdyalna\b/gi, 'ta3na');
  replaceAndCount(/\bdyal\b/gi, 'ta3');
  replaceAndCount(/\bmzyan[ae]?\b/gi, 'mli7');
  replaceAndCount(/\bbzzaf\b/gi, 'bezzef');
  replaceAndCount(/\bbzaf\b/gi, 'bezzef');
  replaceAndCount(/\bwakha\b/gi, "d'accord");
  replaceAndCount(/\bmika\b/gi, 'sachi');
  replaceAndCount(/\bkifach\b/gi, 'kifech');
  replaceAndCount(/\bachnou\b/gi, 'wach');
  replaceAndCount(/\bach\b/gi, 'wach');
  replaceAndCount(/\bchno\b/gi, 'chnou');

  // 4. Tunisian dialect purge
  replaceAndCount(/\bbarsha\b/gi, 'bezzef');
  replaceAndCount(/\bbahi\b/gi, 'mli7');
  replaceAndCount(/\bchbik\b/gi, 'wach bik');
  replaceAndCount(/\btawa\b/gi, 'doka');
  replaceAndCount(/\bmta3\b/gi, 'ta3');

  // 5. Fus'ha purge
  replaceAndCount(/\bakhi\b/gi, 'khoya');
  replaceAndCount(/\bshukran\b/gi, 'sa7a');

  // 6. Phonetic spellings
  replaceAndCount(/\bnketeb\b/gi, 'nekteb');
  replaceAndCount(/\bnfehem\b/gi, 'nefhem');
  replaceAndCount(/\bnsema3\b/gi, 'nesma3');

  // 7. Stutter loops
  replaceAndCount(/\b(\w+)\s+\1\b/gi, '$1');

  return { text: t.trim(), corrections };
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-Model Engine Callers with Multi-Key Failover
// ─────────────────────────────────────────────────────────────────────────────
async function callGroqChat(apiKey, systemPrompt, userMessage, maxTokens = 150) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(4500),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const j = await res.json();
  const content = j.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Groq returned empty text');
  return content;
}

async function callGeminiChat(apiKey, systemPrompt, userMessage, maxTokens = 200) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens },
    }),
    signal: AbortSignal.timeout(5500),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const j = await res.json();
  const content = j.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) throw new Error('Gemini returned empty text');
  return content;
}

async function callStage1Reasoner(userQuery) {
  // Tier 1: Groq Primary
  if (GROQ_KEY) {
    try {
      return await callGroqChat(GROQ_KEY, STAGE_1_SYSTEM_PROMPT, userQuery, 140);
    } catch {}
  }
  // Tier 2: Groq Secondary
  if (GROQ_SEC) {
    try {
      return await callGroqChat(GROQ_SEC, STAGE_1_SYSTEM_PROMPT, userQuery, 140);
    } catch {}
  }
  // Tier 3: Gemini Primary
  if (GEMINI_KEY) {
    try {
      return await callGeminiChat(GEMINI_KEY, STAGE_1_SYSTEM_PROMPT, userQuery, 140);
    } catch {}
  }
  // Tier 4: Gemini Secondary
  if (GEMINI_SEC) {
    try {
      return await callGeminiChat(GEMINI_SEC, STAGE_1_SYSTEM_PROMPT, userQuery, 140);
    } catch {}
  }

  return "I am an AI assistant for Devyx. We build Next.js 15 platforms, mobile apps, and n8n automations. How can I assist with your software project?";
}

async function callStage2Translator(englishText) {
  // Tier 1: Gemini Primary
  if (GEMINI_KEY) {
    try {
      return await callGeminiChat(GEMINI_KEY, STAGE_2_SYSTEM_PROMPT, `Translate to Algérois Latin Arabizi:\n\n${englishText}`, 180);
    } catch {}
  }
  // Tier 2: Gemini Secondary
  if (GEMINI_SEC) {
    try {
      return await callGeminiChat(GEMINI_SEC, STAGE_2_SYSTEM_PROMPT, `Translate to Algérois Latin Arabizi:\n\n${englishText}`, 180);
    } catch {}
  }
  // Tier 3: Groq Secondary (keep primary for Stage 1)
  if (GROQ_SEC) {
    try {
      return await callGroqChat(GROQ_SEC, STAGE_2_SYSTEM_PROMPT, `Translate to pure Algérois Latin Arabizi:\n${englishText}`, 180);
    } catch {}
  }
  // Tier 4: Groq Primary
  if (GROQ_KEY) {
    try {
      return await callGroqChat(GROQ_KEY, STAGE_2_SYSTEM_PROMPT, `Translate to pure Algérois Latin Arabizi:\n${englishText}`, 180);
    } catch {}
  }

  return englishText;
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Pipeline Execution
// ─────────────────────────────────────────────────────────────────────────────
export async function runTwoStagePipeline(userQuery) {
  // 1. Stage 1 Reasoner
  const rawEnglish = await callStage1Reasoner(userQuery);

  // 2. Extract action tags
  const actionTags = rawEnglish.match(/\[ACTION:[^\]]+\]/g) || [];
  const textWithoutTags = rawEnglish.replace(/\[ACTION:[^\]]+\]/g, '').trim();

  // If the query was an explicit request to switch to French, pass French directly
  if (actionTags.some(a => a.includes('SET_LOCALE:fr')) || textWithoutTags.toLowerCase().startsWith('parfait')) {
    return {
      query: userQuery,
      stage1English: textWithoutTags,
      finalReply: textWithoutTags,
      actionTags,
    };
  }

  // 3. Stage 2 Translator (English -> Algérois Arabizi)
  const rawDarija = await callStage2Translator(textWithoutTags);

  // 4. Stage 3 Sanitizer
  const sanitized = sanitizeDarija(rawDarija);

  return {
    query: userQuery,
    stage1English: textWithoutTags,
    finalReply: sanitized.text,
    actionTags,
    sanitizerCorrections: sanitized.corrections,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Automated Linguistic & Quality Scoring (Fortified without false positives)
// ─────────────────────────────────────────────────────────────────────────────
export function evaluateDarijaQuality(query, reply, actionTags) {
  const issues = [];
  const text = reply || '';

  // 0. Check if translation actually happened (not raw English)
  if (/\b(we build|our pricing|typically takes|how can i assist|please review|depending on|we develop|we engineer|building a high-performance)\b/i.test(text)) {
    issues.push('Translation failed: Output is still raw English!');
  }

  // 1. Check Arabic script purity (0 characters allowed)
  if (/[\u0600-\u06FF]/.test(text)) {
    issues.push('Contains Arabic script characters (must be 100% Latin Arabizi)');
  }

  // 2. Check forbidden 'q' for Qaf (must be '9')
  // Strip allowed French loanwords and technical names
  let textForQCheck = text
    .replace(/PostgreSQL/gi, '')
    .replace(/SQLite/gi, '')
    .replace(/Groq/gi, '')
    .replace(/Qwen/gi, '')
    .replace(/Quick/gi, '')
    .replace(/l'équipe/gi, '')
    .replace(/l'equipe/gi, '')
    .replace(/\béquipes?\b/gi, '')
    .replace(/\bequipes?\b/gi, '')
    .replace(/\btechniques?\b/gi, '')
    .replace(/\btechnologiques?\b/gi, '')
    .replace(/\bqualit[ée]s?\b/gi, '')
    .replace(/\bqualifi[ée]s?\b/gi, '')
    .replace(/\by'?qualifi\w*/gi, '')
    .replace(/\bpratiques?\b/gi, '')
    .replace(/\bbloqu[ée]s?\b/gi, '')
    .replace(/\bplaques?\b/gi, '')
    .replace(/\bch[èe]ques?\b/gi, '')
    .replace(/\bremorques?\b/gi, '')
    .replace(/\bbiom[ée]triques?\b/gi, '')
    .replace(/\bgraphiques?\b/gi, '')
    .replace(/\banalytiques?\b/gi, '')
    .replace(/\bquestions?\b/gi, '')
    .replace(/\bautomatiquement\b/gi, '');

  // Arabizi Qaf words with 'q' mistake (q without u, e.g. qbel, qalli, tqder, nqder, weqt)
  const wordsWithQ = textForQCheck.match(/\b[a-zA-Z]*q(?![uU])[a-zA-Z]*\b/gi) || [];
  for (const w of wordsWithQ) {
    issues.push(`Forbidden letter 'q' in Arabizi word: "${w}" (must use '9')`);
  }

  // 3. Check Moroccan dialect leaks
  const moroccanRegex = /\b(daba|mzyan|mzyana|ghadi|bzzaf|bzaf|wakha|mika)\b/i;
  const mMatch = text.match(moroccanRegex);
  if (mMatch) {
    issues.push(`Moroccan dialect leak detected: "${mMatch[0]}"`);
  }
  if (/\bdyal\b/i.test(text) && !/\bdyalna\b/i.test(text)) {
    issues.push(`Moroccan 'dyal' used alone (should be 'ta3')`);
  }

  // 4. Check Tunisian dialect leaks
  const tunisianRegex = /\b(barsha|bahi|chbik|tawa|mta3)\b/i;
  const tMatch = text.match(tunisianRegex);
  if (tMatch) {
    issues.push(`Tunisian dialect leak detected: "${tMatch[0]}"`);
  }

  // 5. Check Fus'ha leaks
  const fushaRegex = /\b(hal\s|akhi|shukran|al-kahrabaa|al-aan)\b/i;
  const fMatch = text.match(fushaRegex);
  if (fMatch) {
    issues.push(`Fus'ha leak detected: "${fMatch[0]}"`);
  }

  // 6. Conciseness check
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 75) {
    issues.push(`Too verbose: ${wordCount} words (should be under 75 words)`);
  }

  // 7. Check out of scope boundary handling
  const isOutOfScopeQuery = /\b(recette|pizza|match|mca|sabat|homework|physique)\b/i.test(query);
  if (isOutOfScopeQuery) {
    const isRefusal = /software engineering|Next\.js|apps mobile|n8n|ingénierie logicielle|IA/i.test(text);
    if (!isRefusal) {
      issues.push('Failed to refuse out-of-scope query!');
    }
  }

  const passed = issues.length === 0;
  return { passed, issues, wordCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// 25-Turn Comprehensive Test Suite
// ─────────────────────────────────────────────────────────────────────────────
const TEST_SUITE = [
  { id: 'T01', query: 'salam khoya labass', category: 'Greeting' },
  { id: 'T02', query: 'saha khoya, mar7ba bikom', category: 'Greeting' },
  { id: 'T03', query: 'kifech tkhadmo les sites web? wach mn stack?', category: 'Web' },
  { id: 'T04', query: 'rani 7ab ndir site e-commerce kima jumia f Dzayer, ch7al ykellef?', category: 'Web & Pricing' },
  { id: 'T05', query: '3andi idéé ta3 app mobile delivery kima Yassir Express, t9edrou tdiroha?', category: 'Mobile' },
  { id: 'T06', query: 'kifech tkhadmo les apps ios w android?', category: 'Mobile' },
  { id: 'T07', query: 'fhamni wach ma3natha n8n automation', category: 'n8n' },
  { id: 'T08', query: 'rani hab n-automatisé les leads ta3 whatsapp m3a crm', category: 'n8n' },
  { id: 'T09', query: 'wach tdiro f l-intelligence artificielle? 7ab chatbot l site ta3i', category: 'AI' },
  { id: 'T10', query: 'ch7al les prix ta3kom f les projets?', category: 'Pricing' },
  { id: 'T11', query: 'ch7al lwe9t bach tlivriw site web Nextjs?', category: 'Timeline' },
  { id: 'T12', query: 'rani 7ab nahdar m3a un développeur f l-équipe, 3andi projet urgent', category: 'Escalation' },
  { id: 'T13', query: 'عيطولي f had noumrou 0555123456 راني مهتم', category: 'Escalation Phone' },
  { id: 'T14', query: 'werili les projets ta3kom li khdemtohom 9bel', category: 'Navigation' },
  { id: 'T15', query: 'werili la liste ta3 les services ta3kom', category: 'Navigation' },
  { id: 'T16', query: 'dini l la page contact', category: 'Navigation' },
  { id: 'T17', query: 'badali l mode l k7el dark mode', category: 'Theme' },
  { id: 'T18', query: 'dirli l mode byad light mode svp', category: 'Theme' },
  { id: 'T19', query: 'switch language mod in this chat to french', category: 'Language Switch' },
  { id: 'T20', query: 'a3tini recette ta3 pizza carré kima f Dzayer', category: 'Out of Scope' },
  { id: 'T21', query: 'chkoun yerba7 l match ta3 l-mca ghodwa?', category: 'Out of Scope' },
  { id: 'T22', query: 'win n9der nechri sabat chbab f Bab Ezzouar?', category: 'Out of Scope' },
  { id: 'T23', query: 'Nextjs 15?', category: 'Edge Short' },
  { id: 'T24', query: 'Salam, est-ce que vous faites du self-hosted n8n sur nos serveurs?', category: 'Mixed French' },
  { id: 'T25', query: 'sahha khoya, rabi y3awenkom, 3jebni l-site bezzef!', category: 'Praise' },
];

async function runBenchmark() {
  console.log(`\n============================================================`);
  console.log(`   DEVYX DARIJA TWO-STAGE ENGINE BENCHMARK (25 TEST CASES)   `);
  console.log(`============================================================\n`);

  let passedCount = 0;

  for (let i = 0; i < TEST_SUITE.length; i++) {
    const test = TEST_SUITE[i];
    process.stdout.write(`[${test.id}] [${test.category.padEnd(16)}] "${test.query.slice(0, 35).padEnd(35)}" ... `);

    try {
      const res = await runTwoStagePipeline(test.query);
      const evalResult = evaluateDarijaQuality(test.query, res.finalReply, res.actionTags);

      if (evalResult.passed) {
        passedCount++;
        console.log(`✅ PASS (${evalResult.wordCount} words)`);
      } else {
        console.log(`❌ FAIL`);
        for (const iss of evalResult.issues) {
          console.log(`       ⚠️  ${iss}`);
        }
      }
      console.log(`       💬 Darija: "${res.finalReply}"`);
      if (res.actionTags.length > 0) {
        console.log(`       🏷️  Actions: ${res.actionTags.join(', ')}`);
      }
    } catch (err) {
      console.log(`💥 ERROR: ${err.message}`);
    }

    // 400ms pause to ensure smooth API throughput across all 4 keys
    await new Promise(r => setTimeout(r, 400));
  }

  const scorePct = Math.round((passedCount / TEST_SUITE.length) * 100);
  console.log(`\n============================================================`);
  console.log(`   BENCHMARK RESULT: ${passedCount} / ${TEST_SUITE.length} PASSED (${scorePct}%)`);
  console.log(`============================================================\n`);
}

if (process.argv[1] && process.argv[1].includes('benchmark-darija-suite')) {
  runBenchmark().finally(() => process.exit(0));
}
