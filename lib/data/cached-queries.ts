import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/server";
import type {
  Database,
  LocalizedString,
  MetadataItem,
  PrimaryCtaAction,
  ProjectCategory,
  ServiceCategory,
  SocialPlatform,
} from "@/types/database.types";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];
type ServiceItem = Database["public"]["Tables"]["services"]["Row"];
type ProjectItem = Database["public"]["Tables"]["projects"]["Row"];
type SocialLinkItem = Database["public"]["Tables"]["social_links"]["Row"];

// ==============================================================================
// Fallback Seed Data (Used when Supabase is offline or during initial build)
// ==============================================================================

const fallbackSiteSettings: SiteSettings = {
  id: 1,
  brand_name: "Devyx",
  enable_contact_form: true,
  chatbot_enabled: true,
  primary_cta_action: "open_chat",
  contact_email: "contact@devyx.com",
  seo_title: {
    en: "Devyx — High-Performance Web & Workflow Automation Agency",
    fr: "Devyx — Agence de Développement Web & Automatisation des Workflows",
    ar: "ديفيكس — وكالة تطوير الويب المتقدم وأتمتة مسارات العمل",
  },
  seo_description: {
    en: "Devyx engineers mission-critical web applications, cross-platform mobile systems, and autonomous n8n automation pipelines.",
    fr: "Devyx conçoit des applications web critiques, des systèmes mobiles multiplateformes et des pipelines d'automatisation n8n autonomes.",
    ar: "تبني ديفيكس تطبيقات ويب فائقة السرعة وأنظمة هواتف ذكية ومسارات أتمتة n8n مستقلة للشركات الرائدة.",
  },
  updated_at: new Date().toISOString(),
};

