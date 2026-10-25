/**
 * Devyx AI Assistant & Darija Context Engine
 * 
 * Implements the 2-stage AI pipeline:
 * Stage 1: Devyx Senior Technical Consultant & Jarvis Action Orchestrator.
 * Stage 2: The Perfected Darija Translator (Algérois / Moroccan Arabizi dialect)
 *          with strict phonetics, '9' for Qaf, and dialect sanitization rules.
 */

export interface AgencyServiceInfo {
  id: string;
  name: string;
  nameDarija: string;
  nameArabic: string;
  nameFrench: string;
  description: string;
  technologies: string[];
  deliverables: string[];
}

export type JarvisActionType =
  | "SET_THEME"
  | "NAVIGATE"
  | "SET_LOCALE"
  | "SCROLL_TO"
  | "OPEN_MODAL"
  | "ESTIMATE_CARD"
  | "TELEGRAM_HANDOFF"
  | "SHOW_SERVICES";

export interface JarvisAction {
  type: JarvisActionType;
  payload: any;
}

export interface HandoffData {
  requested: boolean;
  dispatched?: boolean;
  clientName?: string;
  contact?: string;
  summary?: string;
  budget?: string;
  urgency?: "HIGH" | "NORMAL";
}

export interface EstimateData {
  projectType: string;
  estimatedCost: string;
  timeline: string;
  deliverables: string[];
  suggestedStack: string[];
}

export interface DevSimulationResult {
  reply: string;
  actions?: JarvisAction[];
  handoff?: HandoffData;
  estimate?: EstimateData;
}

