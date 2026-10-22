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
export function buildGeminiSystemPrompt(targetLanguage: string = "darija"): string {
  const langInstructions: Record<string, string> = {
    darija:
      "You MUST respond EXCLUSIVELY in Algerian/Moroccan Darija (دارجة). Use Arabic script. Never switch to French or English unless the user writes in that language. Use '9' for the Qaf sound in romanized words when mixing Darija with French loanwords.",
    "ar-MA":
      "You MUST respond EXCLUSIVELY in Moroccan Darija (دارجة مغربية). Use Arabic script. Stay in dialect — do not switch to Modern Standard Arabic.",
    ar: "You MUST respond EXCLUSIVELY in Modern Standard Arabic (الفصحى). Use formal Arabic throughout. Never mix in French, English, or dialect.",
    fr: "You MUST respond EXCLUSIVELY in French. Professional, structured, and concise. Never mix in Arabic or English unless quoting technical terms.",
    en: "You MUST respond EXCLUSIVELY in English. Professional, structured, and technical. Do NOT mix in Arabic, French, or Darija under any circumstances.",
  };

  const langRule = langInstructions[targetLanguage] || langInstructions.en;

  return `You are the Lead Technical AI Consultant for **Devyx**, a premium software engineering agency specializing in high-performance web platforms (Next.js 15), cross-platform mobile apps, self-hosted n8n workflow automations, and autonomous Gemini AI agents.

### ⚠️ LANGUAGE RULE — TOP PRIORITY:
${langRule}
This is a hard constraint. The user has explicitly selected language: "${targetLanguage}". Respond ONLY in that language regardless of how the user writes.

### YOUR ROLE & MISSION:
1. Greet visitors warmly and act as an expert technical consultant.
2. Answer questions accurately about Devyx's services, architectural philosophy, delivery process, and tech stack.
3. Help prospective clients qualify their project needs (e.g., project scope, target platform, timeline, and automation goals).
4. Direct qualified leads to schedule a discovery meeting or reach the engineering team directly via WhatsApp (${DEVYX_AGENCY_CONTEXT.contact.whatsappUrl}) or the Contact page (/contact).
5. Communicate with high clarity, professionalism, and structured Markdown (bullet points, bold text). Keep responses concise and action-oriented.

### DEVYX CORE SERVICES OVERVIEW:
1. **Web Platform Architecture**:
   - Next.js 15 App Router, TypeScript, Tailwind CSS, PostgreSQL, edge ISR caching.
   - Sub-0.8s LCP guaranteed, trilingual RTL/LTR mirroring.
2. **Cross-Platform Mobile Engineering**:
   - Flutter / React Native, offline-first SQLite cache, biometric login, push alerts.
3. **Autonomous n8n Workflow Automation**:
   - Self-hosted n8n instances, zero per-task SaaS tax, ERP/CRM/Payment integrations, auto-recovery.
4. **Autonomous AI Agents (Gemini-Powered)**:
   - 24/7 intelligent qualification, fluent in Darija, Arabic, French, and English, CRM connection.

### CURRENT CONTEXT:
- Selected Language: ${targetLanguage}
- Format: Clean Markdown with bold highlights and bullet points. Always offer direct WhatsApp or Contact page links.`;
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
 * Intelligent simulation engine implementing the 2-stage architecture locally
 * with full autonomous "Jarvis" UI action dispatching and Telegram handoff detection.
 */
export function generateDevSimulationResponse(message: string, language: string = "darija"): SimulationResultWrapper {
  const query = message.toLowerCase().trim();
  const actions: JarvisAction[] = [];
  let handoff: HandoffData | undefined;
  let estimate: EstimateData | undefined;

  // 1. Detect Phone Number / Contact Information in message
  const phoneMatch = message.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,6}/);
  const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  // 2. Action Detection: Theme Switching
  if (
    query.includes("dark mode") ||
    query.includes("mode sombre") ||
    query.includes("k7el") ||
    query.includes("layla") ||
    query.includes("ليل") ||
    query.includes("الوضع الداكن") ||
    query.includes("داكن")
  ) {
    actions.push({ type: "SET_THEME", payload: "dark" });
    const reply =
      language === "darija"
        ? sanitizeDarijaText("Safy! Badaltlek l'mode l **Dark Mode** 🌙. Kifech tbanlek l'interface doka?")
        : language === "fr"
        ? "J'ai basculé l'interface en **Dark Mode** 🌙. Le contraste monochrome technique est désormais actif."
        : language === "ar"
        ? "تم تحويل واجهة المنصة إلى **الوضع الداكن** 🌙 بنجاح."
        : "Activated **Dark Mode** 🌙 across the platform viewport.";
    return new SimulationResultWrapper({ reply, actions });
  }

  if (
    query.includes("light mode") ||
    query.includes("mode clair") ||
    query.includes("byad") ||
    query.includes("نهار") ||
    query.includes("الوضع الفاتح") ||
    query.includes("فاتح")
  ) {
    actions.push({ type: "SET_THEME", payload: "light" });
    const reply =
      language === "darija"
        ? sanitizeDarijaText("Safy! Badaltlek l'mode l **Light Mode** ☀️. L'interface doka f l'mode clair.")
        : language === "fr"
        ? "J'ai activé le **Light Mode** ☀️. L'affichage haute clarté est désormais en place."
        : language === "ar"
        ? "تم تحويل واجهة المنصة إلى **الوضع الفاتح** ☀️ بنجاح."
        : "Switched platform interface to **Light Mode** ☀️.";
    return new SimulationResultWrapper({ reply, actions });
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
        ? sanitizeDarijaText("Rani fté7tlek **la page des projets** 📁! Chouf les réalisations Next.js w les plateformes SaaS li khedmnahom.")
        : language === "fr"
        ? "Je vous redirige vers la page **Projets** 📁 pour explorer nos architectures web et cas d'usage récents."
        : language === "ar"
        ? "تم توجيهك إلى صفحة **المشاريع** 📁 لاستعراض سابقة أعمالنا في النظم الرقمية."
        : "Navigated to **Projects** 📁 showcase so you can review our production architectures.";
    return new SimulationResultWrapper({ reply, actions });
  }

  if (
    query.includes("services") ||
    query.includes("خدمات") ||
    query.includes("حلول") ||
    query.includes("solutions")
  ) {
    actions.push({ type: "NAVIGATE", payload: "/services" });
    actions.push({ type: "SHOW_SERVICES", payload: DEVYX_AGENCY_CONTEXT.services.map(s => s.name) });
    const reply =
      language === "darija"
        ? sanitizeDarijaText("Rani fté7tlek **la page des services** ⚙️! Chouf les options lte7t (Next.js, Mobile, n8n, AI Agents) w goulli wach li yhemmek.")
        : language === "fr"
        ? "Voici notre catalogue d'ingénierie sur la page **Services** ⚙️ (Web, Mobile, n8n, Agents IA)."
        : language === "ar"
        ? "تم فتح صفحة **الخدمات** ⚙️ لاختيار التخصص المناسب لمشروعك (ويب، تطبيقات، أتمتة n8n، وكلاء الذكاء الاصطناعي)."
        : "Navigated to **Services** ⚙️ matrix overview. Which architecture does your roadmap require?";
    return new SimulationResultWrapper({ reply, actions });
  }

  // 4. Action Detection: Language Switching Request
  if (query.includes("parle français") || query.includes("en français") || query.includes("francais") || query.includes("français")) {
    actions.push({ type: "SET_LOCALE", payload: "fr" });
    return new SimulationResultWrapper({
      reply: "Parfait ! J'ai basculé la langue d'affichage du site en français 🇫🇷. Comment puis-je vous accompagner sur votre projet ?",
      actions,
    });
  }

  if (query.includes("speak english") || query.includes("in english") || query.includes("anglais") || query.includes("english")) {
    actions.push({ type: "SET_LOCALE", payload: "en" });
    return new SimulationResultWrapper({
      reply: "Affirmative! Switched the platform display language to English 🇬🇧. What technical architecture are you planning?",
      actions,
    });
  }

  if (query.includes("بالعربية") || query.includes("عربية") || query.includes("arabe") || query.includes("arabic")) {
    actions.push({ type: "SET_LOCALE", payload: "ar" });
    return new SimulationResultWrapper({
      reply: "تم تحويل لغة عرض الموقع إلى العربية 🇸🇦. كيف يمكننا خدمة مشروعكم اليوم؟",
      actions,
    });
  }

  // 5. Action Detection: Human Specialist & Telegram Escalation
  if (
    query.includes("nahder m3a") ||
    query.includes("humain") ||
    query.includes("human") ||
    query.includes("شخص") ||
    query.includes("إنسان") ||
    query.includes("مدير") ||
    query.includes("admin") ||
    query.includes("directeur") ||
    query.includes("call me") ||
    query.includes("اتصل") ||
    phoneMatch ||
    emailMatch
  ) {
    const contactInfo = phoneMatch ? phoneMatch[0] : emailMatch ? emailMatch[0] : "Requesting Callback";
    handoff = {
      requested: true,
      clientName: "Prospective Client",
      contact: contactInfo,
      summary: `Client requested direct technical consultant contact. Query: "${message}"`,
      urgency: "HIGH",
    };
    actions.push({ type: "TELEGRAM_HANDOFF", payload: handoff });

    const reply =
      language === "darija"
        ? sanitizeDarijaText(
            `Wakha 3la rasna w 3inna! Sayeft une alerte directe l'groupe Telegram ta3 l'équipe d'ingénierie ta3na 🚨.\n\n` +
            `Dossier ta3ek ra7 ychoufou un directeur technique f lwe9t. T9der tani tcontactih direct f [WhatsApp](https://wa.me/213000000000) wela [Telegram](https://t.me/devyx_official)!`
          )
        : language === "fr"
        ? "Demande transmise avec succès ! Une alerte prioritaire a été envoyée sur le canal Telegram de notre direction technique 🚨. Un ingénieur senior prendra contact avec vous très rapidement."
        : language === "ar"
        ? "تم إرسال إشعار فوري إلى فريق الإدارة الهندسية عبر Telegram 🚨. سيتواصل معك أحد مسؤولينا التقنيين مباشرة."
        : "Priority dispatch logged! An executive notification has been routed to our lead engineering Telegram channel 🚨. A technical lead will connect with you shortly.";

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
    let projectType = "Full-Stack Web & Automation Pipeline";
    let cost = "$950 – $1,800";
    let timeline = "10 – 20 Days";
    let stack = ["Next.js 15", "n8n Self-Hosted", "PostgreSQL", "Tailwind CSS"];
    let deliverables = [
      "Custom Next.js 15 Web Platform with Sub-0.8s LCP",
      "Self-Hosted n8n Workflow Automation (Zero SaaS Tax)",
      "Automated CRM Lead Routing & WhatsApp Sync",
      "Hardened Supabase PostgreSQL with RLS Security",
    ];

    if (query.includes("mobile") || query.includes("تطبيق") || query.includes("app")) {
      projectType = "Cross-Platform Mobile Application";
      cost = "$1,400 – $2,600";
      timeline = "14 – 28 Days";
      stack = ["Flutter / React Native", "SQLite Offline Cache", "Supabase Auth", "Push Alerts"];
      deliverables = [
        "Unified iOS & Android Native Codebase",
        "Offline-First Data Storage & Auto-Sync",
        "Biometric Security (FaceID / Fingerprint)",
        "App Store & Google Play Ready Build",
      ];
    } else if (query.includes("n8n") || query.includes("automation") || query.includes("أتمتة")) {
      projectType = "Autonomous n8n Business Pipeline";
      cost = "$600 – $1,200";
      timeline = "5 – 12 Days";
      stack = ["n8n (Self-Hosted)", "Webhooks", "PostgreSQL", "REST APIs"];
      deliverables = [
        "Zero-SaaS-Fee Workflow Engine on Dedicated Server",
        "Multi-Step API Synchronization (CRM, Sheets, Invoicing)",
        "Automated Error Recovery & Telegram Alerting",
        "Real-Time Data Pipelines",
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
      language === "darija"
        ? sanitizeDarijaText(
            `Dertlek estimation technique instantanée l'projet ta3ek f la carte lte7t 💰!\n\n` +
            `T9der tchouf l'budget prévisionnel (${cost}), l'délai (${timeline}), w les technologies. ` +
            `Bach n'fixiw le devis définitif, hder direct f [WhatsApp](https://wa.me/213000000000) wela t'demandi consultation f [Page Contact](/contact)!`
          )
        : language === "fr"
        ? `Voici notre estimation technique instantanée pour votre projet (${cost} | ${timeline}) affichée ci-dessous 💰. Souhaitez-vous planifier un cadrage d'architecture ?`
        : language === "ar"
        ? `تم إنشاء تقدير أولي لتكلفة وجدول المشروع (${cost} | ${timeline}) في البطاقة أدناه 💰. يمكنك حجز استشارة فنية للمعاينة التفصيلية.`
        : `Generated an instant engineering estimate for your system below (${cost} | ${timeline}) 💰. Ready to review specific architecture specifications?`;

    return new SimulationResultWrapper({ reply, actions, estimate });
  }

  // 7. General Service Qualifications (Web, Mobile, Automation)
  // Detect Darija or Arabizi patterns ONLY when language is not explicitly set to en/fr/ar
  const isDarijaOrArabizi =
    language === "darija" ||
    language === "ar-MA" ||
    // Only auto-detect Darija when no explicit non-Darija language is selected
    (language !== "en" && language !== "fr" && language !== "ar" &&
      (/\b(bghit|khoya|kidayr|chhal|salam|fin|3afak|dyal|doka|dorka|lazem|saguem|khedma|wach|chno|fash|krite|tomobil|sachi|trisiti|bezzaf|kayen|chta|we9t|9bel|9alli)\b/i.test(query) ||
      (/[\u0600-\u06FF]/.test(query) && (query.includes("باش") || query.includes("ديال") || query.includes("بغيت") || query.includes("شنو") || query.includes("واش") || query.includes("شحال") || query.includes("فين")))));

  if (language === "darija" || isDarijaOrArabizi) {
    if (query.includes("سيت") || query.includes("موقع") || query.includes("web") || query.includes("site")) {
      const rawResponse =
        "Salam! F Devyx n7atto des plateformes w des sites web haute performance b Next.js 15 w PostgreSQL:\n\n" +
        "- Vitesse sub-seconde: LCP t7et 0.8s b l'edge caching mli7 fi we9tou.\n" +
        "- Support complet: trilingue RTL/LTR (Darija, Français, Anglais).\n" +
        "- Sécurité kbira: PostgreSQL m'sécurisé w zéro pannes.\n\n" +
        "Wach rak 7ab t'développi site e-commerce wela plateforme SaaS? T9der tcontactina direct f [WhatsApp](https://wa.me/213000000000) wela t'réservez consultation f [Page Contact](/contact)!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(rawResponse) });
    }

    if (query.includes("n8n") || query.includes("أتمتة") || query.includes("اتمتة") || query.includes("automation") || query.includes("workflow")) {
      const rawResponse =
        "Salam! L'automatisation b n8n hiya la spécialité ta3na f Devyx:\n\n" +
        "- Self-hosted: les workflows ta3ek f les serveurs ta3ek bla ma tkhales abonnement 3la kol tâche.\n" +
        "- Connexion direct: nconnectiw site web ta3ek m3a CRM, WhatsApp, Google Sheets w les paiements.\n" +
        "- Traitement instantané: les leads w les factures yrou7o direct bla ma tkharab fihom b yeddik.\n\n" +
        "Chnouma les tâches li rak 7ab t'automatisihom? T9der tcontactina f [WhatsApp](https://wa.me/213000000000) bach ndiroulek devis gratuit w étude technique f lwe9t!";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(rawResponse) });
    }

    if (query.includes("تطبيق") || query.includes("ابليكاسيون") || query.includes("app") || query.includes("mobile") || query.includes("موبايل")) {
      const rawResponse =
        "Salam! Le développement mobile f Devyx fih:\n\n" +
        "- Application unifiée: code wa7ed y'tourni native f iOS w Android.\n" +
        "- Offline-first: l'application temchi mli7 7atta ida trisiti wela l'connexion t9at3et, w t'synchronisi ki twelli l'internet.\n" +
        "- Sécurité: connexion b l'empreinte (biométrie) w des notifications push direct.\n\n" +
        "T9der t'plannifi rendez-vous bach nchoufou l'projet ta3ek f [Page Contact](/contact) wela direct f [WhatsApp](https://wa.me/213000000000).";
      return new SimulationResultWrapper({ reply: sanitizeDarijaText(rawResponse) });
    }

    // Default welcoming response
    const defaultRaw =
      "Salam w mar7ba bik f Devyx! Rani hna l'ingénieur consultant ta3ek:\n\n" +
      "- Plateformes Web Next.js 15 ultra-rapides\n" +
      "- Applications Mobile iOS & Android (Offline-First)\n" +
      "- Workflows n8n autonomes (Self-Hosted)\n" +
      "- Agents IA Gemini w qualification ta3 les leads 24/7\n\n" +
      "Kifech n9edrou n3awnou l'projet ta3ek lyoum? T9der thder m3ana f [WhatsApp](https://wa.me/213000000000) wela t'demandi consultation f [Page Contact](/contact)!";
    return new SimulationResultWrapper({ reply: sanitizeDarijaText(defaultRaw) });
  }

  // French Fallback
  if (language === "fr") {
    if (query.includes("web") || query.includes("site")) {
      return new SimulationResultWrapper({
        reply:
          "Bienvenue chez **Devyx** ! Nous concevons des plateformes web haute performance basées sur **Next.js 15** et **PostgreSQL** :\n\n" +
          "▸ **Vitesse sub-seconde** : LCP inférieur à 0.8s grâce à une mise en cache edge (ISR).\n" +
          "▸ **Support trilingue natif** : Prise en charge RTL/LTR pour l'arabe, le français et l'anglais.\n" +
          "▸ **Sécurité renforcée** : Protection RLS au niveau de la base de données.\n\n" +
          "Souhaitez-vous planifier une consultation ? Contactez-nous directement sur [WhatsApp](https://wa.me/213000000000) ou via notre [Page Contact](/fr/contact).",
      });
    }
    return new SimulationResultWrapper({
      reply:
        "Bienvenue sur le terminal technique **Devyx** ! Je suis votre consultant d'ingénierie automatisé propulsé par **Gemini AI** et **n8n**.\n\n" +
        "Nous pouvons vous accompagner sur :\n" +
        "▸ 🌐 Architecture de Plateformes Web modernes (Next.js 15)\n" +
        "▸ 📱 Applications Mobiles multiplateformes (iOS & Android)\n" +
        "▸ ⚙️ Pipelines d'Automatisation n8n auto-hébergés\n" +
        "▸ 🤖 Agents IA de qualification et chatbots intelligents\n\n" +
        "Quel système souhaitez-vous concevoir ? Vous pouvez également échanger sur [WhatsApp](https://wa.me/213000000000).",
    });
  }

  // Arabic Fallback
  if (language === "ar") {
    return new SimulationResultWrapper({
      reply:
        "أهلاً بك في **ديفيكس (Devyx)**! أنا المستشار الهندسي المؤتمت المدعوم بـ **Gemini AI** و **n8n**.\n\n" +
        "نحن متخصصون في بناء الحلول البرمجية عالية الأداء:\n" +
        "▸ 🌐 **منصات الويب فائقة السرعة** المبنية على Next.js 15 مع تخزين سحابي متقدم (LCP < 0.8s).\n" +
        "▸ 📱 **تطبيقات الهواتف الذكية** الموحدة لأنظمة iOS و Android مع دعم العمل دون اتصال.\n" +
        "▸ ⚙️ **مسارات أتمتة الأعمال عبر n8n** المستقلة والمستضافة ذاتياً بدون رسوم منصات وسيطة.\n" +
        "▸ 🤖 **وكلاء الذكاء الاصطناعي** لتأهيل العملاء وتقديم الدعم الفني على مدار الساعة.\n\n" +
        "كيف يمكننا مساعدة مشروعك اليوم؟ يمكنك حجز استشارة مباشرة عبر [صفحة التواصل](/ar/contact) أو عبر [واتساب](https://wa.me/213000000000).",
    });
  }

  // English Default
  return new SimulationResultWrapper({
    reply:
      "Welcome to **Devyx**! I am your automated engineering consultant powered by **Gemini AI** and **n8n**.\n\n" +
      "We specialize in deterministic software engineering across:\n" +
      "▸ 🌐 **Web Platform Architecture**: Next.js 15 App Router, sub-0.8s LCP, trilingual RTL/LTR support.\n" +
      "▸ 📱 **Cross-Platform Mobile Engineering**: High-performance unified apps for iOS & Android with offline-first synchronization.\n" +
      "▸ ⚙️ **Autonomous n8n Pipelines**: Self-hosted workflow automation connecting CRMs, APIs, and payments with zero per-task SaaS tax.\n" +
      "▸ 🤖 **Gemini AI Qualification Agents**: 24/7 intelligent qualification agents with multilingual & Darija support.\n\n" +
      "What architectural requirements are you planning? You can also connect directly with an engineering director via [WhatsApp](https://wa.me/213000000000) or our [Contact Page](/en/contact).",
  });
}