const fallbackSections: Record<string, PageSection> = {
  home_hero: {
    section_key: "home_hero",
    badge_text: {
      en: "SYS_ONLINE // DETERMINISTIC ARCHITECTURE",
      fr: "SYS_EN_LIGNE // ARCHITECTURE DÉTERMINISTE",
      ar: "النظام_نشط // بنية هندسية دقيقة",
    },
    headline: {
      en: "Architecting Scalable Web Systems & Autonomous Workflows",
      fr: "Architecture de Systèmes Web Évolutifs & Workflows Autonomes",
      ar: "بناء أنظمة الويب القابلة للتوسع ومسارات العمل المؤتمتة",
    },
    subheadline: {
      en: "We build deterministic web platforms, cross-platform mobile apps, and self-hosted n8n automation pipelines engineered for zero downtime and maximum operational velocity.",
      fr: "Nous concevons des plateformes web déterministes, des applications mobiles et des pipelines n8n conçus pour zéro temps d'arrêt et une vélocité maximale.",
      ar: "نطور منصات ويب قوية وتطبيقات هواتف ذكية ومسارات أتمتة n8n مصممة لأقصى سرعة تشغيلية وبدون توقف.",
    },
    body_text: {},
    primary_cta_label: {
      en: "Initialize Consultation",
      fr: "Lancer une Consultation",
      ar: "ابدأ استشارتك الآن",
    },
    secondary_cta_label: {
      en: "Explore System Blueprints",
      fr: "Explorer les Projets",
      ar: "استعرض سابقة المشاريع",
    },
    metadata_items: [
      { label: "GLOBAL_UPTIME", value: "99.98%" },
      { label: "WORKFLOW_CAPACITY", value: "50K+ / day" },
      { label: "AVG_LCP_LATENCY", value: "<0.8s" },
    ],
    updated_at: new Date().toISOString(),
  },
  home_why_us: {
    section_key: "home_why_us",
    badge_text: {
      en: "ENGINEERING PRINCIPLES",
      fr: "PRINCIPES D'INGÉNIERIE",
      ar: "مبادئنا الهندسية",
    },
    headline: {
      en: "Engineered for Deterministic Reliability & Velocity",
      fr: "Conçu pour une Fiabilité Déterministe & une Vélocité Maximale",
      ar: "بنية هندسية مصممة للدقة والموثوقية والسرعة الفائقة",
    },
    subheadline: {
      en: "We reject brittle SaaS templates and generic AI boilerplate. Every system is custom-crafted to run with predictable performance, bulletproof security, and full client data ownership.",
      fr: "Nous rejetons les modèles SaaS fragiles. Chaque système est conçu sur mesure avec des performances prévisibles et une sécurité absolue.",
      ar: "نرفض القوالب البرمجية الهشة والحلول الجاهزة. كل نظام نصممه يضمن أداءً فائقاً وموثوقية تامة وملكية كاملة لبياناتك.",
    },
    body_text: {},
    primary_cta_label: {},
    secondary_cta_label: {},
    metadata_items: [
      {
        code: "SYS_01",
        title: {
          en: "Zero-SSR Edge Caching",
          fr: "Cache Edge Zéro-SSR",
          ar: "تخزين مؤقت فائق السرعة",
        },
        desc: {
          en: "Public pages are statically cached and instantly served from global edge caches with on-demand invalidation.",
          fr: "Les pages publiques sont mises en cache statique et servies instantanément depuis le réseau mondial.",
          ar: "صفحات الويب مخزنة مؤقتاً وموزعة سحابياً لتقديم سرعة استجابة فورية دون إجهاد قاعدة البيانات.",
        },
      },
      {
        code: "SYS_02",
        title: {
          en: "Autonomous n8n Pipelines",
          fr: "Pipelines n8n Autonomes",
          ar: "مسارات عمل n8n المستقلة",
        },
        desc: {
          en: "Self-hosted workflows connecting CRMs, payment gateways, and AI models with zero third-party platform tax.",
          fr: "Workflows connectant CRM, passerelles de paiement et modèles d'IA sans surcoût de plateforme tierce.",
          ar: "أتمتة شاملة تربط أنظمة الدفع وإدارة العملاء والذكاء الاصطناعي دون الاعتماد على اشتراكات برمجية باهظة.",
        },
      },
      {
        code: "SYS_03",
        title: {
          en: "PostgreSQL Hardened Security",
          fr: "Sécurité PostgreSQL Renforcée",
          ar: "أمان وحماية قواعد البيانات",
        },
        desc: {
          en: "Atomic rate limiting, strict Row-Level Security (RLS), and zero-exposure API proxy layers.",
          fr: "Limitation de débit atomique, sécurité granulaire par ligne (RLS) et proxys sécurisés.",
          ar: "سياسات RLS صارمة لحماية السجلات وحماية ضد الهجمات وتحديد معدل الطلبات عبر قاعدة البيانات مباشرة.",
        },
      },
    ],
    updated_at: new Date().toISOString(),
  },
  services_header: {
    section_key: "services_header",
    badge_text: {
      en: "CAPABILITIES & SYSTEMS",
      fr: "COMPÉTENCES & SYSTÈMES",
      ar: "القدرات والخدمات الهندسية",
    },
    headline: {
      en: "Deterministic Engineering for Web, Mobile & Automation",
      fr: "Ingénierie Déterministe pour le Web, le Mobile & l'Automatisation",
      ar: "هندسة برمجية دقيقة للويب وتطبيقات الهاتف والأتمتة",
    },
    subheadline: {
      en: "From high-concurrency web platforms to multi-agent automation pipelines, explore our core service offerings below.",
      fr: "Des plateformes web à haute concurrence aux pipelines d'automatisation multi-agents, découvrez nos offres ci-dessous.",
      ar: "من منصات الويب فائقة السرعة إلى مسارات الأتمتة المتقدمة، استكشف حلولنا البرمجية المتكاملة.",
    },
    body_text: {},
    primary_cta_label: {},
    secondary_cta_label: {},
    metadata_items: [],
    updated_at: new Date().toISOString(),
  },
  projects_header: {
    section_key: "projects_header",
    badge_text: {
      en: "PORTFOLIO & SYSTEM SPECIFICATIONS",
      fr: "PORTFOLIO & SPÉCIFICATIONS TECHNIQUES",
      ar: "المشاريع والمواصفات الهندسية",
    },
    headline: {
      en: "Proven Deployments & Measurable Velocity",
      fr: "Déploiements Éprouvés & Vélocité Mesurable",
      ar: "مشاريع واقعية ونتائج تشغيلية مثبتة",
    },
    subheadline: {
      en: "Inspect real-world architecture diagrams, technical benchmarks, and measurable outcomes from our production rollouts.",
      fr: "Inspectez les diagrammes d'architecture réels, les métriques techniques et les résultats mesurables de nos livraisons.",
      ar: "استعرض المخططات المعمارية ومؤشرات الأداء الدقيقة والنتائج المحققة عبر مشاريعنا الحية.",
    },
    body_text: {},
    primary_cta_label: {},
    secondary_cta_label: {},
    metadata_items: [],
    updated_at: new Date().toISOString(),
  },
  about_story: {
    section_key: "about_story",
    badge_text: {
      en: "THE DEVYX ENGINEERING MANIFESTO",
      fr: "LE MANIFESTE DEVYX",
      ar: "بيان ديفيكس الهندسي",
    },
    headline: {
      en: "Deterministic Software Built for Long-Term Value",
      fr: "Logiciel Déterministe Conçu pour la Valeur Durable",
      ar: "برمجيات دقيقة مصممة لصنع قيمة تشغيلية مستدامة",
    },
    subheadline: {},
    body_text: {
      en: "Devyx was founded on a simple engineering premise: modern software should be deterministic, blindingly fast, and completely free of artificial complexity. We combine modern edge frameworks with robust PostgreSQL architecture and autonomous n8n workflows to empower businesses with infrastructure they truly own.",
      fr: "Devyx a été fondée sur un principe d'ingénierie simple: les logiciels modernes doivent être déterministes, extrêmement rapides et sans complexité artificielle. Nous combinons des frameworks edge avec PostgreSQL et des workflows n8n pour offrir des systèmes pérennes.",
      ar: "تأسست ديفيكس على مبدأ هندسي راسخ: البرمجيات الحديثة يجب أن تكون دقيقة وسريعة للغاية وخالية من التعقيد الزائف. نحن نجمع بين تقنيات الويب السحابية وقواعد بيانات بوستجريس المنيعة ومسارات أتمتة n8n الذاتية لتمكين الشركات من امتلاك بنيتها الرقمية بالكامل.",
    },
    primary_cta_label: {},
    secondary_cta_label: {},
    metadata_items: [],
    updated_at: new Date().toISOString(),
  },
  contact_header: {
    section_key: "contact_header",
    badge_text: {
      en: "DISCOVERY & ENGAGEMENT",
      fr: "DÉCOUVERTE & ENGAGEMENT",
      ar: "بدء التواصل والتعاون التقني",
    },
    headline: {
      en: "Initiate an Architectural Discovery Consultation",
      fr: "Initier une Consultation Technique",
      ar: "ابدأ استشارتك التقنية لتطوير مشروعك",
    },
    subheadline: {
      en: "Connect directly through our secure consultation pipeline, WhatsApp hotline, or autonomous AI qualification engineer.",
      fr: "Contactez-nous directement via notre formulaire sécurisé, WhatsApp ou notre agent de qualification IA.",
      ar: "تواصل معنا مباشرة عبر استمارة الاستشارة الآمنة، أو عبر خط الواتساب المباشر، أو عبر مساعدنا الذكي.",
    },
    body_text: {},
    primary_cta_label: {},
    secondary_cta_label: {},
    metadata_items: [],
    updated_at: new Date().toISOString(),
  },
};