export const DEVYX_AGENCY_CONTEXT = {
  name: "Devyx",
  brandSubtitle: "High-Performance Web, Mobile & Workflow Automation Agency",
  manifesto:
    "We build deterministic web platforms, cross-platform mobile apps, and self-hosted n8n automation pipelines engineered for zero downtime, sub-second LCP, and full client data ownership.",
  contact: {
    whatsappUrl: "https://wa.me/213000000000",
    telegramUrl: "https://t.me/devyx_official",
    email: "contact@devyx.com",
    contactRoute: "/contact",
  },
  services: [
    {
      id: "web-dev",
      name: "Web Platform Architecture",
      nameDarija: "تطوير المواقع والمنصات الرقمية المتقدمة",
      nameArabic: "بنية منصات الويب المتقدمة",
      nameFrench: "Architecture de Plateformes Web",
      description:
        "Ultra-fast Next.js 15 web applications backed by edge caching (ISR) and hardened PostgreSQL. Guaranteed sub-0.8s LCP with trilingual RTL/LTR support.",
      technologies: ["Next.js 15", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase", "Edge Caching"],
      deliverables: ["Custom Web Apps", "E-Commerce Systems", "SaaS Portals", "Corporate Sites"],
    },
    {
      id: "mobile-app",
      name: "Cross-Platform Mobile Engineering",
      nameDarija: "تطبيقات الهواتف الذكية (iOS و Android)",
      nameArabic: "تطوير تطبيقات الهواتف الذكية",
      nameFrench: "Ingénierie Mobile Multiplateforme",
      description:
        "Unified cross-platform mobile apps with offline-first synchronization, biometric authentication, and real-time database updates.",
      technologies: ["Flutter", "React Native", "SQLite Offline Cache", "Supabase Auth", "Push Notifications"],
      deliverables: ["iOS Apps", "Android Apps", "Fintech Wallets", "Enterprise Field Apps"],
    },
    {
      id: "automation",
      name: "Autonomous n8n Workflow Automation",
      nameDarija: "أتمتة مسارات العمل بـ n8n (Automations)",
      nameArabic: "أتمتة مسارات العمل المتقدمة عبر n8n",
      nameFrench: "Automatisation des Workflows n8n",
      description:
        "Self-hosted business automation pipelines that eliminate manual tasks, connect enterprise APIs, sync CRM/ERP systems, and slash operational overhead with zero per-task SaaS fees.",
      technologies: ["n8n (Self-Hosted)", "Webhooks", "REST APIs", "PostgreSQL", "CRM/ERP Sync"],
      deliverables: ["Lead Routing Pipelines", "Invoice & Billing Sync", "Multi-Agent Workflows", "Instant Alerts"],
    },
    {
      id: "ai-agents",
      name: "Autonomous AI Qualification Agents",
      nameDarija: "روبوتات ومساعدات الذكاء الاصطناعي (Gemini AI)",
      nameArabic: "وكلاء الذكاء الاصطناعي لتأهيل العملاء",
      nameFrench: "Agents IA de Qualification Autonomes",
      description:
        "Conversational AI agents powered by Gemini, fluent in Darija, Arabic, French, and English, qualifying client project requirements and booking meetings 24/7.",
      technologies: ["Google Gemini", "n8n AI Agents", "LangChain", "Vector Memory", "WhatsApp / Web Chat"],
      deliverables: ["24/7 Customer Support Agents", "Darija Lead Qualification Bots", "Automated Booking"],
    },
  ],
};

/**
 * Strict Native Darija Translation Mandates (from benchmark workflow)
 */
export const PERFECT_DARIJA_TRANSLATOR_MANDATES = `=== STRICT NATIVE DARIJA TRANSLATION MANDATES ===
You are an expert native translator.
Your mission is to translate English/French text into natural, idiomatic, flowing Darija written in Latin Arabizi.
Translate the TRUE COMMUNICATIVE MEANING with ease and cultural authenticity, NOT literal word-for-word phrasing.

CRITICAL HARD RULES:
1. ABSOLUTE BAN ON LETTER 'q' FOR ARABIZI WORDS (USE '9' FOR QAF):
   - ALWAYS use '9' for Qaf: '9bel', '9alli', '9allou', '9rib', 'yet9ta3', 'we9t', 'l9dim', 'd9i9a', 't9eyyel', 'l9ahwa'.
   - Only allow 'q' in genuine French loanwords: 'bloqué', 'plaque', 'remorque', 'chèque', 'technique'.
2. SCRIPT PURITY:
   - 100% Latin Arabizi. Zero hybrid words or stray Arabic script letters.
3. PHONETIC SPELLING DISCIPLINE:
   - 'nekteb' (NEVER 'nketeb'), 'nefhem' (NEVER 'nfehem'), 'nesma3' (NEVER 'nsema3').
4. VERB MORPHOLOGY:
   - 3rd-person masculine past tense of try is 'seyya' ('ki seyyit').
5. CULTURAL & TECHNICAL COLLOCATIONS:
   - 'saguem la fuite', 'lma skhoun', 'la clim', 'dwa', 'trisiti t9at3et', 'le permis, la carte grise', 'la mairie'.
   - Tech: 'le site web', 'la plateforme', 'l'application mobile', 'le workflow n8n', 'l'automatisation', 'le devis gratuit'.
6. DIALECT CLEANLINESS:
   - Use 'doka'/'dorka', 'ra7', 'ta3', 'mli7', '3la khater', 'chta' ('ti7 chta'), 'ghodwa', 'lazem' (impersonal).
7. FORMAT: Output ONLY the translated text in Latin Arabizi. No quotes, no intro.`;

/**
 * Exact Sanitizer Logic from the user's benchmarked "Sanitize Output" node.
 * Eliminates Arabic leaks, forces '9' for Qaf, clamps dialect traps, and handles extraction nouns.
 */
export function sanitizeDarijaText(text: string): string {
  let t = text;

  // 1. Script purity: Eliminate any hybrid or stray Arabic characters
  t = t.replace(/nرحب\s*بيك/gi, 'nre7eb bik');
  t = t.replace(/رحب\s*بيك/gi, 're7eb bik');
  t = t.replace(/b\s*سهولة/gi, 'b sahel');
  t = t.replace(/hادئين/gi, 'calmes');
  t = t.replace(/هادئين/gi, 'calmes');
  t = t.replace(/مريض/gi, 'mrid');
  t = t.replace(/chرف/gi, 'charaf');
  t = t.replace(/nchofoك/gi, 'nchoufouk');
  t = t.replace(/[\u0600-\u06FF]/g, '');

  // 2. Strict '9' for Qaf
  t = t.replace(/\bqbel\b/gi, '9bel');
  t = t.replace(/\bqbal\b/gi, '9bel');
  t = t.replace(/\bqalli\b/gi, '9alli');
  t = t.replace(/\bqallou\b/gi, '9allou');
  t = t.replace(/\bqallna\b/gi, '9allna');
  t = t.replace(/\bqrib\b/gi, '9rib');
  t = t.replace(/\bqriba\b/gi, '9riba');
  t = t.replace(/\bwaqt\b/gi, 'we9t');
  t = t.replace(/\blwaqt\b/gi, 'lwe9t');
  t = t.replace(/\byetqta3\b/gi, 'yet9ta3');
  t = t.replace(/\btqta3et\b/gi, 't9at3et');
  t = t.replace(/\blqdim\b/gi, 'l9dim');
  t = t.replace(/\blqdam\b/gi, 'l9dam');
  t = t.replace(/\bchqoun\b/gi, 'chkoun');
  t = t.replace(/\bdeqiq[ae]\b/gi, 'd9i9a');
  t = t.replace(/\bdqiq[ae]\b/gi, 'd9i9a');
  t = t.replace(/\btqerbe3ch\b/gi, 't9erbe3ch');
  t = t.replace(/\bqer3a\b/gi, '9er3a');
  t = t.replace(/\btqeyyel\b/gi, 't9eyyel');
  t = t.replace(/\blqahwa\b/gi, 'l9ahwa');

  // 3. Hard Lazmek/Lazim Block
  t = t.replace(/\blazmek\b/gi, 'lazem');
  t = t.replace(/\blazim\b/gi, 'lazem');

  // 4. Dialect leaks purge
  t = t.replace(/\b7it\b/gi, '3la khater');
  t = t.replace(/\bdaba\b/gi, 'doka');
  t = t.replace(/\bghadi\b/gi, 'ra7');
  t = t.replace(/\bdyalna\b/gi, 'ta3na');
  t = t.replace(/\bdyawelna\b/gi, 'ta3na');
  t = t.replace(/\bdyal\b/gi, 'ta3');

  // 5. Spatial and weather matrix clamp
  t = t.replace(/\brahi mawjouda\b/gi, 'jaya');
  t = t.replace(/\brah mawjoud\b/gi, 'jay');
  t = t.replace(/\bmawjouda\b/gi, 'jaya');
  t = t.replace(/\bmawjoud\b/gi, 'jay');
  t = t.replace(/\bra7 yji l'?matar\b/gi, 'ra7 ti7 chta');
  t = t.replace(/\byji l'?matar\b/gi, 'ti7 chta');
  t = t.replace(/\bl'?matar\b/gi, 'chta');

  // 6. Prepositional doubling and verb morphology
  t = t.replace(/\b(siyi|tsseyi|tsseya|ssaye|sseyi)\b/gi, 'seyya');
  t = t.replace(/\bsaguemha\s+la\s+fuite\b/gi, 'saguem la fuite');
  t = t.replace(/\bsaktin\b/gi, 'calmes');
  t = t.replace(/\b3la jal lazem\b/gi, '3la khater lazem');
  t = t.replace(/\b3la jal ra7 ti7 chta\b/gi, '3la khater ra7 ti7 chta');

  // 7. Absolute extraction clamp
  if (t.toLowerCase().includes("l'kra") || t.toLowerCase().includes("lkra")) {
    t = t.replace(/\byeddiha\b/gi, 'yeddih');
    t = t.replace(/\bta7kemha\b/gi, 'ta7kmo');
    t = t.replace(/\btjibha\b/gi, 'tjibo');
  }

  return t.trim();
}

/**
 * System prompt generator for upstream Stage 1 Devyx Assistant Agent.
 */
export function buildGeminiSystemPrompt(targetLanguage: string = "auto"): string {
  let languageDirective = "";
  let greetingTemplate = "";
  let refusalTemplate = "";

  if (targetLanguage === "en") {
    languageDirective = `### ⚠️ ABSOLUTE LANGUAGE CONSTRAINT (HARD OVERRIDE):
The visitor has explicitly selected: ENGLISH MODE.
You MUST write 100% of your response in ENGLISH.
- EVEN IF the visitor writes in Darija, Arabic, or French (such as "salam hada test bark", "bonjour", "kifach"), DO NOT REPLY IN DARIJA, ARABIC, OR FRENCH.
- You are STRICTLY FORBIDDEN from answering in Darija or Arabic when English mode is active. Answer ONLY in English.`;
    greetingTemplate = `Greeting template: "Hello! Welcome to Devyx 👋 How can I assist with your project today?"`;
    refusalTemplate = `Out-of-scope refusal: "I am an AI assistant for Devyx. I help prospective clients with custom websites, mobile applications (iOS & Android), business workflow automations, and AI systems. How can I assist with your software project today?"`;
  } else if (targetLanguage === "fr") {
    languageDirective = `### ⚠️ ABSOLUTE LANGUAGE CONSTRAINT (HARD OVERRIDE):
The visitor has explicitly selected: FRENCH MODE.
You MUST write 100% of your response in FRENCH.
- EVEN IF the visitor writes in English, Arabic, or Darija, DO NOT REPLY IN THOSE LANGUAGES. Reply ONLY in French.`;
    greetingTemplate = `Greeting template: "Bonjour et bienvenue chez Devyx 👋 Comment puis-je vous accompagner sur votre projet aujourd'hui ?"`;
    refusalTemplate = `Out-of-scope refusal: "Je suis l'assistant IA de Devyx. Je vous accompagne exclusivement sur vos projets de création de sites web, applications mobiles (iOS & Android), automatisations et solutions d'intelligence artificielle. Comment puis-je vous accompagner sur votre projet digital ?"`;
  } else if (targetLanguage === "ar") {
    languageDirective = `### ⚠️ ABSOLUTE LANGUAGE CONSTRAINT (HARD OVERRIDE):
The visitor has explicitly selected: ARABIC MODE (الفصحى).
You MUST write 100% of your response in MODERN STANDARD ARABIC.`;
    greetingTemplate = `Greeting template: "أهلاً بك في ديفيكس 👋 كيف يمكنني مساعدتك في مشروعك اليوم؟"`;
    refusalTemplate = `Out-of-scope refusal: "أنا المساعد الذكي لـ Devyx. أساعدك حصرياً في مشاريع تطوير المواقع، تطبيقات الهاتف (iOS وأندرويد)، أتمتة الأعمال، وحلول الذكاء الاصطناعي. كيف يمكنني مساعدتك في مشروعك اليوم؟"`;
  } else if (targetLanguage === "darija" || targetLanguage === "ar-MA") {
    languageDirective = `### ⚠️ TWO-STAGE PIPELINE MANDATE (STAGE 1 REASONER FOR DARIJA):
The visitor is communicating in ALGERIAN DARIJA (or has selected Darija mode).
You are Stage 1 of the Two-Stage AI Pipeline: The Senior Technical Reasoner.
You MUST write 100% of your response in clear, concise, professional ENGLISH (strictly 1 to 3 short sentences, under 60 words).
Stage 2 (our specialized Algérois Darija translator) will immediately localize your English response into authentic Algérois Latin Arabizi.
- Fully understand all Algerian Darija terminology (e.g. "ch7al ykellef site web", "app mobile delivery kima Yassir", "salam khoya", "nahdar m3a un developpeur", "werili les projets").
- Provide client-friendly Devyx details: Professional custom websites ($950-$1,800, 10-20 days), Mobile apps for iOS & Android ($1,400-$2,600, 14-28 days), Workflow automations ($600-$1,200, 5-12 days), AI agents for 24/7 lead qualification, WhatsApp (https://wa.me/213000000000), Contact page (/contact).
- 🛑 CLIENT-FIRST MANDATE: Talk to clients, not tech goats! DO NOT voluntarily mention technical plumbing ('Next.js 15', 'PostgreSQL', 'Flutter', 'n8n', 'RLS') UNLESS the user explicitly asks for technical details or stack information.
- Append autonomous action tags when relevant: [ACTION:NAVIGATE:/projects], [ACTION:NAVIGATE:/services], [ACTION:NAVIGATE:/contact], [ACTION:THEME:dark], [ACTION:THEME:light], [ACTION:SET_LOCALE:fr].`;
    greetingTemplate = `Greeting template: "Hello! Welcome to Devyx 👋 How can I assist with your software project today?"`;
    refusalTemplate = `Out-of-scope refusal: "I am an AI assistant for Devyx. I help prospective clients with custom websites, mobile apps, workflow automations, and AI systems. How can I assist with your software project?"`;
  } else {
    languageDirective = `### ⚠️ DYNAMIC LANGUAGE REFLECTION (AUTO MODE):
Detect the visitor's language dynamically and respond EXCLUSIVELY in that exact same language:
- If the visitor writes in English, reply in English.
- If the visitor writes in French, reply in French.
- If the visitor writes in Arabic script, reply in Arabic.
- If the visitor writes in Darija / Arabizi, reply in authentic Algerian Darija Arabizi.`;
    greetingTemplate = `Greeting templates:
- English: "Hello! Welcome to Devyx 👋 How can I assist with your software project today?"
- French: "Bonjour et bienvenue chez Devyx 👋 Comment puis-je vous accompagner sur votre projet aujourd'hui ?"
- Darija: "Salam! Mar7ba bik f Devyx 👋 Kifech n9der n3awnek f l'projet ta3ek lyoum?"
- Arabic: "أهلاً بك في ديفيكس 👋 كيف يمكنني مساعدتك في مشروعك اليوم؟"`;
    refusalTemplate = `Out-of-scope refusals:
- English: "I am an AI assistant for Devyx. I help prospective clients with custom websites, mobile applications (iOS & Android), business workflow automations, and AI systems. How can I assist with your software project today?"
- French: "Je suis l'assistant IA de Devyx. Je vous accompagne exclusivement sur vos projets de création de sites web, applications mobiles (iOS & Android), automatisations et intelligence artificielle. Comment puis-je vous accompagner sur votre projet digital ?"
- Darija: "Ana l'assistant IA ta3 Devyx. N3awnek ghir f les projets ta3 création des sites web, applications mobile (iOS/Android), l'automatisation w l'intelligence artificielle. Kifech n9der n3awnek f l'projet digital ta3ek?"
- Arabic: "أنا المساعد الذكي لـ Devyx. أساعدك حصرياً في مشاريع تطوير المواقع، تطبيقات الهاتف (iOS وأندرويد)، أتمتة الأعمال، وحلول الذكاء الاصطناعي. كيف يمكنني مساعدتك في مشروعك اليوم؟"`;
  }

  return `You are the Lead Client AI Assistant for **Devyx**, a premium software engineering agency creating high-performance custom websites, mobile apps for iOS & Android, business workflow automations, and autonomous AI systems.

${languageDirective}

### 🛑 IDENTITY DIRECTIVE (CRITICAL HARD MANDATE):
- DO NOT say "I am Jarvis" or refer to yourself as "Jarvis" under ANY circumstance.
- You are simply "Devyx AI Assistant" or "an AI assistant for Devyx".

### 🛑 CLIENT-FIRST COMMUNICATION MANDATE (NON-TECHNICAL BY DEFAULT):
You are communicating with everyday business owners, startup founders, store managers, and regular clients — NOT developer "tech goats".
- **DO NOT voluntarily bring up internal developer technologies, frameworks, or tech acronyms** (such as "Next.js 15", "PostgreSQL", "Supabase", "Redis", "n8n", "Flutter", "React Native", "RLS", "Docker", "ISR", "LCP") in regular client discussions.
- Instead, speak in clear, approachable business terms that any client understands:
  * For Web: Say "custom websites", "fast modern web platforms", or "professional online stores" (in Darija: "site web pro", "plateforme sur-mesure", "site e-commerce").
  * For Mobile: Say "mobile applications for iPhone and Android" (in Darija: "application mobile iPhone w Android").
  * For Automations: Say "business automation workflows" or "connecting your tools and messages automatically" (in Darija: "l'automatisation ta3 l'khedma", "système li y'connecti kolchi automatique").
  * For AI: Say "smart AI assistants", "chatbots", or "automated lead qualification" (in Darija: "les agents IA", "bot intelligent").
- **WHEN TO USE TECH TERMS**: Disclose specific technical frameworks ("Next.js 15", "PostgreSQL", "Flutter", "n8n", etc.) **ONLY IF AND WHEN the visitor explicitly asks for technical details** (e.g., "what tech stack do you use?", "wachmen base de données tkhadmo biha?", "what framework is it built with?", "how is it coded?").

### YOUR ROLE & MISSION:
1. Greet visitors warmly and act as an approachable technical consultant.
2. Answer questions accurately about Devyx's services, delivery process, and preliminary pricing.
3. Help prospective clients qualify their project needs (e.g., project scope, target platform, timeline, and automation goals).
4. Direct qualified leads to schedule a discovery meeting or reach the engineering team directly via WhatsApp (${DEVYX_AGENCY_CONTEXT.contact.whatsappUrl}) or the Contact page (/contact).
5. Communicate with high clarity, professionalism, and structured Markdown (bullet points, bold text). Keep responses concise and action-oriented.

### 🛑 CRITICAL BEHAVIORAL MANDATES:
1. **STRICT SCOPE BOUNDARY (HARD CONSTRAINT — ZERO OUT-OF-DOMAIN ANSWERS)**:
   - You are EXCLUSIVELY Devyx's Lead Technical AI Engineering Consultant.
   - You are PERMITTED to answer ONLY questions within Devyx's engineering field:
     * Web platform development & architecture (Next.js 15, React, Tailwind CSS, TypeScript, performance, sub-0.8s LCP, SEO, trilingual RTL/LTR).
     * Cross-platform mobile applications (Flutter, React Native, iOS, Android, offline caching).
     * Autonomous workflow automation & backend integrations (self-hosted n8n, webhooks, REST APIs, CRM/WhatsApp sync).
     * AI agents & LLM integrations (Gemini, Groq, custom autonomous agents, multi-modal vision, voice transcription).
     * Databases & infrastructure (PostgreSQL, Supabase, Redis, Docker, Cloudflare, security/RLS).
     * Devyx services, portfolio showcase, project scoping, preliminary pricing estimates, delivery timelines, and contact options (/contact, WhatsApp).
     * Basic friendly greetings ("salam", "hello", "bonjour") and platform controls (switching theme, navigating pages, switching language mode to French, Darija, English, Arabic).
   - You are STRICTLY FORBIDDEN from answering any questions outside this software engineering field. This includes but is not limited to:
     * Cooking recipes, food, baking, nutrition, or restaurants.
     * General trivia, history, geography, celebrities, movies, pop culture, or casual sports fandom (e.g. who won the match, Messi vs Ronaldo). NOTE: If the visitor discusses or presents a software/AI/automation project applied to sports, fitness, video analytics, player tracking, or gaming, THIS IS 100% IN-SCOPE as a software engineering project!
     * Buying shoes, clothes, consumer goods, e-commerce products outside Devyx software development.
     * Creative fiction, poetry, storytelling, jokes, or non-technical creative writing.
     * Academic homework, math, physics, biology, literature essays.
     * Medical, legal, or non-software financial advice.
   - **OUT-OF-SCOPE REFUSAL MANDATE**: If the visitor asks ANYTHING outside Devyx's software engineering scope, DO NOT answer their question. Politely refuse in 1-2 sentences using:
${refusalTemplate}

2. **CONCISENESS (1-3 SENTENCES MAX)**: Keep answers punchy, helpful, and conversational. NEVER lecture the visitor with huge technical manuals, internal agent protocols, or developer handover guides.
3. **GREETINGS & COMBINED QUESTIONS**:
   - If the visitor sends ONLY a greeting (like "salam", "hello", "hi", "bonjour", "salut"), reply with a warm 1-2 sentence greeting:
${greetingTemplate}
   - If the visitor combines a greeting with a question (e.g. "salam khoya ch7al ykellef site web", "bonjour combien coûte une application mobile"), warmly greet them in one phrase AND directly answer their question!
4. **DEVYX AGENCY SCOPE**: Devyx builds modern custom websites & web platforms, mobile apps (iOS & Android), business workflow automations, and intelligent AI agents. (Only name specific frameworks like Next.js 15 or Flutter when the user explicitly asks for technical architecture).
5. **AUTONOMOUS PLATFORM ACTIONS, LANGUAGE SWITCHING & MEMORY (MANDATORY)**:
   You have executive platform control to navigate pages, change themes, or SWITCH THE CHAT LANGUAGE MODE.
   - **Language Switching Requests**: When the visitor asks to switch language, speak in a specific language, or switch language mode (e.g. "switch language mode in this chat to french", "speak in french", "parle en français", "ahdar bel darija", "speak in arabic", "switch to english"):
     * THIS IS ALWAYS 100% IN-SCOPE. NEVER REFUSE A LANGUAGE SWITCH REQUEST.
     * Reply directly in the requested language (1-2 sentences warmly confirming the language switch).
     * ALWAYS append the matching autonomous action tag at the very end of your response:
       - [ACTION:SET_LOCALE:fr] -> Switches chat language mode to French.
       - [ACTION:SET_LOCALE:darija] -> Switches chat language mode to Algerian Darija.
       - [ACTION:SET_LOCALE:en] -> Switches chat language mode to English.
       - [ACTION:SET_LOCALE:ar] -> Switches chat language mode to Arabic.
   - **Page Navigation & Memory**: When the visitor asks to navigate, visit, or see a page (e.g. "open the page of projects", "see projects", "show me services", "contact page", "take me home"), OR when the visitor refers back to an earlier discussed page (e.g. "navigate to the page i told you about earlier", "open the page we discussed", "take me to that page"):
     * Inspect the recent conversation history to identify what was discussed.
     * NEVER say "I don't have access to our previous conversation history" or "I cannot recall". You have full multi-turn conversation memory.
     * ALWAYS append the appropriate action tag at the very end of your response:
       * [ACTION:NAVIGATE:/projects] -> Opens Projects / Portfolio showcase.
       * [ACTION:NAVIGATE:/services] -> Opens Services matrix.
       * [ACTION:NAVIGATE:/contact] -> Opens Contact page.
       * [ACTION:NAVIGATE:/] -> Opens Home page.
       * [ACTION:THEME:dark] -> Toggles Dark Mode.
       * [ACTION:THEME:light] -> Toggles Light Mode.

### CURRENT CONTEXT:
- Selected Language: ${targetLanguage}
- Format: Clean, brief Markdown. Always offer direct WhatsApp or Contact page links.`;
}

export class SimulationResultWrapper implements DevSimulationResult {
  reply: string;
  actions?: JarvisAction[];
  handoff?: HandoffData;
  estimate?: EstimateData;

  constructor(data: DevSimulationResult) {
    this.reply = data.reply;
    this.actions = data.actions;
    this.handoff = data.handoff;
    this.estimate = data.estimate;
  }

  toString(): string {
    return this.reply;
  }

  [Symbol.toPrimitive](): string {
    return this.reply;
  }

  includes(searchString: string, position?: number): boolean {
    return this.reply.includes(searchString, position);
  }
}

/**
 * Detect language from text content:
 * - "darija": Algérois/Moroccan Darija keywords in Arabic script or Arabizi
 * - "ar": Modern Standard Arabic
 * - "fr": French (accents, common pronouns, interrogatives)
 * - "en": English (common keywords, pronouns, interrogatives)
 */
export function detectLanguage(text: string, fallback: string = "en"): "darija" | "ar" | "fr" | "en" {
  const query = (text || "").toLowerCase().trim();
  if (!query) {
    if (fallback === "fr" || fallback === "ar" || fallback === "darija") return fallback as any;
    return "en";
  }

  // 1. Darija keywords in Arabic script
  if (/(ديال|باش|بغيت|شنو|واش|شحال|فين|عافاك|زوين|بزاف|مزيان|دابا|كاين|كنديرو|كنقدرو|نقدر|راك|واخا|ساهل|خدمة|دارجة|حنا|نتوما|هاد|هادي|هادو|دير|نديرو|عاود|شوف|كاينين|عطيني|شكون|كاش|واش كاين)/.test(query)) {
    return "darija";
  }

  // 2. Darija Arabizi (Latin script with dialect vocabulary or digit substitutions)
  const isDarijaArabizi =
    /\b(salam|bghit|khoya|kidayr|chhal|ch7al|fin|3afak|dyal|doka|dorka|lazem|saguem|khedma|wach|chno|fash|krite|tomobil|sachi|trisiti|bezzaf|kayen|chta|we9t|9bel|9alli|chouf|hada|hadi|mzyan|mli7|chwiya|t3ich|choufi|khdma|rak|ntaya|ntina|hder|kalam|walo|walou|rani|rakom|choufou|sa7a|m3ak|n9der|kifech|kifach|3la|fih|fiha|nta|nti|hadak|hadik)\b/i.test(query) ||
    /\b[a-zA-Z]*[23579][a-zA-Z]*\b/.test(query);

  if (isDarijaArabizi) {
    return "darija";
  }

  // 3. Arabic script (Modern Standard Arabic)
  if (/[\u0600-\u06FF]/.test(query)) {
    return "ar";
  }

  // 4. French (common French terms, pronouns, questions, or accents)
  if (
    /[éèêëàâôûùçîï]/i.test(query) ||
    /\b(bonjour|salut|merci|combien|coute|coûte|prix|projet|site|application|devis|pouvez|vous|nous|pour|avec|dans|faire|créer|je|veux|est|sont|mon|une|les|des|cette|notre|votre|tarif|contacter|qui|qu'est|comment|aide|besoin|plateforme|développement|fonctionne)\b/i.test(query)
  ) {
    return "fr";
  }

  // 5. English (common English words)
  if (
    /\b(hello|hey|hi|how|much|cost|price|website|app|build|can|you|what|is|the|we|need|want|help|project|estimate|dark|mode|service|stack|who|are|tell|me|about|work|features|pricing|platform|why|working|start)\b/i.test(query)
  ) {
    return "en";
  }

  // 6. Fallback based on locale if set
  if (fallback === "fr" || fallback === "ar" || fallback === "darija") {
    return fallback as any;
  }

  return "en";
}

/**
 * Intelligent simulation engine implementing the 2-stage architecture locally
 * with full autonomous "Jarvis" UI action dispatching and Telegram handoff detection.
 */
export function generateDevSimulationResponse(
  message: string,
  language: string = "auto",
  history?: Array<{ role: string; content: string }>
): SimulationResultWrapper {
  const query = message.toLowerCase().trim();
  const effectiveLang: "darija" | "ar" | "fr" | "en" =
    language === "auto" || !language
      ? detectLanguage(message, "en")
      : language === "ar-MA"
      ? "darija"
      : (language as any);
  const actions: JarvisAction[] = [];
  let handoff: HandoffData | undefined;
  let estimate: EstimateData | undefined;

  // 1. Detect Phone Number / Contact Information in message
  const phoneMatch = message.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,6}/);
  const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  // 2. Action Detection: Theme Switching (Seamless Autonomous Control)
  const hasThemeContext =
    /\b(theme|thème|mode|couleur|color|affichage|look|fond|ecran|écran|3ayniya|3iniya|عينيا)\b/i.test(query) ||
    /\b(dark|sombre|k7el|ke7el|layl|layla|ليل|داكن|black|noir|nocturne|night)\b/i.test(query) ||
    /\b(light|clair|byed|byedh|byadh|byad|abyad|blanc|white|نهار|فاتح|day)\b/i.test(query);

  if (hasThemeContext) {
    const mentionsLight = /\b(light|clair|byed|byedh|byadh|byad|abyad|blanc|white|نهار|فاتح|day\s*mode)\b/i.test(query);
    const mentionsDark = /\b(dark|sombre|k7el|ke7el|layl|layla|ليل|داكن|black|noir|nocturne|night\s*mode)\b/i.test(query);
    const fromDark = /\b(men|min|from|quitter)\s+(l'?\s*)?(k7el|ke7el|dark|sombre|noir|black|layl)\b/i.test(query);
    const fromLight = /\b(men|min|from|quitter)\s+(l'?\s*)?(byed|byedh|byadh|byad|abyad|light|clair|white)\b/i.test(query);
    const toLight =
      /\b(l'?\s*|vers|to|into)\s*(byed|byedh|byadh|byad|abyad|light|clair|white|blanc)\b/i.test(query) ||
      /\b(mode\s+l'?\s*(byed|byedh|byadh|byad|abyad|light|clair|white))\b/i.test(query);
    const toDark =
      /\b(l'?\s*|vers|to|into)\s*(k7el|ke7el|dark|sombre|noir|black)\b/i.test(query) ||
      /\b(mode\s+l'?\s*(k7el|ke7el|dark|sombre|noir|black))\b/i.test(query);

    let targetTheme: "light" | "dark" | null = null;

    if (fromDark || toLight) {
      targetTheme = "light";
    } else if (fromLight || toDark) {
      targetTheme = "dark";
    } else if (mentionsLight && !mentionsDark) {
      targetTheme = "light";
    } else if (mentionsDark && !mentionsLight) {
      targetTheme = "dark";
    }

    if (targetTheme === "dark") {
      actions.push({ type: "SET_THEME", payload: "dark" });
      const reply =
        effectiveLang === "darija"
          ? "Saye! Beddeltlek l'mode l **Dark Mode** 🌙."
          : effectiveLang === "fr"
          ? "J'ai basculé l'interface en **Dark Mode** 🌙."
          : effectiveLang === "ar"
          ? "تم تحويل واجهة المنصة إلى **الوضع الداكن** 🌙 بنجاح."
          : "Switched to **Dark Mode** 🌙!";
      return new SimulationResultWrapper({ reply, actions });
    }

    if (targetTheme === "light") {
      actions.push({ type: "SET_THEME", payload: "light" });
      const reply =
        effectiveLang === "darija"
          ? "Saye! Beddeltlek l'mode l **Light Mode** ☀️."
          : effectiveLang === "fr"
          ? "J'ai basculé l'interface en **Light Mode** ☀️."
          : effectiveLang === "ar"
          ? "تم تحويل واجهة المنصة إلى **الوضع الفاتح** ☀️ بنجاح."
          : "Switched to **Light Mode** ☀️!";
      return new SimulationResultWrapper({ reply, actions });
    }
  }

  // 3. Action Detection: Navigation
  if (
    query.includes("projets") ||
    query.includes("projects") ||
    query.includes("portfolio") ||
    query.includes("مشاريع") ||
    query.includes("أعمال") ||
    query.includes("اعمال") ||
    query.includes("werili")
  ) {
    actions.push({ type: "NAVIGATE", payload: "/projects" });
    const reply =
      language === "darija"
        ? "Rani ditek l [Page Projets](/projects) 📁 bach tchouf khdemtna."
        : language === "fr"
        ? "Je vous redirige vers la page [Projets](/fr/projects) 📁."
        : language === "ar"
        ? "تم توجيهك إلى صفحة [المشاريع](/ar/projects) 📁 لاستعراض سابقة الأعمال."
        : "Navigated to [Projects](/en/projects) 📁 showcase.";
    return new SimulationResultWrapper({ reply, actions });
  }

  if (
    query.includes("services") ||
    query.includes("خدمات") ||
    query.includes("حلول") ||
    query.includes("solutions")
  ) {
    actions.push({ type: "NAVIGATE", payload: "/services" });
    actions.push({ type: "SHOW_SERVICES", payload: DEVYX_AGENCY_CONTEXT.services.map((s) => s.name) });
    const reply =
      language === "darija"
        ? "Rani fté7tlek [Page Services](/services) ⚙️ (Web, Mobile, n8n, AI Agents). Chnou li yhemmek?"
        : language === "fr"
        ? "Voici notre catalogue sur la page [Services](/fr/services) ⚙️ (Web, Mobile, n8n, IA). Quel domaine vous intéresse ?"
        : language === "ar"
        ? "تم فتح صفحة [الخدمات](/ar/services) ⚙️ (ويب، تطبيقات، أتمتة n8n، وكلاء الذكاء الاصطناعي)."
        : "Navigated to [Services](/en/services) ⚙️ matrix (Web, Mobile, n8n, AI Agents). What are you building?";
    return new SimulationResultWrapper({ reply, actions });
  }

  const isContactPageNav =
    (query.includes("contact") || query.includes("اتصال") || query.includes("تواصل")) &&
    (/\b(page|aller|open|show|ouvre|dini|affich|voir|صفحة|وريني|افتح|take me)\b/i.test(query) ||
      query === "contact" ||
      query === "contact us" ||
      query === "contactez-nous" ||
      query === "تواصل معنا");

  if (isContactPageNav && !phoneMatch && !emailMatch && !query.includes("contact me") && !query.includes("contactez-moi")) {
    actions.push({ type: "NAVIGATE", payload: "/contact" });
    const reply =
      language === "darija"
        ? "Rani ditek l [Page Contact](/contact) 📬 bach t'contacti l'équipe direct."
        : language === "fr"
        ? "Je vous redirige vers la page [Contact](/fr/contact) 📬."
        : language === "ar"
        ? "تم توجيهك إلى صفحة [التواصل](/ar/contact) 📬 لمراسلة فريق الهندسة مباشرة."
        : "Navigated to [Contact](/en/contact) 📬 page to connect with our engineering team.";
    return new SimulationResultWrapper({ reply, actions });
  }

  // Contextual reference to previous page from history
  const isContextualNav =
    /\b(earlier|previous|told you|discussed|last page|before|défini|précédent|9otlek|hderna|déjà)\b/i.test(query) &&
    /\b(page|navigate|open|take me|dini|edi|odi|aller|retour)\b/i.test(query);

  if (isContextualNav && history && history.length > 0) {
    const historyText = history.map((h) => h.content).join(" ").toLowerCase();
    if (historyText.includes("project") || historyText.includes("portfolio") || historyText.includes("مشاريع")) {
      actions.push({ type: "NAVIGATE", payload: "/projects" });
      const reply =
        effectiveLang === "darija"
          ? "Rani 3awedt ditek l [Page Projets](/projects) 📁 li hderna 3liha."
          : effectiveLang === "fr"
          ? "Je vous ramène sur la page [Projets](/fr/projects) 📁 dont nous parlions."
          : effectiveLang === "ar"
          ? "تمت إعادتك إلى صفحة [المشاريع](/ar/projects) 📁 التي تحدثنا عنها سابقاً."
          : "Navigated back to [Projects](/en/projects) 📁 showcase as discussed earlier.";
      return new SimulationResultWrapper({ reply, actions });
    }
    if (historyText.includes("service") || historyText.includes("خدمات")) {
      actions.push({ type: "NAVIGATE", payload: "/services" });
      const reply =
        effectiveLang === "darija"
          ? "Rani 3awedt ditek l [Page Services](/services) ⚙️ li hderna 3liha."
          : effectiveLang === "fr"
          ? "Je vous ramène sur la page [Services](/fr/services) ⚙️ dont nous parlions."
          : effectiveLang === "ar"
          ? "تمت إعادتك إلى صفحة [الخدمات](/ar/services) ⚙️ التي تحدثنا عنها سابقاً."
          : "Navigated back to [Services](/en/services) ⚙️ matrix as discussed earlier.";
      return new SimulationResultWrapper({ reply, actions });
    }
    if (historyText.includes("contact") || historyText.includes("تواصل")) {
      actions.push({ type: "NAVIGATE", payload: "/contact" });
      const reply =
        effectiveLang === "darija"
          ? "Rani 3awedt ditek l [Page Contact](/contact) 📬."
          : effectiveLang === "fr"
          ? "Je vous ramène sur la page [Contact](/fr/contact) 📬."
          : effectiveLang === "ar"
          ? "تمت إعادتك إلى صفحة [التواصل](/ar/contact) 📬."
          : "Navigated back to [Contact](/en/contact) 📬 page.";
      return new SimulationResultWrapper({ reply, actions });
    }
  }

  // 4. Action Detection: Language Switching Request (Explicit Switch Directive)
  // French switch
  const isFrenchSwitch =
    (/\b(switch|change|bedel|bedli|badal|passer|parle|parler|speak|ahdar|hder)\b.*(français|francais|french)/i.test(query) ||
      /\b(en français|en francais|au francais|parle français|parle francais|speak french|mode français|mode francais)\b/i.test(query) ||
      query === "french" ||
      query === "français" ||
      query === "francais") &&
    !/\b(app|application|site|learning|formation|cours|traduction|translate)\b/i.test(query);

  if (isFrenchSwitch) {
    actions.push({ type: "SET_LOCALE", payload: "fr" });
    return new SimulationResultWrapper({
      reply: "Parfait ! J'ai basculé le mode de discussion en français 🇫🇷. Comment puis-je vous accompagner sur votre projet technique ?",
      actions,
    });
  }

  // Darija switch
  const isDarijaSwitch =
    (/\b(switch|change|bedel|bedli|badal|passer|parle|parler|speak|ahdar|hder|hdr|kellem|ehki)\b.*(darija|darja|algerian|dzair)/i.test(query) ||
      /\b(bel darija|b darija|b ed-darija|b eddarja|f darija)\b/i.test(query) ||
      query === "darija" ||
      query === "الدارجة" ||
      query === "دارجة") &&
    !/\b(app|application|transcription|voix|voice|audio|model|ai|api)\b/i.test(query);

  if (isDarijaSwitch) {
    actions.push({ type: "SET_LOCALE", payload: "darija" });
    return new SimulationResultWrapper({
      reply: "Salam! Beddelt l'mode ta3 l'chat l ed-Darija 🇩🇿. Kifech n9der n3awnek f l'projet tech ta3ek lyoum?",
      actions,
    });
  }

  // English switch
  const isEnglishSwitch =
    (/\b(switch|change|bedel|bedli|badal|passer|parle|parler|speak|ahdar|hder)\b.*(english|anglais)/i.test(query) ||
      /\b(in english|to english|speak english|parle anglais|english please|mode english|english mode)\b/i.test(query) ||
      query === "english" ||
      query === "anglais") &&
    !/\b(app|application|learning|cours|formation|platform|site|ecommerce)\b/i.test(query);

  if (isEnglishSwitch) {
    actions.push({ type: "SET_LOCALE", payload: "en" });
    return new SimulationResultWrapper({
      reply: "Affirmative! Switched the chat language mode to English 🇬🇧. What technical architecture or software project are you planning?",
      actions,
    });
  }

  // Arabic (Fus'ha) switch
  const isArabicSwitch =
    (/\b(switch|change|bedel|bedli|badal|passer|speak|ahdar|hder|t7aded|تحدث|تكلم|حول|غير|بدل)\b.*(arabic|arabe|عربية|فصحى|بالعربية)/i.test(query) ||
      /\b(بالعربية|بالفصحى|en arabe|in arabic|mode arabe|arabic mode)\b/i.test(query) ||
      query === "arabic" ||
      query === "arabe" ||
      query === "العربية" ||
      query === "عربية");

  if (isArabicSwitch) {
    actions.push({ type: "SET_LOCALE", payload: "ar" });
    return new SimulationResultWrapper({
      reply: "تم تحويل لغة المحادثة إلى العربية 🇸🇦. كيف يمكننا خدمة مشروعكم التقني اليوم؟",
      actions,
    });
  }

  // 5. Action Detection: Human Specialist & Telegram Escalation
  const isHumanEscalation =
    query.includes("nahder m3a") ||
    query.includes("nahdar m3a") ||
    query.includes("hder m3a") ||
    query.includes("hdar m3a") ||
    query.includes("ihder m3a") ||
    query.includes("humain") ||
    query.includes("human") ||
    query.includes("شخص") ||
    query.includes("إنسان") ||
    query.includes("مدير") ||
    query.includes("admin") ||
    query.includes("directeur") ||
    query.includes("call me") ||
    query.includes("اتصل") ||
    query.includes("عیطلی") ||
    query.includes("عيطلي") ||
    query.includes("تحدث مع") ||
    query.includes("مسؤول") ||
    query.includes("responsable") ||
    query.includes("developpeur") ||
    query.includes("developer") ||
    query.includes("talk to someone") ||
    query.includes("speak to someone") ||
    query.includes("speak with") ||
    query.includes("talk with") ||
    phoneMatch ||
    emailMatch;

  if (isHumanEscalation) {
    const contactInfo = phoneMatch ? phoneMatch[0] : emailMatch ? emailMatch[0] : "Requesting Callback";
    const hasContact = contactInfo !== "Requesting Callback";

    // Build context summary from history if available
    let topicSummary = "General technical inquiry";
    if (history && history.length > 0) {
      const historyStr = history.map((h) => h.content).join(" ").toLowerCase();
      if (historyStr.includes("web") || historyStr.includes("next.js") || historyStr.includes("platform")) {
        topicSummary = "Next.js 15 Web Platform Architecture";
      } else if (historyStr.includes("mobile") || historyStr.includes("app") || historyStr.includes("flutter")) {
        topicSummary = "Cross-Platform Mobile App (iOS / Android)";
      } else if (historyStr.includes("n8n") || historyStr.includes("automation") || historyStr.includes("workflow")) {
        topicSummary = "n8n Autonomous Workflow Automation";
      } else if (historyStr.includes("ai") || historyStr.includes("gemini") || historyStr.includes("agent")) {
        topicSummary = "Autonomous AI Agents & Multi-Modal Systems";
      }
    }

    handoff = {
      requested: true,
      clientName: "Prospective Client",
      contact: contactInfo,
      summary: `Client requested lead technical consultant contact. Topic: "${topicSummary}". Query: "${message}"`,
      urgency: "HIGH",
    };
    actions.push({ type: "TELEGRAM_HANDOFF", payload: handoff });

    const reply = hasContact
      ? effectiveLang === "darija"
        ? `Sayeft les coordonnées ta3ek (${contactInfo}) l l'équipe technique f Telegram 🚨. Ra7 y'contactik un responsable technique f a9reb we9t!`
        : effectiveLang === "fr"
        ? `Vos coordonnées (${contactInfo}) ont été transmises à notre équipe technique sur Telegram 🚨. Un responsable va vous recontacter rapidement.`
        : effectiveLang === "ar"
        ? `تم إرسال بياناتكم (${contactInfo}) إلى فريق الإدارة الهندسية عبر تيليجرام 🚨. سيتواصل معكم مسؤول تقني في أقرب وقت.`
        : `Your contact info (${contactInfo}) has been dispatched to our engineering team on Telegram 🚨. A lead specialist will reach out shortly.`
      : effectiveLang === "darija"
        ? "Sayeft alerte direct l l'équipe technique f Telegram 🚨. 3tina noumrou WhatsApp ta3ek wela email bach y'contactiwak f lwe9t, wela hder direct f [WhatsApp](https://wa.me/213000000000)."
        : effectiveLang === "fr"
        ? "Alerte transmise en direct à l'équipe technique sur Telegram 🚨. Laissez-nous votre WhatsApp ou email pour vous recontacter immédiatement, ou écrivez-nous sur [WhatsApp](https://wa.me/213000000000)."
        : effectiveLang === "ar"
        ? "تم إرسال إشعار فوري إلى فريق الإدارة الهندسية عبر تيليجرام 🚨. يُرجى تزويدنا برقم واتساب أو بريدك الإلكتروني لنتواصل معك فوراً، أو تفضل بمراسلتنا عبر [واتساب](https://wa.me/213000000000)."
        : "Priority alert dispatched to our lead engineering team on Telegram 🚨. Please provide your WhatsApp number or email so an engineer can reach you immediately, or connect via [WhatsApp](https://wa.me/213000000000).";

    return new SimulationResultWrapper({ reply, actions, handoff });
  }

  // 6. Action Detection: Instant Cost & Timeline Estimator
  if (
    query.includes("شحال") ||
    query.includes("ch7al") ||
    query.includes("chhal") ||
    query.includes("ثمن") ||
    query.includes("prix") ||
    query.includes("cost") ||
    query.includes("tarif") ||
    query.includes("devis") ||
    query.includes("budget") ||
    query.includes("ميزانية") ||
    query.includes("pricing") ||
    query.includes("estimation")
  ) {
    let projectType = "Plateforme Web Professionnelle";
    let cost = "$950 – $1,800";
    let timeline = "10 – 20 Days";
    let stack = ["Web Moderne", "Design Responsive", "Base de Données", "Optimisation SEO"];
    let deliverables = [
      "Site web sur-mesure ultra-rapide et responsive",
      "Design moderne adapté à votre marque et mobile",
      "Connexion automatique avec WhatsApp et vos contacts",
      "Sécurité maximale et hébergement optimisé",
    ];

    if (query.includes("mobile") || query.includes("تطبيق") || /\b(app|apps|application|applications|l'app)\b/i.test(query)) {
      projectType = "Application Mobile (iOS & Android)";
      cost = "$1,400 – $2,600";
      timeline = "14 – 28 Days";
      stack = ["iOS & Android", "Interface Fluide", "Notifications Push", "Cloud Sync"];
      deliverables = [
        "Application mobile fluide pour iPhone et Android",
        "Fonctionnement rapide et synchronisation automatique",
        "Authentification sécurisée et notifications push",
        "Prête pour publication sur App Store et Google Play",
      ];
    } else if (query.includes("n8n") || query.includes("automation") || query.includes("أتمتة")) {
      projectType = "Système d'Automatisation des Tâches";
      cost = "$600 – $1,200";
      timeline = "5 – 12 Days";
      stack = ["Workflow Automation", "API Integration", "Webhooks", "Database Sync"];
      deliverables = [
        "Connexion automatique de vos outils (WhatsApp, CRM, Sheets)",
        "Gain de temps précieux et élimination des tâches manuelles",
        "Alertes instantanées en temps réel",
        "Zéro abonnement mensuel par tâche",
      ];
    }

    estimate = {
      projectType,
      estimatedCost: cost,
      timeline,
      deliverables,
      suggestedStack: stack,
    };
    actions.push({ type: "ESTIMATE_CARD", payload: estimate });

    const reply =
      effectiveLang === "darija"
        ? `Dertlek estimation préliminaire (${cost} | ${timeline}) lte7t 💰. T9der t'valider f [WhatsApp](https://wa.me/213000000000) wela f [Page Contact](/contact)!`
        : effectiveLang === "fr"
        ? `Voici une estimation préliminaire (${cost} | ${timeline}) affichée ci-dessous 💰. Échangeons sur [WhatsApp](https://wa.me/213000000000) ou via la [Page Contact](/fr/contact).`
        : effectiveLang === "ar"
        ? `تم إعداد تقدير أولي (${cost} | ${timeline}) في البطاقة أدناه 💰. يمكنك اعتماده عبر [واتساب](https://wa.me/213000000000) أو [صفحة التواصل](/ar/contact).`
        : `Generated preliminary estimate below (${cost} | ${timeline}) 💰. Ready to review on [WhatsApp](https://wa.me/213000000000) or our [Contact Page](/en/contact)?`;

    return new SimulationResultWrapper({ reply, actions, estimate });
  }

  // 7. Action Detection: Greetings
  const isGreeting =
    /^(salam|mar7ba|bonjour|salut|hello|hi|hey|coucou|ahla|مرحبا|أهلا|سلام)/i.test(query) ||
    query === "salam" ||
    query === "bonjour" ||
    query === "hello";

  if (isGreeting) {
    const reply =
      effectiveLang === "darija"
        ? "Salam! 👋 Ana l'assistant IA ta3 Devyx. Kifech n9der n3awnek f l'projet ta3ek lyoum?"
        : effectiveLang === "fr"
        ? "Bonjour ! 👋 Je suis l'assistant IA de Devyx. Comment puis-je vous accompagner sur votre projet aujourd'hui ?"
        : effectiveLang === "ar"
        ? "أهلاً بك! 👋 أنا المساعد الذكي لـ Devyx. كيف يمكنني مساعدتك في مشروعك اليوم؟"
        : "Hello! 👋 I'm your Devyx AI assistant. How can I assist with your project today?";
    return new SimulationResultWrapper({ reply });
  }

  // 8. Action Detection: Out-of-Scope Queries (General trivia, recipes, poetry, sports, shoes/clothes, cars, real estate, etc.)
  const isOutOfScope =
    /\b(recette|recipe|pizza|cake|gateau|chocolat|cuisine|cook|cooking|tabkh|tayab|makla|طبيخ|طبخ|وصفة|اكل|ماكلة)\b/i.test(query) ||
    /\b(sabat|sabate|chaussure|shoes|sneakers|vetement|clothes|chri|nechri|nechriw|حذاء|شراء\s*حذاء|صباط)\b/i.test(query) ||
    /\b(tomobil|voiture|car|cars|moteur|panne|garage|mecanique|mécanique|autoroute|piece|pièce|kera|appartement|louer|location|immobilier|villa|studio|f3|f4|f2|hydra|kouba|دار|كراء|شقة|سيارة|طوموبيل)\b/i.test(query) ||
    /\b(docteur|medecin|médicin|tabib|dwa|malade|mrid|hôpital|hopital|طبيب|دواء|مستشفى)\b/i.test(query) ||
    /\b(world\s*cup|football|messi|ronaldo|ballon\s*d'or|match|coupe\s*du\s*monde|كأس\s*العالم|كرة\s*القدم|ميسي|رونالدو)\b/i.test(query) ||
    /\b(po[eèé]me|poetry|poem|ch3ar|ch3er|chعر|قصيدة|شعر|blague|joke|nokat|nokta|نكتة|نكت)\b/i.test(query) ||
    /\b(who\s*is\s*(?!devyx)|qui\s*est\s*(?!devyx)|chkoun\s*(?!devyx)|من\s*هو\s*(?!devyx))\b/i.test(query) ||
    /\b(capital\s*of|capitale\s*de|عاصمة|weather|météo|taqs|how\s*old\s*is|quel\s*âge\s*a)\b/i.test(query) ||
    /\b(homework|devoir|math\s*problem|calculus|histoire\s*de\s*france|president|politique|election)\b/i.test(query);

  const hasSoftwareContext = /\b(projet|project|app|application|site|web|logiciel|software|ia|ai|system|système|code|coder|develop|développ|automati|api|bot|model|vision|tag|tagi|tracking|plateforme|platform)\b/i.test(query);
  if (isOutOfScope && !hasSoftwareContext) {
    const reply =
      effectiveLang === "darija"
        ? "Ana l'assistant IA ta3 Devyx. N3awnek ghir f les projets ta3 création des sites web, applications mobile, l'automatisation w l'intelligence artificielle. Kifech n9der n3awnek f l'projet digital ta3ek?"
        : effectiveLang === "fr"
        ? "Je suis l'assistant IA de Devyx. Je vous accompagne exclusivement sur vos projets de création de sites web, applications mobiles, automatisations et solutions d'intelligence artificielle. Comment puis-je vous accompagner sur votre projet digital ?"
        : effectiveLang === "ar"
        ? "أنا المساعد الذكي لـ Devyx. أساعدك حصرياً في مشاريع تطوير المواقع، تطبيقات الهاتف، أتمتة الأعمال، وحلول الذكاء الاصطناعي. كيف يمكنني مساعدتك في مشروعك اليوم؟"
        : "I am an AI assistant for Devyx. I help prospective clients with custom websites, mobile applications (iOS & Android), business workflow automations, and AI systems. How can I assist with your software project today?";
    return new SimulationResultWrapper({ reply: effectiveLang === "darija" ? sanitizeDarijaText(reply) : reply });
  }

  // 9. Domain Queries (Specific to General) & Concise Defaults
  if (effectiveLang === "darija") {
    // Payment integrations DZ
    if (/\b(chargily|satim|cib|dahabia|edahabia)\b/i.test(query) || (/\b(paiement|paiements)\b/i.test(query) && /\b(ligne|carte|passerelle|gateway|dz)\b/i.test(query))) {
      const reply = "Iyeh, n'intégrer-iw les solutions de paiement DZ kima Chargily w Satim (CIB / Edahabia) direct f les sites w les apps ta3na bach ykoun le paiement sahle w sécurisé.";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // AI voice / Transcription
    if (/\b(transcription|vocal|vocale|voix|audio|speech)\b/i.test(query)) {
      const reply = "Oui, n9edrou n'intégrer la transcription vocale b Darija f l'application mobile ta3ek bach les utilisateurs y'hedrou b tbi3ethom. T9der t'contactina direct f [WhatsApp](https://wa.me/213000000000)!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Chatbots & Social Messaging
    if (/\b(bot|chatbot|instagram|facebook|messagerie|messages)\b/i.test(query)) {
      const reply = "N'développiw des bots w agents IA intelligents li y'jawbou 3la les clients f Instagram w Facebook 24/7. T9der t'contactina direct f [WhatsApp](https://wa.me/213000000000) bach n'beddaw!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Meeting / Office inquiry
    if (/\b(bureau|office|meet|meeting|visite|siege|siège)\b/i.test(query)) {
      const reply = "7na agency remote 100%, ma 3endnach bureau physique f Dzayer. Mais, n9edrou n'programmiw Google Meet m3a l'équipe ta3na bach n'nahdrou 3la l'projet ta3ek direct!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Negotiation / Pricing discount
    if (/\b(ghali|remise|reduction|réduction|facilitez|facilité|cher|ghla)\b/i.test(query)) {
      const reply = "Les prix ta3na y'3akssou la qualité l'3alya w la livraison rapide (site web men $950 f 10-20 jours). T9der t'contactina f [WhatsApp](https://wa.me/213000000000) bach n'choufou solution t'sa3ed l'budget ta3ek!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // UI/UX & Design
    if (/\b(ui|ux|design|figma|maquette|maquettes)\b/i.test(query)) {
      const reply = "N'khedmou le design men sfer (from scratch) 3la 7sab l'identité ta3ek, wela n'khadmiw b les maquettes Figma ta3ek b interface moderne w sahla. T9der t'contactina direct f [WhatsApp](https://wa.me/213000000000)!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Maintenance & Technical support
    if (/\b(maintenance|support|garantie|suivi)\b/i.test(query)) {
      const reply = "Oui, n'fourniw support technique, maintenance w garantie mor ma n'lanciwha l'projet bach n'garantiw belli kolchi yemchi mli7 bla 7ta mouchkil. T9der t'contactina direct f [WhatsApp](https://wa.me/213000000000)!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Hosting & Domain
    if (query.includes("hebergement") || query.includes("hébergement") || query.includes("domaine") || query.includes("serveur") || query.includes("hosting")) {
      const reply = "7na n'gériw ga3 la partie technique ta3 l'hébergement w le nom de domaine bach ykoun le site rapide w sécurisé 100%. 3lik ghir t'meddelna le nom de domaine li 7ab t'khdem bih!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Data security & Privacy
    if (/\b(securite|sécurité|securise|sécurisé|donnees|données|serveur|serveurs|stockage|stocker|stockés|stocké)\b/i.test(query)) {
      const reply = "Les données ta3ek w ta3 les clients rahom m7miyin f des serveurs sécurisés w cryptés b a3la standard de protection w confidentialité.";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Closing & Contract
    if (/\b(contrat|cahier des charges|signiw|finaliser|lanciwha)\b/i.test(query)) {
      const reply = "Bach n'wedjou l'cahier des charges w n'signiw l'contrat, t9der t'prendi rendez-vous direct f [WhatsApp](https://wa.me/213000000000) wela f la page [Contact](/contact) bach n'beddaw direct!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Workflow automation & Sheets
    if (query.includes("n8n") || query.includes("أتمتة") || query.includes("اتمتة") || query.includes("automation") || query.includes("automatique") || query.includes("workflow") || query.includes("sheets")) {
      const reply = "L'automatisation t'connecti les outils ta3ek (CRM, Google Sheets, WhatsApp) bach kolchi yemchi automatique bla ma t'dhaye3 we9tek. Chnouma les tâches li 7ab t'khallihom automatiques?";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Mobile apps
    if (query.includes("تطبيق") || query.includes("ابليكاسيون") || query.includes("mobile") || query.includes("موبايل") || /\b(app|apps|application|applications|l'app|l'application)\b/i.test(query)) {
      const reply = "N'développiw des applications mobile li yemchiw f iPhone w Android f nafs lwe9t, b interface sahla w rapide. T9der t'demandi devis gratuit direct f [WhatsApp](https://wa.me/213000000000)!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    // Websites & Web Platforms
    if (query.includes("سيت") || query.includes("موقع") || query.includes("web") || query.includes("site")) {
      const reply = "N'développiw des sites web modernes, rapides w professionnels (sites vitrine, e-commerce wela plateformes sur-mesure). Rak 7ab tchouf des exemples wela nahdrou direct f [WhatsApp](https://wa.me/213000000000)?";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
    }

    const reply = "Devyx agence spécialisée f la création des sites web, applications mobile, l'automatisation des tâches w les solutions d'IA. Goulli wach men projet rak 7ab t'dir wela hder m3ana direct f [WhatsApp](https://wa.me/213000000000)!";
    return new SimulationResultWrapper({ reply: sanitizeDarijaText(reply) });
  }

  // French Fallback
  if (effectiveLang === "fr") {
    if (query.includes("web") || query.includes("site")) {
      return new SimulationResultWrapper({
        reply: "Nous développons des sites web et plateformes sur-mesure, modernes et rapides (vitrines, e-commerce, portails clients). Décrivez votre projet ou écrivez-nous sur [WhatsApp](https://wa.me/213000000000).",
      });
    }
    if (query.includes("n8n") || query.includes("automatisation") || query.includes("workflow")) {
      return new SimulationResultWrapper({
        reply: "Nos systèmes d'automatisation connectent vos outils (CRM, WhatsApp, facturation) pour vous faire gagner un temps précieux. Quels processus souhaitez-vous automatiser ?",
      });
    }
    if (query.includes("mobile") || query.includes("application") || /\b(app|apps)\b/i.test(query)) {
      return new SimulationResultWrapper({
        reply: "Nous créons des applications mobiles fluides pour iPhone et Android. Souhaitez-vous échanger sur votre projet sur [WhatsApp](https://wa.me/213000000000) ?",
      });
    }
    return new SimulationResultWrapper({
      reply: "Devyx conçoit des sites web sur-mesure, des applications mobiles et des solutions d'automatisation. Comment pouvons-nous vous aider ? Échangez directement sur [WhatsApp](https://wa.me/213000000000).",
    });
  }

  // Arabic Fallback
  if (effectiveLang === "ar") {
    if (query.includes("ويب") || query.includes("موقع") || query.includes("منصة")) {
      return new SimulationResultWrapper({
        reply: "نصمم مواقع ومنصات ويب عصرية وسريعة ومخصصة لنشاطك التجاري (متاجر إلكترونية، مواقع تعريفية). صف لنا فكرة مشروعك أو تواصل عبر [واتساب](https://wa.me/213000000000).",
      });
    }
    if (query.includes("أتمتة") || query.includes("اتمتة") || query.includes("n8n") || query.includes("مسار")) {
      return new SimulationResultWrapper({
        reply: "نؤتمت مسارات وأدوات عملك (واتساب، الجداول، الفواتير) لتسريع أعمالك وتوفير وقتك. ما هي المهام التي ترغب في أتمتتها؟",
      });
    }
    if (query.includes("تطبيق") || query.includes("موبايل") || query.includes("هاتف")) {
      return new SimulationResultWrapper({
        reply: "نطور تطبيقات هواتف ذكية سلسة تعمل على آيفون وأندرويد. هل ترغب في مناقشة تفاصيل التطبيق عبر [واتساب](https://wa.me/213000000000)؟",
      });
    }
    return new SimulationResultWrapper({
      reply: "أهلاً بك في Devyx! نطور المواقع الاحترافية، تطبيقات الجوال، وحلول الأتمتة الذكية. كيف يمكننا مساعدتك اليوم؟ تواصل معنا عبر [واتساب](https://wa.me/213000000000).",
    });
  }

  // English Fallback
  if (query.includes("web") || query.includes("site") || query.includes("next")) {
    return new SimulationResultWrapper({
      reply: "We engineer high-performance custom web platforms with clean responsive design. What web system are you planning? Let's discuss on [WhatsApp](https://wa.me/213000000000).",
    });
  }
  if (query.includes("n8n") || query.includes("automation") || query.includes("workflow")) {
    return new SimulationResultWrapper({
      reply: "We build custom workflow automations connecting your CRM, spreadsheets, and WhatsApp to save you hours every week. Which workflows do you want automated?",
    });
  }
  if (query.includes("mobile") || query.includes("ios") || query.includes("android") || /\b(app|apps|application|applications)\b/i.test(query)) {
    return new SimulationResultWrapper({
      reply: "We build smooth mobile applications for both iPhone and Android. Ready to discuss specifications on [WhatsApp](https://wa.me/213000000000)?",
    });
  }
  return new SimulationResultWrapper({
    reply: "Welcome to Devyx! We specialize in custom web platforms, mobile apps, and workflow automations. Tell me about your requirements or connect on [WhatsApp](https://wa.me/213000000000).",
  });
}
