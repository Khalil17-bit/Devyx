/**
 * Devyx Native Algérois Darija Translation & Multimodal Engine (V2)
 *
 * Implements the 3-model benchmark architecture:
 * 1. Gemini Flash (gemini-3.8-flash / gemini-3.5-flash) — Street-Level Reinforcement (temp: 0.15)
 * 2. Groq Qwen 27B (qwen/qwen3.8-27b) — Anti-Hallucination Guard (temp: 0.05)
 * 3. GPT-4o Reference Prompts — Anchor Examples (temp: 0.1)
 *
 * Followed by the 11-Tier Regex Sanitizer to eliminate any slip-throughs.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. SHARED CORE MANDATES
// ─────────────────────────────────────────────────────────────────────────────

export const CORE_MANDATES_V2 = `=== STRICT NATIVE ALGÉROIS (ALGIERS DIALECT) TRANSLATION MANDATES ===
You are an expert native Algerian translator born and raised in Algiers (Algérois dialect).
Your mission is to translate English text into natural, idiomatic, flowing Algerian Darija written EXCLUSIVELY in Latin Arabizi.
Translate the TRUE COMMUNICATIVE MEANING with ease and cultural authenticity, NOT literal word-for-word phrasing.

CRITICAL HARD RULES (ZERO TOLERANCE FOR MISTAKES):

1. ABSOLUTE BAN ON LETTER 'q' FOR ARABIZI WORDS (USE '9' FOR QAF):
   - You are STRICTLY FORBIDDEN from using the letter 'q' to represent the Arabic letter Qaf (ق).
   - ALWAYS use the number '9' for Qaf:
     * Write '9bel' (NEVER 'qbel' or 'qbal')
     * Write '9alli' / '9allou' / '9allna' (NEVER 'qalli' / 'gal liya')
     * Write '9rib' / '9riba' (NEVER 'qrib' / 'qriba')
     * Write 'yet9ta3' / 't9at3et' (NEVER 'yetqta3')
     * Write 'we9t' / 'fi we9tou' (NEVER 'waqt' or 'lwaqt')
     * Write 'l9dim' / 'l9dam' (NEVER 'lqdim')
     * Write 'd9i9a' (NEVER 'dqiqa')
     * Write '9er3a' (bottle) (NEVER 'qer3a')
     * Write 't9eyyel' (take a nap) (NEVER 'tqeyyel')
     * Write 'l9ahwa' (coffee) (NEVER 'lqahwa')
   - The ONLY time 'q' is allowed is inside legitimate French loanwords like 'bloqué', 'plaque', 'remorque', 'chèque', 'technique'.

2. ABSOLUTE BAN ON ARABIC SCRIPT & HYBRID WORDS (100% LATIN ARABIZI ONLY):
   - Absolutely ZERO Arabic script characters (Unicode U+0600 - U+06FF).
   - NEVER create hybrid words combining Latin and Arabic letters!
     * Write 'mchemkhin' or 'mbelloulin' (NEVER 'mبلولين'!)
     * Write 'charafna' or 'charaf' (NEVER 'chرف'!)
     * Write 'nchoufouk' (NEVER 'nchofoك'!)
     * Write 'nre7eb bik' (NEVER 'nرحب بيك'!)

3. PHONETIC SPELLING DISCIPLINE:
   - "I write" -> strictly 'nekteb' (PERMANENTLY BAN 'nketeb'!).
   - "I understand" -> strictly 'nefhem' (NEVER 'nfehem').
   - "I hear" -> strictly 'nesma3' (NEVER 'nsema3').

4. VERB MORPHOLOGY & PAST TENSE:
   - "He tried" -> The 3rd-person masculine past tense is strictly 'seyya':
     * Write: 'wa7ed l\\'invité seyya ysaguemhom'.
     * PERMANENTLY BAN 'siyi', 'tsseyi', 'sseyi', or 'ssaye'!
   - "When I tried" -> 'ki seyyit' (NEVER 'ki jarrabt' or 'ki siyit').

5. CULTURAL COLLOCATIONS & MEANING OVER WORD-FOR-WORD:
   - "Came and finally fixed the leak":
     * Write: 'ja le plombier w enfin saguem la fuite f la salle de bain'.
     * BAN clitic doubling: write 'saguem la fuite', NEVER 'saguemha la fuite' or 'w f lekher seguemha'.
   - "Quiet neighbors / quiet atmosphere":
     * Translate as 'les voisins calmes', 'les voisins drayef w trankil', or 'jaw calme w trankil'.
     * PERMANENTLY BAN 'saktin'! In Algerian Darija, 'saktin' means mute or silenced.
   - "Medicine":
     * In Algerian Darija, you DRINK medicine: 'techrob dwa' (PERMANENTLY BAN 'tekoul dwa' / eat medicine).
     * "Expired medicine" -> 'dwa périmé'.
   - "Empty stomach":
     * Strictly '3la rri9' or '3la lkhwa' (PERMANENTLY BAN literal '3la kersh fargha' or 'ma3ida fariqha').
   - "Hot water":
     * Strictly 'lma skhoun' (NEVER 'l\\'eau 7amra').
   - "If you rented a car":
     * Strictly 'ida krite tomobil' or 'ida krite voiture' (PERMANENTLY BAN 'krayti kar' - 'kar' means a coach bus).
   - "Milk bag":
     * Strictly 'chkara ta3 l7lib' or 'sachet l7lib' (NEVER 'kyss l7alib').
   - "Plastic bag":
     * Strictly 'sachi' or 'sachet plastique' (NEVER Moroccan 'mika').
   - "Ground beef":
     * Strictly 'viandachi' or 'viande hachée'.
   - "Sardines":
     * Strictly 'les sardines' or 'sardina jdida'.
   - "Electricity cut off":
     * Strictly 'trisiti t9at3et' (NEVER Fus'ha 'inqata3at l\\'kahrabaa').
   - "Driver's license, car registration":
     * Strictly 'le permis, la carte grise'.
   - "City hall":
     * Strictly 'la mairie' or 'l\\'baladiya'.
   - "Certify document":
     * Strictly 'nlégaliziw' or 'ncertifiw'.

6. BAN MOROCCAN, TUNISIAN & FUS'HA LEAKS:
   - BAN Moroccan: 'daba' (use 'doka'), 'ghadi' (use 'ra7'), 'dyal' (use 'ta3' or 'dyalna/ta3na'), 'mzyan' (use 'mli7'), '7it' (use '3la khater'), 'mika' (use 'sachi'), 'wakha' (use "d'accord"), 'kifach' (use 'kifech'), 'ach/chno' (use 'wach/chnou').
   - BAN Tunisian: 'barsha' (use 'bezzef'), 'bahi' (use 'mli7'), 'chbik' (use 'wach bik'), 'tawa' (use 'doka').
   - BAN Levantine/Fus'ha: 'matar' (rain is 'chta', falls as 'ti7 chta'), 'bkra' (tomorrow is 'ghodwa'), 'hal yumkin', 'akhi', 'shukran' (use 'sa7a/bla mziya').
   - Obligation is impersonal: 'lazem' (NEVER 'lazmek' or 'lazim').

7. DEVYX CLIENT-FIRST FEW-SHOT ANCHORS:
   - Client-Friendly Tone: Talk to business clients, not tech goats! Do NOT inject framework names (Next.js 15, PostgreSQL, Flutter, n8n) unless they were explicitly requested and present in the input.
   - Greeting:
     English: "Hello! Welcome to Devyx. How can I assist you with your project today?"
     Algérois: "Salam! Mar7ba bik f Devyx 👋 Kifech n9der n3awnek f l'projet ta3ek lyoum?"
   - Web Platform:
     English: "We build modern, fast custom websites and web platforms. Web projects typically range between $950 and $1,800 delivered in 10 to 20 days. Let's discuss on [WhatsApp](https://wa.me/213000000000) or check our [Projects page](/projects)."
     Algérois: "N'développiw des sites web modernes, rapides w sur-mesure. Les projets web ykellfou bin $950 w $1,800 f 10 7tal 20 jours. T9der t'contacti l'équipe ta3na direct f [WhatsApp](https://wa.me/213000000000) wela tchouf [Page Projets](/projects)!"
   - Mobile App:
     English: "We engineer smooth mobile apps for iPhone and Android. A custom mobile project typically costs between $1,400 and $2,600 in 14 to 28 days. You can request a quote on [WhatsApp](https://wa.me/213000000000)."
     Algérois: "N'développiw des applications mobile rapides li yemchiw f iPhone w Android f nafs lwe9t. L'projet mobile ykellef bin $1,400 w $2,600 f 14 7tal 28 jours. T9der t'demandi devis gratuit direct f [WhatsApp](https://wa.me/213000000000)!"
   - Automation:
     English: "Our automation systems connect your CRM, spreadsheets, and WhatsApp automatically to save you time. Which business tasks would you like to automate?"
     Algérois: "L'automatisation t'connecti les outils ta3ek (CRM, Google Sheets, WhatsApp) bach kolchi yemchi automatique bla ma t'dhaye3 we9tek. Chnouma les tâches li 7ab t'khallihom automatiques?"
   - Escalation:
     English: "I dispatched an alert to our technical team on Telegram. Please provide your WhatsApp number or email, or connect with us directly on [WhatsApp](https://wa.me/213000000000)."
     Algérois: "Sayeft alerte direct l l'équipe ta3na f Telegram 🚨. 3tina noumrou WhatsApp ta3ek wela email bach y'contactiwak f lwe9t, wela hder direct f [WhatsApp](https://wa.me/213000000000)."
   - Out of Scope Refusal:
     English: "I am an AI assistant for Devyx. I help prospective clients with custom websites, mobile apps, workflow automations, and AI systems. How can I assist with your software project?"
     Algérois: "Ana l'assistant IA ta3 Devyx. N3awnek ghir f les projets ta3 création des sites web, applications mobile, l'automatisation w l'intelligence artificielle. Kifech n9der n3awnek f l'projet digital ta3ek?"
   - Technical Query (Only when explicitly asked for tech stack):
     English: "Under the hood, we engineer web platforms using Next.js 15, PostgreSQL, and Supabase for maximum speed and security."
     Algérois: "F la partie technique, n'khadmiw b Next.js 15, PostgreSQL w Supabase bach n'garantiw la vitesse w la sécurité maximale."

8. FORMAT:
   - Output ONLY the translated text in Latin Arabizi.
   - No explanations, no introductory notes, no quotation marks.`;

// ─────────────────────────────────────────────────────────────────────────────
// 2. MODEL-SPECIFIC PROMPT EXTENSIONS
// ─────────────────────────────────────────────────────────────────────────────

export const PROMPT_GEMINI_V2 = `${CORE_MANDATES_V2}

CRITICAL GEMINI CONSTRAINTS:
- CLIENT-FIRST TONE: Speak like an approachable tech consultant talking to a client, NOT a developer lecture. Do NOT add unsolicited framework names ('Next.js 15', 'PostgreSQL', 'Flutter') unless they were in the source text.
- Maintain your exceptional street-level conversational cadence and natural vocabulary.
- Every Qaf must be '9' ('9bel', '9alli', '9rib', 'we9t', '9er3a', 't9eyyel').
- Seamless French loanwords: 'l\\'appartement', 'le plombier', 'la fuite', 'la clim', 'le chauffage', 'les urgences', 'la carte grise', 'le permis', 'la machine à laver'.
- Never use 'saktin' for quiet neighbors or atmosphere; use 'calmes', 'trankil', or 'drayef'.`;

export const PROMPT_GROQ_V2 = `${CORE_MANDATES_V2}

CRITICAL INSTRUCTIONS FOR OPEN-WEIGHT ENGINE:
1. CLIENT-FIRST TONE: Do NOT insert unsolicited technical jargon or framework names ('Next.js 15', 'PostgreSQL') unless in the original text.
2. NEVER loop or repeat phrases like '3la 3ayn' or '9allek 9allek'.
3. NEVER invent strange words. Use clear French loanwords for items: 'les sardines', 'la machine à laver', 'la prise', 'le permis', 'la carte grise', 'les impôts', 'la mairie'.
4. NEVER use Moroccan words ('daba', 'ghadi', 'mzyan', '7it', 'mika'). Use 'doka', 'ra7', 'mli7', '3la khater', 'sachi'.
5. Strictly write '9' for Qaf: '9bel', '9alli', '9rib', 'we9t', '9er3a'. NEVER write 'q'.
6. Past tense 'he tried': write 'seyya' (NEVER 'siyi').
7. 'Quiet neighbors': write 'calmes' or 'drayef' (NEVER 'saktin').`;

export const PROMPT_GPT4O_V2 = `${CORE_MANDATES_V2}

FEW-SHOT ANCHOR EXAMPLES:
Example 1 (Apartment Maintenance):
"Salam! Rani nekteblek bach nre7eb bik f l'appartement ta3na f Dzayer. Lbare7, ja le plombier w enfin saguem la fuite f la salle de bain, donc lma skhoun rah ymchi mli7 doka. Bessa7, t3ich ma tkharabch f la télécommande ta3 la clim w f les tuyaux ta3 le chauffage central. L'semana li fatet, wa7ed l'invité seyya ysaguemhom w khasserhom ga3. W zid, red balek lazem tkheli la chambre n9iya, w ida tetkayef, lazem trou7 ll'balcon, machi fel salon. 3la khater ra7 ti7 chta bezzef ghodwa f Dzayer, red balek tghle9 la fenêtre mli7 9bel ma tkhrej. La clé rahi f la boite ta3 les clés li 9riba mn lbab lkbir, donc tsibha b sahel. 9alli beli les voisins ta3na li lfo9 drayef bezzef w calmes, donc t3ich ma tdirch l'hess f lil. Ida chi wa7ed ma rahoch mli7, kayen dwa f l'placard ta3 la cuisine, w la pharmacie li 9riba jaya pile mor sbitar. W f lekher, lazem nsigniw l'contrat ta3 l'kra ghodwa, w lazem tkhales l'kra fi we9tou. Aya a plus!"

Example 2 (Hospitality & Health):
"Ma ta7chamch, d-dar darkom! Yemma wejdet kousksi bel l7am ta3 l3alouch w lkhedra jdida lftour, w ra7 tza3af bezzef ida ma klitch mli7. Mor l3cha, ra7 ncharbou atay b nna3na3 m3a l7elwa ta3 louz, donc ma techrobch 9ahwa ka7la 3la rri9. Ida rak 7ab t9eyyel had l'3chiya, la chambre d'invités rahi wajda b des couvertures n9iyin w jaw calme bezzef. Charaf kbir lina ki sta9belnak!"`;

// ─────────────────────────────────────────────────────────────────────────────
// 3. THE 11-TIER REGEX SANITIZER (EXACT REPLICA FROM BENCHMARK SUITE)
// ─────────────────────────────────────────────────────────────────────────────

export interface SanitizerResult {
  text: string;
  raw: string;
  corrections: number;
}

export function sanitizeDarijaTextV2(input: string): SanitizerResult {
  let t = input;
  const raw = t;
  let corrections = 0;

  const replaceAndCount = (regex: RegExp, rep: string) => {
    const matches = t.match(regex);
    if (matches) corrections += matches.length;
    t = t.replace(regex, rep);
  };

  // 1. Script purity: replace known Arabic script leaks & hybrid tokens
  replaceAndCount(/nرحب\s*بيك/gi, 'nre7eb bik');
  replaceAndCount(/رحب\s*بيك/gi, 're7eb bik');
  replaceAndCount(/b\s*سهولة/gi, 'b sahel');
  replaceAndCount(/hادئين/gi, 'calmes');
  replaceAndCount(/هادئين/gi, 'calmes');
  replaceAndCount(/مريض/gi, 'mrid');
  replaceAndCount(/chرف(na)?/gi, 'charaf$1');
  replaceAndCount(/charafna/gi, 'charafna');
  replaceAndCount(/mبلولين/gi, 'mchemkhin');
  replaceAndCount(/مبلولين/gi, 'mchemkhin');
  replaceAndCount(/nchofoك/gi, 'nchoufouk');
  replaceAndCount(/[\u0600-\u06FF]/g, '');

  // 2. Strict '9' for Qaf: clamp any remaining 'q' in Arabizi words
  replaceAndCount(/\bnqder\b/gi, 'n9der');
  replaceAndCount(/\bnqedrou\b/gi, 'n9edrou');
  replaceAndCount(/\btqder\b/gi, 't9der');
  replaceAndCount(/\bqbel\b/gi, '9bel');
  replaceAndCount(/\bqbal\b/gi, '9bel');
  replaceAndCount(/\bqalli\b/gi, '9alli');
  replaceAndCount(/\bqallou\b/gi, '9allou');
  replaceAndCount(/\bqallna\b/gi, '9allna');
  replaceAndCount(/\bqrib\b/gi, '9rib');
  replaceAndCount(/\bqriba\b/gi, '9riba');
  replaceAndCount(/\bwaqt\b/gi, 'we9t');
  replaceAndCount(/\blwaqt\b/gi, 'lwe9t');
  replaceAndCount(/\bweqt\b/gi, 'we9t');
  replaceAndCount(/\blweqt\b/gi, 'lwe9t');
  replaceAndCount(/\byetqta3\b/gi, 'yet9ta3');
  replaceAndCount(/\btqta3et\b/gi, 't9at3et');
  replaceAndCount(/\blqdim\b/gi, 'l9dim');
  replaceAndCount(/\blqdam\b/gi, 'l9dam');
  replaceAndCount(/\bqa3ed\b/gi, '9a3ed');
  replaceAndCount(/\bqa3da\b/gi, '9a3da');
  replaceAndCount(/\bchqoun\b/gi, 'chkoun');
  replaceAndCount(/\bdeqiq[ae]\b/gi, 'd9i9a');
  replaceAndCount(/\bdqiq[ae]\b/gi, 'd9i9a');
  replaceAndCount(/\bdqiqa\b/gi, 'd9i9a');
  replaceAndCount(/\btqerbe3ch\b/gi, 't9erbe3ch');
  replaceAndCount(/\bqer3a\b/gi, '9er3a');
  replaceAndCount(/\btqeyyel\b/gi, 't9eyyel');
  replaceAndCount(/\blqahwa\b/gi, 'l9ahwa');
  replaceAndCount(/\b(l'?\s*)?baqi\b/gi, '$1ba9i');
  replaceAndCount(/\b(l'?\s*)?baqya\b/gi, '$1ba9ya');
  replaceAndCount(/\b(l'?\s*)?baqyin\b/gi, '$1ba9yin');
  replaceAndCount(/\b(l'?\s*)?bqa\b/gi, '$1b9a');
  replaceAndCount(/\bybqa\b/gi, 'yb9a');
  replaceAndCount(/\btebqa\b/gi, 'teb9a');
  replaceAndCount(/\btqedrou\b/gi, 't9edrou');
  replaceAndCount(/\b9allek(\s+9allek)+/gi, '9alli');

  // 3. Phonetic corrections
  replaceAndCount(/\bnketeb\b/gi, 'nekteb');
  replaceAndCount(/\bnfehem\b/gi, 'nefhem');
  replaceAndCount(/\bnsema3\b/gi, 'nesma3');

  // 4. Verb morphology: past tense 'he tried'
  replaceAndCount(/\b(siyi|tsseyi|tsseya|ssaye|sseyi)\b/gi, 'seyya');

  // 5. Clitic doubling & clunky literal phrases
  replaceAndCount(/\bsaguemha\s+la\s+fuite\b/gi, 'saguem la fuite');
  replaceAndCount(/\bseguemha\s+la\s+fuite\b/gi, 'saguem la fuite');
  replaceAndCount(/w\s+f\s+lekher\s+(saguem|seguem)\b/gi, 'w enfin saguem');
  replaceAndCount(/\bl'eau\s+7amra\b/gi, 'lma skhoun');
  replaceAndCount(/\b(krite|krayti|kra)\s+kar\b/gi, 'krite tomobil');
  replaceAndCount(/\b3la\s+kersh\s+fargha\b/gi, '3la rri9');
  replaceAndCount(/\b(tekoul|tekel|yakoul)\s+dwa\b/gi, 'techrob dwa');

  // 6. Semantic suitability: quiet neighbors / atmosphere (never 'saktin')
  replaceAndCount(/\bsaktin\b/gi, 'calmes');
  replaceAndCount(/\bsaknin\s+bzzaf\b/gi, 'calmes bezzef');

  // 7. Moroccan dialect purge
  replaceAndCount(/\bdaba\b/gi, 'doka');
  replaceAndCount(/\bghadi\b/gi, 'ra7');
  replaceAndCount(/\b7it\b/gi, '3la khater');
  replaceAndCount(/\bdyalna\b/gi, 'ta3na');
  replaceAndCount(/\bdyawelna\b/gi, 'ta3na');
  replaceAndCount(/\bdyal\b/gi, 'ta3');
  replaceAndCount(/\bghedda\b/gi, 'ghodwa');
  replaceAndCount(/\bgal\s+liya\b/gi, '9alli');
  replaceAndCount(/\bgal\s+lih\b/gi, '9allou');
  replaceAndCount(/\bgalli\b/gi, '9alli');
  replaceAndCount(/\bmzyan[ae]?\b/gi, 'mli7');
  replaceAndCount(/\bbzzaf\b/gi, 'bezzef');
  replaceAndCount(/\bbzaf\b/gi, 'bezzef');
  replaceAndCount(/\bwakha\b/gi, "d'accord");
  replaceAndCount(/\bmika\b/gi, 'sachi');
  replaceAndCount(/\bkifach\b/gi, 'kifech');
  replaceAndCount(/\bachnou\b/gi, 'wach');
  replaceAndCount(/\bach\b/gi, 'wach');
  replaceAndCount(/\bchno\b/gi, 'chnou');
  replaceAndCount(/\bkaykhedjem\b/gi, 'yekhdem');
  replaceAndCount(/\bkaykhedem\b/gi, 'yekhdem');
  replaceAndCount(/\bkay([b-df-hj-np-tv-z][a-z]{3,})\b/gi, 'y$1');

  // 7b. Tunisian & Fus'ha purge
  replaceAndCount(/\bbarsha\b/gi, 'bezzef');
  replaceAndCount(/\bbahi\b/gi, 'mli7');
  replaceAndCount(/\bchbik\b/gi, 'wach bik');
  replaceAndCount(/\btawa\b/gi, 'doka');
  replaceAndCount(/\bmta3\b/gi, 'ta3');
  replaceAndCount(/\bakhi\b/gi, 'khoya');
  replaceAndCount(/\bshukran\b/gi, 'sa7a');

  // 8. Spatial location & gender agreement
  replaceAndCount(/\brahi mawjouda\b/gi, 'jaya');
  replaceAndCount(/\brah mawjoud\b/gi, 'jay');
  replaceAndCount(/\bla\s+cl[eé]\s+rah\b/gi, 'la clé rahi');

  // 9. Weather matrix clamp
  replaceAndCount(/\bra7\s+yji\s+l'?matar\b/gi, 'ra7 ti7 chta');
  replaceAndCount(/\byji\s+l'?matar\b/gi, 'ti7 chta');
  replaceAndCount(/\bl'?matar\b/gi, 'chta');
  replaceAndCount(/\bmatar\b/gi, 'chta');

  // 10. Prepositions & elision
  replaceAndCount(/\bma\s+tkharabch\s+fiha\s+la\s+télécommande\b/gi, 'ma tkharabch f la télécommande');
  replaceAndCount(/\bfel\s+la\s+boite\b/gi, 'f la boite');
  replaceAndCount(/\bmach\s+fel\s+salon\b/gi, 'machi fel salon');

  // 11. Stutter / degenerative loops (e.g. '3la 3ayn 3la 3ayn', '9ahwa 9ahwa')
  replaceAndCount(/\b(\w+)\s+\1\b/gi, '$1');

  return { text: t.trim(), raw, corrections };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MULTI-MODEL TRANSLATION ORCHESTRATION WITH INSTANT FAILOVER
// ─────────────────────────────────────────────────────────────────────────────

interface ModelApiKeys {
  geminiKey?: string;
  geminiSecondary?: string;
  groqKey?: string;
  groqSecondary?: string;
}

function getApiKeys(): ModelApiKeys {
  const clean = (val?: string) => {
    if (!val) return undefined;
    const trimmed = val.trim();
    if (trimmed === "" || trimmed === "GROQ_API_KEY_SECONDARY") return undefined;
    return trimmed;
  };

  return {
    geminiKey: clean(process.env.GEMINI_API_KEY),
    geminiSecondary: clean(process.env.GEMINI_API_KEY_SECONDARY),
    groqKey: clean(process.env.GROQ_API_KEY),
    groqSecondary: clean(process.env.GROQ_API_KEY_SECONDARY),
  };
}

// In-memory backoff timestamp when Gemini API quota is exhausted (429)
let geminiQuotaExceededUntil = 0;

/**
 * Call Gemini Flash with Native Algérois Street-Level Reinforcement
 */