const fallbackServices: ServiceItem[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    slug: "web-platform-architecture",
    category: "web_dev",
    icon_name: "Globe",
    title: {
      en: "Web Platform Architecture",
      fr: "Architecture de Plateformes Web",
      ar: "بنية منصات الويب المتقدمة",
    },
    short_description: {
      en: "Ultra-fast, zero-SSR Next.js web applications backed by edge caching and hardened PostgreSQL.",
      fr: "Applications web Next.js ultra-rapides, zéro-SSR avec mise en cache edge et PostgreSQL sécurisé.",
      ar: "تطبيقات ويب فائقة السرعة مبنية بتقنية Next.js مع تخزين سحابي مؤقت وبنية بوستجريس منيعة.",
    },
    full_description: {
      en: "We engineer high-performance web systems utilizing Next.js App Router, TypeScript, and Tailwind CSS. Built with infinite static caching (ISR) to achieve sub-second LCP and zero unnecessary database round-trips.",
      fr: "Nous concevons des systèmes web haute performance avec Next.js App Router, TypeScript et Tailwind CSS, intégrant une mise en cache ISR infinie pour un chargement instantané.",
      ar: "نطور تطبيقات ويب ضخمة بأعلى معايير السرعة والأمان، معتمدة على التخزين السحابي الذكي لتحقيق استجابة فورية وحماية تامة للبيانات.",
    },
    cta_label: {
      en: "Request Architecture Plan",
      fr: "Demander un Plan d'Architecture",
      ar: "طلب مخطط البنية الهندسية",
    },
    features: [
      {
        en: "Sub-0.8s Largest Contentful Paint (LCP)",
        fr: "LCP inférieur à 0.8s garanti",
        ar: "سرعة تحميل قياسية أقل من 0.8 ثانية",
      },
      {
        en: "Granular On-Demand ISR Cache Purging",
        fr: "Purge de cache ISR granulaire à la demande",
        ar: "تحديث فوري للمحتوى عند التعديل فقط",
      },
      {
        en: "Trilingual RTL / LTR Mirroring Engine",
        fr: "Support trilingue complet avec RTL/LTR",
        ar: "دعم كامل لثلاث لغات مع اتجاه RTL تلقائي",
      },
    ],
    is_featured_home: true,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    slug: "cross-platform-mobile-engineering",
    category: "mobile_app",
    icon_name: "Smartphone",
    title: {
      en: "Cross-Platform Mobile Engineering",
      fr: "Ingénierie Mobile Multiplateforme",
      ar: "تطوير تطبيقات الهواتف الذكية",
    },
    short_description: {
      en: "Native-compiled iOS and Android applications with offline-first synchronization and real-time backend updates.",
      fr: "Applications natives iOS et Android avec synchronisation hors ligne et mises à jour en temps réel.",
      ar: "تطبيقات جوال متوافقة مع أنظمة iOS و Android مع دعم العمل دون إنترنت وتحديثات فورية.",
    },
    full_description: {
      en: "From user authentication to real-time notifications, we develop responsive mobile applications using modern frameworks connected directly to Supabase Auth and database events.",
      fr: "De l'authentification aux notifications en temps réel, nous concevons des applications mobiles réactives connectées directement à Supabase.",
      ar: "نصمم ونبني تطبيقات الهواتف الذكية مع أنظمة مصادقة متقدمة وإشعارات فورية وربط مباشر مع قواعد البيانات.",
    },
    cta_label: {
      en: "Build Mobile Application",
      fr: "Créer une Application Mobile",
      ar: "ابدأ مشروع تطبيقك",
    },
    features: [
      {
        en: "Single codebase compiled to iOS and Android",
        fr: "Base de code unifiée pour iOS et Android",
        ar: "قاعدة برمجية موحدة تدعم كلا النظامين",
      },
      {
        en: "Offline-first data caching and sync",
        fr: "Synchronisation et cache hors-ligne",
        ar: "تخزين ومزامنة البيانات في وضع عدم الاتصال",
      },
      {
        en: "Biometric authentication & push notifications",
        fr: "Authentification biométrique et notifications push",
        ar: "تسجيل دخول بيومتري وإشعارات فورية",
      },
    ],
    is_featured_home: true,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    slug: "n8n-workflow-automation",
    category: "automation",
    icon_name: "Cpu",
    title: {
      en: "Autonomous n8n Workflow Automation",
      fr: "Automatisation des Workflows n8n",
      ar: "أتمتة مسارات العمل المتقدمة عبر n8n",
    },
    short_description: {
      en: "Self-hosted business automation pipelines that eliminate manual tasks, connect enterprise APIs, and slash operational overhead.",
      fr: "Pipelines d'automatisation auto-hébergés éliminant les tâches manuelles et connectant les API d'entreprise.",
      ar: "مسارات عمل مؤتمتة ومستقلة تقضي على المهام اليدوية المتكررة وتربط أنظمة الشركة بالكامل.",
    },
    full_description: {
      en: "We build scalable, deterministic n8n workflows that ingest leads, sync ERP/CRM data, trigger dynamic alerts, and process financial invoices without recurring SaaS license penalties.",
      fr: "Nous concevons des workflows n8n évolutifs pour synchroniser CRM, facturation et alertes d'équipe sans frais récurrents de SaaS propriétaires.",
      ar: "نبني مسارات n8n لمعالجة استفسارات العملاء وإصدار الفواتير ومزامنة المخزون وتنبيه فرق العمل تلقائياً وبأقل كلفة.",
    },
    cta_label: {
      en: "Automate Workflows",
      fr: "Automatiser les Workflows",
      ar: "أتمت أعمالك الآن",
    },
    features: [
      {
        en: "Self-hosted infrastructure with zero per-task fees",
        fr: "Infrastructure auto-hébergée sans frais par tâche",
        ar: "بنية مستقلة بالكامل بدون رسوم شهرية لكل مهمة",
      },
      {
        en: "Multi-step error recovery & retry logic",
        fr: "Gestion d'erreurs multi-niveaux et reprise automatique",
        ar: "معالجة ذكية للأخطاء مع محاولات إعادة التشغيل",
      },
      {
        en: "Secure webhook authentication & HMAC verification",
        fr: "Authentification sécurisée par webhook et HMAC",
        ar: "تحقق أمني مشدد عبر الويبهوك والتوقيع الرقمي",
      },
    ],
    is_featured_home: true,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    slug: "autonomous-ai-agents",
    category: "automation",
    icon_name: "Bot",
    title: {
      en: "Autonomous AI Qualification Agents",
      fr: "Agents IA de Qualification Autonomes",
      ar: "وكلاء الذكاء الاصطناعي لتأهيل العملاء",
    },
    short_description: {
      en: "Conversational AI agents integrated with company knowledge, qualifying project budgets, and booking discovery meetings.",
      fr: "Agents conversationnels IA intégrés à vos données, qualifiant les prospects et réservant des rendez-vous.",
      ar: "مساعدات ذكية محادثة تجيب على استفسارات العملاء وتؤهل الميزانيات وتحجز مواعيد الاتصال تلقائياً.",
    },
    full_description: {
      en: "We design intelligent chatbots connected to your private CRM via n8n. Visitors receive tailored service guidance, timeline estimation, and direct scheduling links.",
      fr: "Chatbots intelligents connectés à votre CRM via n8n pour orienter les visiteurs, estimer les délais et planifier des appels.",
      ar: "روبوتات محادثة ذكية متصلة بنظام n8n لتوجيه الزوار وحساب المهل الزمنية وحجز جلسات العمل التنسيقية.",
    },
    cta_label: {
      en: "Deploy AI Agent",
      fr: "Déployer un Agent IA",
      ar: "نشر وكيل الذكاء الاصطناعي",
    },
    features: [
      {
        en: "Context-aware memory buffer via session IDs",
        fr: "Mémoire contextuelle persistante par identifiant de session",
        ar: "ذاكرة محادثة ذكية تحتفظ بسياق الزائر",
      },
      {
        en: "Sanitized Markdown rendering with booking links",
        fr: "Rendu Markdown sécurisé avec liens de réservation",
        ar: "عرض منسق وآمن للنصوص وروابط حجز المواعيد",
      },
      {
        en: "Fail-safe fallback to direct WhatsApp / Telegram",
        fr: "Bascule de secours instantanée vers WhatsApp et Telegram",
        ar: "تحويل فوري للتواصل عبر واتساب وتيليغرام عند الحاجة",
      },
    ],
    is_featured_home: true,
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const fallbackProjects: ProjectItem[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    slug: "nexus-logistics-portal",
    category: "web_dev",
    title: {
      en: "Nexus B2B Supply Chain & Logistics Portal",
      fr: "Nexus Portail B2B Logistique & Chaîne d'Approvisionnement",
      ar: "بوابة نيكسوس اللوجستية لإدارة سلاسل الإمداد",
    },
    short_summary: {
      en: "High-throughput freight coordination portal handling 25,000+ monthly shipments with sub-second page loads.",
      fr: "Portail de fret haute cadence gérant plus de 25 000 expéditions par mois avec un chargement instantané.",
      ar: "بوابة لوجستية متطورة لتنسيق أكثر من 25,000 شحنة شهرياً مع سرعة استجابة فائقة.",
    },
    problem_statement: {
      en: "The client operated on a legacy PHP portal plagued by slow response times (4.8s LCP), frequent database deadlocks during peak inventory reconciliation, and zero mobile responsiveness for warehouse operators.",
      fr: "Le client utilisait un portail PHP vieillissant avec des temps de réponse de 4,8s, des blocages de base de données en période de pointe et aucune ergonomie mobile.",
      ar: "كان العميل يعاني من نظام قديم بطيء الاستجابة (أكثر من 4.8 ثانية) مع تكرار توقف قاعدة البيانات أثناء جرد البضائع وعدم ملاءمته لأجهزة الهواتف.",
    },
    solution_provided: {
      en: "Devyx re-architected the entire front and backend with Next.js 15, PostgreSQL, and on-demand ISR edge caching. We designed a clean blueprint UI with exposed grids, instantaneous live filtering, and offline-capable mobile views.",
      fr: "Devyx a restructuré le système complet avec Next.js 15, PostgreSQL et mise en cache edge ISR. Nous avons créé une interface blueprint nette avec filtrage instantané.",
      ar: "قامت ديفيكس بإعادة بناء النظام بالكامل عبر Next.js 15 وبوستجريس مع التخزين السحابي الفوري وواجهة هندسية دقيقة تعمل بكفاءة على كافة الأجهزة.",
    },
    results_achieved: {
      en: "Page load time reduced from 4.8s to 0.62s (87% improvement). Zero database downtime during peak month-end audits. Freight coordination processing velocity increased by 3.4x.",
      fr: "Temps de chargement réduit de 4,8s à 0,62s (gain de 87%). Zéro panne lors des clôtures mensuelles. Vitesse de traitement multipliée par 3,4.",
      ar: "انخفاض زمن تحميل الصفحات من 4.8 ثانية إلى 0.62 ثانية (تحسن بنسبة 87%)، وانعدام فترات التوقف، وزيادة سرعة معالجة الشحنات بمقدار 3.4 أضعاف.",
    },
    tech_stack: ["Next.js", "PostgreSQL", "Tailwind CSS", "TypeScript", "Supabase Storage"],
    cover_image_url: "/images/projects/nexus-cover.webp",
    gallery_images: ["/images/projects/nexus-1.webp", "/images/projects/nexus-2.webp"],
    live_url: "https://nexus-demo.devyx.com",
    is_featured: true,
    is_published: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    slug: "autonomous-lead-qualification-agent",
    category: "automation",
    title: {
      en: "Omni-Channel AI Lead Qualification Pipeline",
      fr: "Pipeline d'Acquisition & Qualification IA Multi-Canal",
      ar: "نظام الذكاء الاصطناعي المؤتمت لتأهيل واستقطاب العملاء",
    },
    short_summary: {
      en: "Autonomous n8n pipeline qualifying B2B enterprise leads 24/7 across website, WhatsApp, and Telegram.",
      fr: "Pipeline n8n autonome qualifiant les prospects B2B 24/7 sur le site web, WhatsApp et Telegram.",
      ar: "مسار عمل ذاتي عبر n8n لتأهيل واستقبال العملاء على مدار الساعة عبر الويب وواتساب وتيليغرام.",
    },
    problem_statement: {
      en: "A B2B agency was losing qualified international leads due to time-zone delays (average 14-hour first response time). Sales teams spent 40% of their work week manually screening unqualified inquiries.",
      fr: "Une agence B2B perdait des prospects qualifiés en raison du décalage horaire (délai moyen de réponse de 14h) et passait 40% de son temps à filtrer les messages manuellement.",
      ar: "كانت الشركة تفقد عملاء مهتمين بسبب تأخر الرد (متوسط 14 ساعة بسبب اختلاف التوقيت العالمي)، مع هدر 40% من وقت المبيعات في فرز الاستفسارات غير المؤهلة.",
    },
    solution_provided: {
      en: "Devyx developed an autonomous n8n agent integrated with OpenAI and Supabase. The agent engages prospects instantly in Arabic, French, or English, assesses project requirements and budgets, and automatically generates Calendly booking appointments.",
      fr: "Devyx a créé un agent n8n autonome connecté à OpenAI et Supabase. L'agent engage immédiatement les prospects en arabe, français ou anglais et réserve des créneaux dans l'agenda.",
      ar: "طورت ديفيكس وكيلاً ذكياً متكاملاً يتحدث بالعربية والفرنسية والإنجليزية، يحدد ميزانيات المشاريع ومتطلباتها ويحجز المواعيد في تقويم الفريق آلياً.",
    },
    results_achieved: {
      en: "First response time dropped from 14 hours to 4 seconds. Lead-to-discovery meeting conversion rate increased by 210%. Over 65 hours of manual screening saved every month.",
      fr: "Temps de réponse réduit de 14h à 4 secondes. Taux de conversion rendez-vous augmenté de 210%. Plus de 65 heures de travail manuel économisées chaque mois.",
      ar: "انخفض وقت الاستجابة الأولية من 14 ساعة إلى 4 ثوانٍ فقط، وارتفع معدل حجز المواعيد بنسبة 210% مع توفير أكثر من 65 ساعة عمل شهرياً.",
    },
    tech_stack: ["n8n", "OpenAI", "Supabase", "WhatsApp Business API", "Telegram API"],
    cover_image_url: "/images/projects/leadbot-cover.webp",
    gallery_images: ["/images/projects/leadbot-1.webp", "/images/projects/leadbot-2.webp"],
    live_url: null, // Pure automation without public URL
    is_featured: true,
    is_published: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    slug: "zenith-crossplatform-fintech",
    category: "mobile_app",
    title: {
      en: "Zenith Multi-Currency Mobile Wallet",
      fr: "Portefeuille Mobile Multi-Devises Zenith",
      ar: "محفظة زينيث المالية متعددة العملات",
    },
    short_summary: {
      en: "Cross-platform mobile wallet supporting biometric security, instant peer-to-peer transfers, and offline balance caching.",
      fr: "Portefeuille mobile multi-devises avec sécurité biométrique, transferts instantanés et solde hors-ligne.",
      ar: "تطبيق محفظة مالية للهواتف الذكية يدعم الحماية البيومترية والتحويلات الفورية وعرض الأرصدة دون إنترنت.",
    },
    problem_statement: {
      en: "The client required a mobile payment solution that could function reliably in emerging markets with unstable cellular connectivity, while upholding strict financial security standards.",
      fr: "Le client avait besoin d'une application de paiement fonctionnant de façon fiable dans des zones à connectivité instable tout en respectant des normes strictes de sécurité financière.",
      ar: "احتاج العميل إلى حل مالي يعمل بثبات وموثوقية في بيئات اتصال متذبذبة مع الالتزام بأعلى معايير التشفير والأمان المالي.",
    },
    solution_provided: {
      en: "Devyx built a unified cross-platform mobile client with offline encrypted SQLite local caching, biometric authentication, and optimistic UI updates backed by Supabase PostgreSQL.",
      fr: "Devyx a conçu une application mobile unifiée avec stockage local SQLite chiffré, authentification biométrique et synchronisation PostgreSQL sécurisée.",
      ar: "قامت ديفيكس ببناء تطبيق جوال متطور بتقنية التخزين المحلي المشفر والمصادقة البيومترية والمزامنة الفورية مع قواعد البيانات.",
    },
    results_achieved: {
      en: "Over 120,000 active transactions executed within first 90 days. 99.99% transaction reliability with zero balance desynchronization reports.",
      fr: "Plus de 120 000 transactions exécutées au cours des 90 premiers jours avec 99,99% de fiabilité et zéro anomalie de solde.",
      ar: "تنفيذ أكثر من 120,000 معاملة ناجحة خلال أول 90 يوماً بنسبة استقرار بلغت 99.99% ودون أي خطأ في مطابقة الأرصدة.",
    },
    tech_stack: ["Flutter", "Supabase Auth", "PostgreSQL", "SQLite", "WebSockets"],
    cover_image_url: "/images/projects/zenith-cover.webp",
    gallery_images: ["/images/projects/zenith-1.webp", "/images/projects/zenith-2.webp"],
    live_url: "https://zenith-app.devyx.com",
    is_featured: true,
    is_published: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const fallbackSocialLinks: SocialLinkItem[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    platform: "whatsapp",
    url: "https://wa.me/213000000000",
    display_handle: "+213 Devyx Direct",
    custom_label: { en: "WhatsApp Direct", fr: "WhatsApp Direct", ar: "واتساب المباشر" },
    is_active: true,
    display_order: 1,
    updated_at: new Date().toISOString(),
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    platform: "telegram",
    url: "https://t.me/devyx_official",
    display_handle: "@devyx_official",
    custom_label: { en: "Telegram Channel", fr: "Canal Telegram", ar: "قناة تيليغرام" },
    is_active: true,
    display_order: 2,
    updated_at: new Date().toISOString(),
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    platform: "messenger",
    url: "https://m.me/devyx",
    display_handle: "devyx",
    custom_label: { en: "Facebook Messenger", fr: "Facebook Messenger", ar: "فيسبوك ماسنجر" },
    is_active: true,
    display_order: 3,
    updated_at: new Date().toISOString(),
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    platform: "instagram",
    url: "https://instagram.com/devyx.tech",
    display_handle: "@devyx.tech",
    custom_label: { en: "Instagram Tech", fr: "Instagram Tech", ar: "إنستغرام التقني" },
    is_active: true,
    display_order: 4,
    updated_at: new Date().toISOString(),
  },
  {
    id: "30000000-0000-0000-0000-000000000005",
    platform: "tiktok",
    url: "https://tiktok.com/@devyx.tech",
    display_handle: "@devyx.tech",
    custom_label: { en: "TikTok Engineering", fr: "TikTok Ingénierie", ar: "تيك توك البرمجي" },
    is_active: true,
    display_order: 5,
    updated_at: new Date().toISOString(),
  },
  {
    id: "30000000-0000-0000-0000-000000000006",
    platform: "youtube",
    url: "https://youtube.com/@devyx",
    display_handle: "Devyx Engineering",
    custom_label: { en: "YouTube Channel", fr: "Chaîne YouTube", ar: "قناة يوتيوب" },
    is_active: true,
    display_order: 6,
    updated_at: new Date().toISOString(),
  },
];

// ==============================================================================
// Cached Query Functions (unstable_cache with infinite revalidation)
// ==============================================================================

/**
 * Fetches site_settings singleton with cache tag `cms:site_settings`
 */
export const getCachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error || !data) return fallbackSiteSettings;
      return data;
    } catch {
      return fallbackSiteSettings;
    }
  },
  ["site_settings"],
  {
    revalidate: false,
    tags: ["cms:site_settings"],
  }
);

/**
 * Fetches page_sections by key with cache tag `cms:page_content`
 */
export const getCachedPageSection = (sectionKey: string) =>
  unstable_cache(
    async (): Promise<PageSection> => {
      try {
        const supabase = createStaticClient();
        const { data, error } = await supabase
          .from("page_sections")
          .select("*")
          .eq("section_key", sectionKey)
          .single();

        if (error || !data) return fallbackSections[sectionKey] || fallbackSections["home_hero"];
        return data;
      } catch {
        return fallbackSections[sectionKey] || fallbackSections["home_hero"];
      }
    },
    [`page_section_${sectionKey}`],
    {
      revalidate: false,
      tags: ["cms:page_content"],
    }
  )();

/**
 * Fetches active services with cache tag `cms:services`
 */
export const getCachedServices = unstable_cache(
  async (): Promise<ServiceItem[]> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error || !data || data.length === 0) return fallbackServices;
      return data;
    } catch {
      return fallbackServices;
    }
  },
  ["services_catalog"],
  {
    revalidate: false,
    tags: ["cms:services"],
  }
);

/**
 * Fetches published projects with cache tag `cms:projects`
 */
export const getCachedProjects = unstable_cache(
  async (): Promise<ProjectItem[]> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error || !data || data.length === 0) return fallbackProjects;
      return data;
    } catch {
      return fallbackProjects;
    }
  },
  ["projects_catalog"],
  {
    revalidate: false,
    tags: ["cms:projects"],
  }
);

/**
 * Fetches active social links with cache tag `cms:social_links`
 */
export const getCachedSocialLinks = unstable_cache(
  async (): Promise<SocialLinkItem[]> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error || !data || data.length === 0) return fallbackSocialLinks;
      return data;
    } catch {
      return fallbackSocialLinks;
    }
  },
  ["social_links_active"],
  {
    revalidate: false,
    tags: ["cms:social_links"],
  }
);