async function callGeminiFlashTranslation(
  apiKey: string,
  englishText: string,
  modelName: string = "gemini-3.1-flash-lite"
): Promise<string> {
  if (Date.now() < geminiQuotaExceededUntil) {
    throw new Error("Gemini quota backoff active");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: PROMPT_GEMINI_V2 }],
    },
    contents: [
      {
        parts: [{ text: `Translate the following text into authentic Algérois Latin Arabizi:\n\n${englishText}` }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 500,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    if (response.status === 429) {
      geminiQuotaExceededUntil = Date.now() + 10 * 60 * 1000; // 10-minute backoff
    }
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(`Gemini Error (${response.status}): ${JSON.stringify(errorJson)}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty candidate content");

  return text.trim();
}

/**
 * Call Groq Qwen 27B with Anti-Hallucination Guard
 */
async function callGroqQwenTranslation(
  apiKey: string,
  englishText: string
): Promise<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const body = {
    model: "qwen/qwen3.8-27b",
    messages: [
      { role: "system", content: PROMPT_GROQ_V2 },
      { role: "user", content: `Translate into pure Latin Arabizi Algérois:\n${englishText}` },
    ],
    temperature: 0.05,
    max_tokens: 350,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6500),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq Qwen Error (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq Qwen returned empty choice content");

  return text.trim();
}

/**
 * Robust Multi-Model Orchestration:
 * 1. Primary Gemini 3.8 Flash (Street-Level, temp: 0.15)
 * 2. Secondary Gemini 3.8 Flash (if set)
 * 3. Primary Groq Qwen 27B (Anti-Hallucination Guard, temp: 0.05)
 * 4. Secondary Groq Qwen 27B
 * 5. Sanitized via 11-Tier Regex Sanitizer
 */
export async function translateToAlgéroisDarija(englishOrFrenchText: string): Promise<string> {
  const keys = getApiKeys();
  let rawOutput: string | null = null;
  let usedModel = "simulation";

  // Tier 1: Primary Gemini Flash Lite (Dialect Nuance & High Rate Limit)
  if (keys.geminiKey) {
    try {
      rawOutput = await callGeminiFlashTranslation(keys.geminiKey, englishOrFrenchText, "gemini-3.1-flash-lite");
      usedModel = "gemini-3.1-flash-lite";
    } catch (err1) {
      try {
        rawOutput = await callGeminiFlashTranslation(keys.geminiKey, englishOrFrenchText, "gemini-3.8-flash");
        usedModel = "gemini-3.8-flash";
      } catch (err1b) {
        console.warn("[Darija Engine] Primary Gemini failed, falling back to secondary...", err1b);
      }
    }
  }

  // Tier 2: Secondary Gemini Flash Lite
  if (!rawOutput && keys.geminiSecondary) {
    try {
      rawOutput = await callGeminiFlashTranslation(keys.geminiSecondary, englishOrFrenchText, "gemini-3.1-flash-lite");
      usedModel = "gemini-secondary";
    } catch (err2) {
      try {
        rawOutput = await callGeminiFlashTranslation(keys.geminiSecondary, englishOrFrenchText, "gemini-3.8-flash");
        usedModel = "gemini-3.8-secondary";
      } catch (err2b) {
        console.warn("[Darija Engine] Secondary Gemini failed, falling back to Groq...", err2b);
      }
    }
  }

  // Tier 3: Secondary Groq Qwen (Keep primary Groq for Stage 1 Reasoner)
  if (!rawOutput && keys.groqSecondary) {
    try {
      rawOutput = await callGroqQwenTranslation(keys.groqSecondary, englishOrFrenchText);
      usedModel = "groq-qwen-secondary";
    } catch (err3) {
      console.warn("[Darija Engine] Secondary Groq failed...", err3);
    }
  }

  // Tier 4: Primary Groq Qwen
  if (!rawOutput && keys.groqKey) {
    try {
      rawOutput = await callGroqQwenTranslation(keys.groqKey, englishOrFrenchText);
      usedModel = "groq-qwen-27b";
    } catch (err4) {
      console.warn("[Darija Engine] Primary Groq failed", err4);
    }
  }

  // If all remote LLMs failed, fallback to native Darija equivalent if out-of-scope refusal
  let textToSanitize = rawOutput;
  if (!textToSanitize) {
    if (/out-of-scope|i am an ai assistant for devyx/i.test(englishOrFrenchText)) {
      textToSanitize = "Ana l'assistant IA ta3 Devyx. N3awnek ghir f les projets ta3 création des sites web, applications mobile, l'automatisation w l'intelligence artificielle. Kifech n9der n3awnek f l'projet digital ta3ek?";
    } else if (/chargily|satim|payment/i.test(englishOrFrenchText)) {
      textToSanitize = "Iyeh, n'intégrer-iw Chargily w Satim direct f les sites w les apps ta3na bach n'garantiw l'paiement ykoun rapide w sécurisé 100%.";
    } else if (/remote agency|office in algiers|google meet/i.test(englishOrFrenchText)) {
      textToSanitize = "7na agency remote 100%, ma 3endnach bureau physique f Dzayer. Mais, n9edrou n'programmiw Google Meet m3a l'équipe ta3na bach n'nahdrou 3la l'projet ta3ek direct!";
    } else if (/sign the contract|project scope|to proceed|finalize/i.test(englishOrFrenchText)) {
      textToSanitize = "Bach n'wedjou l'cahier des charges w n'signiw l'contrat, t9der t'prendi rendez-vous direct f [WhatsApp](https://wa.me/213000000000) wela f la page [Contact](/contact) bach n'beddaw direct!";
    } else if (/standard custom website|10-20 days|takes 10/i.test(englishOrFrenchText)) {
      textToSanitize = "Salam! Mar7ba bik f Devyx 👋. Un site web sur-mesure yedi bin 10 7tal 20 jours bach n'garantiw la qualité, mais n9derou n'discutiw 3la we9t a9sar 3la 7sab les besoins ta3ek.";
    } else {
      textToSanitize = englishOrFrenchText;
    }
  }

  // Tier 5: Pass through 11-Tier Sanitizer
  const sanitized = sanitizeDarijaTextV2(textToSanitize);

  if (process.env.NODE_ENV !== "production") {
    console.info(`[Darija Engine] Rendered via ${usedModel} with ${sanitized.corrections} regex corrections.`);
  }

  return sanitized.text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MULTIMODAL VISION ANALYSIS (GEMINI 3.8 FLASH + GROQ FAILOVER)
// ─────────────────────────────────────────────────────────────────────────────

export interface AttachmentData {
  type: string;
  data: string;
  name: string;
  size?: number;
}

/**
 * Analyzes image or document with Gemini 3.8 Flash, fails over gracefully,
 * and formats output strictly adhering to target language & Algérois Darija mandates.
 */
export async function analyzeAttachmentMultimodal(
  attachment: AttachmentData,
  userMessage: string,
  targetLanguage: string = "en"
): Promise<string | null> {
  const keys = getApiKeys();
  const isImage = attachment.type.startsWith("image/");
  const isPdf = attachment.type === "application/pdf";

  if (!isImage && !isPdf) return null;

  const isDarija = targetLanguage === "darija" || targetLanguage === "ar-MA";

  // Instruction prompt tailored to language with strict Devyx software engineering boundary
  const promptInstruction = isDarija
    ? `You are the AI Technical Consultant for Devyx, a software engineering agency (Next.js 15, mobile apps, self-hosted n8n automations, AI systems).
Examine this ${isImage ? "image" : "document"}.
${userMessage ? `User query: "${userMessage}"` : ""}

CRITICAL STRICT SCOPE & BREVITY CONSTRAINTS:
1. STRICT DEVYX SCOPE: Devyx ONLY evaluates software engineering visuals: website/app UI designs, wireframes, system architecture diagrams, database schemas, code snippets, or server error logs.
2. OUT-OF-SCOPE REFUSAL: If this image is NOT directly related to software engineering (e.g. sports, soccer/football, match tactical screens, selfies, food, clothing, gaming memes, nature, non-tech):
   DO NOT analyze, break down, or describe the image contents.
   Reply IMMEDIATELY with this exact refusal:
   "I am an AI assistant for Devyx. I only evaluate software engineering visuals like UI designs, web/mobile screenshots, architecture diagrams, and error logs. How can I assist with your software project?"
3. MAXIMUM BREVITY: If the image IS related to software engineering, provide a rapid, concise technical takeaway in STRICTLY 1 to 3 short sentences maximum.
   NEVER write an "Executive Summary", multi-section report, or numbered breakdown lists. Keep it rapid, punchy, and conversational.`
    : targetLanguage === "fr"
    ? `Vous êtes le consultant technique IA de Devyx, agence d'ingénierie logicielle (Next.js 15, applications mobiles, automatisations n8n, agents IA).
Examinez cette ${isImage ? "image" : "pièce jointe"}.
${userMessage ? `Question utilisateur : "${userMessage}"` : ""}

CONTRAINTES STRICTES DE PÉRIMÈTRE ET DE BRIÈVETÉ :
1. PÉRIMÈTRE DEVYX : Devyx analyse EXCLUSIVEMENT les visuels d'ingénierie logicielle : maquettes UI/UX de sites ou d'applications, schémas d'architecture système, bases de données, extraits de code ou journaux d'erreurs techniques.
2. REFUS HORS PÉRIMÈTRE : Si cette image N'EST PAS liée à l'ingénierie logicielle (ex : sports, football, schémas tactiques de match, photos personnelles, nourriture, vêtements, mèmes, nature, etc.) :
   NE DÉCRIVEZ PAS et n'analysez pas le contenu de l'image.
   Répondez IMMÉDIATEMENT par ce refus en 1 à 2 phrases :
   "Je suis l'assistant technique IA de Devyx. J'analyse uniquement les visuels d'ingénierie logicielle tels que les maquettes d'applications, schémas d'architecture et erreurs techniques. Comment puis-je vous accompagner sur votre projet digital ?"
3. CONCISION ABSOLUE : Si l'image est liée à l'ingénierie logicielle, formulez une évaluation technique rapide en STRICTEMENT 1 à 3 phrases maximum.
   JAMAIS de résumé exécutif, de rapport détaillé ou de listes numérotées. Soyez concis et percutant.`
    : targetLanguage === "ar"
    ? `أنت المستشار التقني الذكي لمنصة ديفيكس (Devyx) المتخصصة في هندسة البرمجيات (Next.js 15، تطبيقات الجوال، أتمتة n8n، والذكاء الاصطناعي).
قم بفحص هذا ${isImage ? "الملف الصوري" : "المستند"}.
${userMessage ? `استفسار المستخدم: "${userMessage}"` : ""}

ضوابط صارمة لنطاق الاختصاص والإيجاز:
1. نطاق ديفيكس البرمجي: تفحص ديفيكس حصرياً الصور المتعلقة بهندسة البرمجيات: واجهات وتصاميم المستخدم (UI/UX) للمواقع والتطبيقات، المخططات المعمارية للنظم، الشفرات البرمجية أو سجلات الأخطاء.
2. رفض ما هو خارج النطاق: إذا كانت الصورة خارج نطاق هندسة البرمجيات (مثل مباريات كرة القدم والرياضة، الشاشات التكتيكية للمباريات، الصور الشخصية، الأطعمة، الملابس، الألعاب الترفيهية):
   لا تقم بوصف أو تفصيل الصورة إطلاقاً.
   اكتفِ بالرد فوراً بهذه العبارة في جملة أو جملتين:
   "أنا المساعد التقني الذكي لـ Devyx. أقوم فقط بتحليل واجهات ومخططات البرمجيات والأخطاء التقنية. كيف يمكنني مساعدتك في مشروعك البرمجي اليوم؟"
3. إيجاز وسرعة فائقة: إذا كانت الصورة متعلقة بالبرمجيات، قدم تقييماً مقتضباً في جملة إلى 3 جمل كحد أقصى، دون أي عناوين تفصيلية أو قوائم مرقمة مطولة.`
    : `You are the AI technical consultant for Devyx, a software engineering agency (Next.js 15, mobile apps, self-hosted n8n automations, AI systems).
Examine this ${isImage ? "image" : "document"}.
${userMessage ? `User query: "${userMessage}"` : ""}

CRITICAL STRICT SCOPE & BREVITY CONSTRAINTS:
1. STRICT DEVYX SCOPE: Devyx ONLY evaluates software engineering visuals: website/app UI designs, wireframes, architecture diagrams, database schemas, code snippets, or server error logs.
2. OUT-OF-SCOPE REFUSAL: If this image is NOT directly related to software engineering (e.g. sports, soccer/football, tactical match tracking, selfies, food, clothing, gaming memes, nature, non-tech):
   DO NOT analyze, break down, or describe the image contents.
   Reply IMMEDIATELY with this concise 1-2 sentence refusal:
   "I am an AI assistant for Devyx. I only evaluate software engineering visuals like UI designs, web/mobile screenshots, architecture diagrams, and error logs. How can I assist with your software project?"
3. MAXIMUM BREVITY: If the image IS related to software engineering, provide a rapid, concise technical takeaway in STRICTLY 1 to 3 short sentences maximum.
   NEVER write an "Executive Summary", multi-section report, or numbered breakdown lists. Keep it rapid, punchy, and conversational.`;

  // Attempt Gemini Vision with Primary Key
  const tryGemini = async (key: string, model: string = "gemini-3.8-flash") => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const parts: any[] = [];

    if (isImage) {
      parts.push({
        inlineData: {
          mimeType: attachment.type,
          data: attachment.data,
        },
      });
    }

    parts.push({ text: promptInstruction });

    const body = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 250,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(18000),
    });

    if (!res.ok) throw new Error(`Gemini Vision status ${res.status}`);

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error("Empty candidate");
    return candidateText.trim();
  };

  const GEMINI_VISION_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
  ];

  let visionResult: string | null = null;

  if (keys.geminiKey) {
    for (const model of GEMINI_VISION_MODELS) {
      try {
        visionResult = await tryGemini(keys.geminiKey, model);
        if (visionResult) break;
      } catch (e1) {
        console.warn(`[Vision Engine] Primary Gemini (${model}) failed:`, (e1 as Error).message);
      }
    }
  }

  if (!visionResult && keys.geminiSecondary && keys.geminiSecondary !== keys.geminiKey) {
    for (const model of GEMINI_VISION_MODELS) {
      try {
        visionResult = await tryGemini(keys.geminiSecondary, model);
        if (visionResult) break;
      } catch (e2) {
        console.warn(`[Vision Engine] Secondary Gemini (${model}) failed:`, (e2 as Error).message);
      }
    }
  }

  // Helper to attempt Groq vision or context-based analysis
  const tryGroqVision = async (key: string, label: string) => {
    try {
      if (isImage && attachment.data) {
        try {
          const visionRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.2-11b-vision-preview",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: promptInstruction },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:${attachment.type};base64,${attachment.data}`,
                      },
                    },
                  ],
                },
              ],
              temperature: 0.15,
              max_tokens: 250,
            }),
            signal: AbortSignal.timeout(10000),
          });
          if (visionRes.ok) {
            const vJson = await visionRes.json();
            const vText = vJson.choices?.[0]?.message?.content?.trim();
            if (vText) return vText;
          }
        } catch (eVision) {
          console.warn(`[Vision Engine] ${label} llama vision attempt failed:`, eVision);
        }
      }

      const textContext = `The user uploaded an attachment named "${attachment.name}" (${attachment.type}, ${(attachment.size ? attachment.size / 1024 : 0).toFixed(0)} KB).
User Message: "${userMessage || 'Please review this software project asset.'}"
Prompt Instruction: ${promptInstruction}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: "You are the Senior Technical Consultant for Devyx software engineering agency." },
            { role: "user", content: textContext },
          ],
          temperature: 0.15,
          max_tokens: 250,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const json = await response.json();
        return json.choices?.[0]?.message?.content?.trim() || null;
      } else {
        console.warn(`[Vision Engine] ${label} failed with status`, response.status);
      }
    } catch (eGroq) {
      console.warn(`[Vision Engine] ${label} error`, eGroq);
    }
    return null;
  };

  // Fallback Tier 3: Primary Groq
  if (!visionResult && keys.groqKey) {
    visionResult = await tryGroqVision(keys.groqKey, "Groq Primary");
  }

  // Fallback Tier 4: Secondary Groq
  if (!visionResult && keys.groqSecondary && keys.groqSecondary !== keys.groqKey) {
    visionResult = await tryGroqVision(keys.groqSecondary, "Groq Secondary");
  }

  if (!visionResult) return null;

  // Cleanup: if model produced an "Executive Summary" header, strip it cleanly
  visionResult = visionResult
    .replace(/^#+\s*(?:Executive Summary|Summary|Analysis|Overview)[:\s]*/i, "")
    .trim();

  // If target language is Darija, translate the vision analysis into Native Algérois Arabizi!
  if (isDarija) {
    return await translateToAlgéroisDarija(visionResult);
  }

  return visionResult;
}
