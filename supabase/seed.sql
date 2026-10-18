-- ==============================================================================
-- Devyx Platform & Headless CMS — Seed Data (Trilingual: ar, fr, en)
-- Pre-seeds site_settings, page_sections, services, projects, and social_links
-- ==============================================================================

-- 1. SITE SETTINGS
INSERT INTO public.site_settings (
  id,
  brand_name,
  enable_contact_form,
  chatbot_enabled,
  primary_cta_action,
  contact_email,
  seo_title,
  seo_description
)
VALUES (
  1,
  'Devyx',
  true,
  true,
  'open_chat',
  'contact@devyx.com',
  '{
    "en": "Devyx — High-Performance Web & Workflow Automation Agency",
    "fr": "Devyx — Agence de Développement Web & Automatisation des Workflows",
    "ar": "ديفيكس — وكالة تطوير الويب المتقدم وأتمتة مسارات العمل"
  }'::jsonb,
  '{
    "en": "Devyx engineers mission-critical web applications, cross-platform mobile systems, and autonomous n8n automation pipelines.",
    "fr": "Devyx conçoit des applications web critiques, des systèmes mobiles multiplateformes et des pipelines d''automatisation n8n autonomes.",
    "ar": "تبني ديفيكس تطبيقات ويب فائقة السرعة وأنظمة هواتف ذكية ومسارات أتمتة n8n مستقلة للشركات الرائدة."
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET
  brand_name = EXCLUDED.brand_name,
  enable_contact_form = EXCLUDED.enable_contact_form,
  chatbot_enabled = EXCLUDED.chatbot_enabled,
  primary_cta_action = EXCLUDED.primary_cta_action,
  contact_email = EXCLUDED.contact_email,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

-- 2. PAGE SECTIONS
-- 2.1 home_hero
INSERT INTO public.page_sections (
  section_key,
  badge_text,
  headline,
  subheadline,
  primary_cta_label,
  secondary_cta_label,
  metadata_items
)
VALUES (
  'home_hero',
  '{
    "en": "SYS_ONLINE // DETERMINISTIC ARCHITECTURE",
    "fr": "SYS_EN_LIGNE // ARCHITECTURE DÉTERMINISTE",
    "ar": "النظام_نشط // بنية هندسية دقيقة"
  }'::jsonb,
  '{
    "en": "Architecting Scalable Web Systems & Autonomous Workflows",
    "fr": "Architecture de Systèmes Web Évolutifs & Workflows Autonomes",
    "ar": "بناء أنظمة الويب القابلة للتوسع ومسارات العمل المؤتمتة"
  }'::jsonb,
  '{
    "en": "We build deterministic web platforms, cross-platform mobile apps, and self-hosted n8n automation pipelines engineered for zero downtime and maximum operational velocity.",
    "fr": "Nous concevons des plateformes web déterministes, des applications mobiles et des pipelines n8n conçus pour zéro temps d''arrêt et une vélocité opérationnelle maximale.",
    "ar": "نطور منصات ويب قوية وتطبيقات هواتف ذكية ومسارات أتمتة n8n مصممة لأقصى سرعة تشغيلية وبدون توقف."
  }'::jsonb,
  '{
    "en": "Initialize Consultation",
    "fr": "Lancer une Consultation",
    "ar": "ابدأ استشارتك الآن"
  }'::jsonb,
  '{
    "en": "Explore System Blueprints",
    "fr": "Explorer les Projets",
    "ar": "استعرض سابقة المشاريع"
  }'::jsonb,
  '[
    {"label": "GLOBAL_UPTIME", "value": "99.98%"},
    {"label": "WORKFLOW_CAPACITY", "value": "50K+ / day"},
    {"label": "AVG_LCP_LATENCY", "value": "<0.8s"}
  ]'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
SET
  badge_text = EXCLUDED.badge_text,
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline,
  primary_cta_label = EXCLUDED.primary_cta_label,
  secondary_cta_label = EXCLUDED.secondary_cta_label,
  metadata_items = EXCLUDED.metadata_items;

-- 2.2 home_why_us
INSERT INTO public.page_sections (
  section_key,
  badge_text,
  headline,
  subheadline,
  metadata_items
)
VALUES (
  'home_why_us',
  '{
    "en": "ENGINEERING PRINCIPLES",
    "fr": "PRINCIPES D''INGÉNIERIE",
    "ar": "مبادئنا الهندسية"
  }'::jsonb,
  '{
    "en": "Engineered for Deterministic Reliability & Velocity",
    "fr": "Conçu pour une Fiabilité Déterministe & une Vélocité Maximale",
    "ar": "بنية هندسية مصممة للدقة والموثوقية والسرعة الفائقة"
  }'::jsonb,
  '{
    "en": "We reject brittle SaaS templates and generic AI boilerplate. Every system is custom-crafted to run with predictable performance, bulletproof security, and full client data ownership.",
    "fr": "Nous rejetons les modèles SaaS fragiles. Chaque système est conçu sur mesure avec des performances prévisibles et une sécurité absolue.",
    "ar": "نرفض القوالب البرمجية الهشة والحلول الجاهزة. كل نظام نصممه يضمن أداءً فائقاً وموثوقية تامة وملكية كاملة لبياناتك."
  }'::jsonb,
  '[
    {
      "code": "SYS_01",
      "title": {
        "en": "Zero-SSR Edge Caching",
        "fr": "Cache Edge Zéro-SSR",
        "ar": "تخزين مؤقت فائق السرعة"
      },
      "desc": {
        "en": "Public pages are statically cached and instantly served from global edge caches with on-demand invalidation.",
        "fr": "Les pages publiques sont mises en cache statique et servies instantanément depuis le réseau mondial.",
        "ar": "صفحات الويب مخزنة مؤقتاً وموزعة سحابياً لتقديم سرعة استجابة فورية دون إجهاد قاعدة البيانات."
      }
    },
    {
      "code": "SYS_02",
      "title": {
        "en": "Autonomous n8n Pipelines",
        "fr": "Pipelines n8n Autonomes",
        "ar": "مسارات عمل n8n المستقلة"
      },
      "desc": {
        "en": "Self-hosted workflows connecting CRMs, payment gateways, and AI models with zero third-party platform tax.",
        "fr": "Workflows connectant CRM, passerelles de paiement et modèles d''IA sans surcoût de plateforme tierce.",
        "ar": "أتمتة شاملة تربط أنظمة الدفع وإدارة العملاء والذكاء الاصطناعي دون الاعتماد على اشتراكات برمجية باهظة."
      }
    },
    {
      "code": "SYS_03",
      "title": {
        "en": "PostgreSQL Hardened Security",
        "fr": "Sécurité PostgreSQL Renforcée",
        "ar": "أمان وحماية قواعد البيانات"
      },
      "desc": {
        "en": "Atomic rate limiting, strict Row-Level Security (RLS), and zero-exposure API proxy layers.",
        "fr": "Limitation de débit atomique, sécurité granulaire par ligne (RLS) et proxys sécurisés.",
        "ar": "سياسات RLS صارمة لحماية السجلات وحماية ضد الهجمات وتحديد معدل الطلبات عبر قاعدة البيانات مباشرة."
      }
    }
  ]'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
SET
  badge_text = EXCLUDED.badge_text,
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline,
  metadata_items = EXCLUDED.metadata_items;

-- 2.3 services_header
INSERT INTO public.page_sections (
  section_key,
  badge_text,
  headline,
  subheadline
)
VALUES (
  'services_header',
  '{
    "en": "CAPABILITIES & SYSTEMS",
    "fr": "COMPÉTENCES & SYSTÈMES",
    "ar": "القدرات والخدمات الهندسية"
  }'::jsonb,
  '{
    "en": "Deterministic Engineering for Web, Mobile & Automation",
    "fr": "Ingénierie Déterministe pour le Web, le Mobile & l''Automatisation",
    "ar": "هندسة برمجية دقيقة للويب وتطبيقات الهاتف والأتمتة"
  }'::jsonb,
  '{
    "en": "From high-concurrency web platforms to multi-agent automation pipelines, explore our core service offerings below.",
    "fr": "Des plateformes web à haute concurrence aux pipelines d''automatisation multi-agents, découvrez nos offres ci-dessous.",
    "ar": "من منصات الويب فائقة السرعة إلى مسارات الأتمتة المتقدمة، استكشف حلولنا البرمجية المتكاملة."
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
SET
  badge_text = EXCLUDED.badge_text,
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline;

-- 2.4 projects_header
INSERT INTO public.page_sections (
  section_key,
  badge_text,
  headline,
  subheadline
)
VALUES (
  'projects_header',
  '{
    "en": "PORTFOLIO & SYSTEM SPECIFICATIONS",
    "fr": "PORTFOLIO & SPÉCIFICATIONS TECHNIQUES",
    "ar": "المشاريع والمواصفات الهندسية"
  }'::jsonb,
  '{
    "en": "Proven Deployments & Measurable Velocity",
    "fr": "Déploiements Éprouvés & Vélocité Mesurable",
    "ar": "مشاريع واقعية ونتائج تشغيلية مثبتة"
  }'::jsonb,
  '{
    "en": "Inspect real-world architecture diagrams, technical benchmarks, and measurable outcomes from our production rollouts.",
    "fr": "Inspectez les diagrammes d''architecture réels, les métriques techniques et les résultats mesurables de nos livraisons.",
    "ar": "استعرض المخططات المعمارية ومؤشرات الأداء الدقيقة والنتائج المحققة عبر مشاريعنا الحية."
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
SET
  badge_text = EXCLUDED.badge_text,
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline;

-- 2.5 about_story
INSERT INTO public.page_sections (
  section_key,
  badge_text,
  headline,
  body_text
)
VALUES (
  'about_story',
  '{
    "en": "THE DEVYX ENGINEERING MANIFESTO",
    "fr": "LE MANIFESTE DEVYX",
    "ar": "بيان ديفيكس الهندسي"
  }'::jsonb,
  '{
    "en": "Deterministic Software Built for Long-Term Value",
    "fr": "Logiciel Déterministe Conçu pour la Valeur Durable",
    "ar": "برمجيات دقيقة مصممة لصنع قيمة تشغيلية مستدامة"
  }'::jsonb,
  '{
    "en": "Devyx was founded on a simple engineering premise: modern software should be deterministic, blindingly fast, and completely free of artificial complexity. We combine modern edge frameworks with robust PostgreSQL architecture and autonomous n8n workflows to empower businesses with infrastructure they truly own.",
    "fr": "Devyx a été fondée sur un principe d''ingénierie simple: les logiciels modernes doivent être déterministes, extrêmement rapides et sans complexité artificielle. Nous combinons des frameworks edge avec PostgreSQL et des workflows n8n pour offrir des systèmes pérennes.",
    "ar": "تأسست ديفيكس على مبدأ هندسي راسخ: البرمجيات الحديثة يجب أن تكون دقيقة وسريعة للغاية وخالية من التعقيد الزائف. نحن نجمع بين تقنيات الويب السحابية وقواعد بيانات بوستجريس المنيعة ومسارات أتمتة n8n الذاتية لتمكين الشركات من امتلاك بنيتها الرقمية بالكامل."
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
SET
  badge_text = EXCLUDED.badge_text,
  headline = EXCLUDED.headline,
  body_text = EXCLUDED.body_text;

-- 2.6 contact_header
INSERT INTO public.page_sections (
  section_key,
  badge_text,
  headline,
  subheadline
)
VALUES (
  'contact_header',
  '{
    "en": "DISCOVERY & ENGAGEMENT",
    "fr": "DÉCOUVERTE & ENGAGEMENT",
    "ar": "بدء التواصل والتعاون التقني"
  }'::jsonb,
  '{
    "en": "Initiate an Architectural Discovery Consultation",
    "fr": "Initier une Consultation Technique",
    "ar": "ابدأ استشارتك التقنية لتطوير مشروعك"
  }'::jsonb,
  '{
    "en": "Connect directly through our secure consultation pipeline, WhatsApp hotline, or autonomous AI qualification engineer.",
    "fr": "Contactez-nous directement via notre formulaire sécurisé, WhatsApp ou notre agent de qualification IA.",
    "ar": "تواصل معنا مباشرة عبر استمارة الاستشارة الآمنة، أو عبر خط الواتساب المباشر، أو عبر مساعدنا الذكي."
  }'::jsonb
)
ON CONFLICT (section_key) DO UPDATE
SET
  badge_text = EXCLUDED.badge_text,
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline;

-- 3. SERVICES (6 Core Offerings)
INSERT INTO public.services (
  slug,
  category,
  icon_name,
  title,
  short_description,
  full_description,
  cta_label,
  features,
  is_featured_home,
  is_active,
  display_order
)
VALUES
(
  'web-platform-architecture',
  'web_dev',
  'Globe',
  '{
    "en": "Web Platform Architecture",
    "fr": "Architecture de Plateformes Web",
    "ar": "بنية منصات الويب المتقدمة"
  }'::jsonb,
  '{
    "en": "Ultra-fast, zero-SSR Next.js web applications backed by edge caching and hardened PostgreSQL.",
    "fr": "Applications web Next.js ultra-rapides, zéro-SSR avec mise en cache edge et PostgreSQL sécurisé.",
    "ar": "تطبيقات ويب فائقة السرعة مبنية بتقنية Next.js مع تخزين سحابي مؤقت وبنية بوستجريس منيعة."
  }'::jsonb,
  '{
    "en": "We engineer high-performance web systems utilizing Next.js App Router, TypeScript, and Tailwind CSS. Built with infinite static caching (ISR) to achieve sub-second LCP and zero unnecessary database round-trips.",
    "fr": "Nous concevons des systèmes web haute performance avec Next.js App Router, TypeScript et Tailwind CSS, intégrant une mise en cache ISR infinie pour un chargement instantané.",
    "ar": "نطور تطبيقات ويب ضخمة بأعلى معايير السرعة والأمان، معتمدة على التخزين السحابي الذكي لتحقيق استجابة فورية وحماية تامة للبيانات."
  }'::jsonb,
  '{
    "en": "Request Architecture Plan",
    "fr": "Demander un Plan d''Architecture",
    "ar": "طلب مخطط البنية الهندسية"
  }'::jsonb,
  '[
    {"en": "Sub-0.8s Largest Contentful Paint (LCP)", "fr": "LCP inférieur à 0.8s garanti", "ar": "سرعة تحميل قياسية أقل من 0.8 ثانية"},
    {"en": "Granular On-Demand ISR Cache Purging", "fr": "Purge de cache ISR granulaire à la demande", "ar": "تحديث فوري للمحتوى عند التعديل فقط"},
    {"en": "Trilingual RTL / LTR Mirroring Engine", "fr": "Support trilingue complet avec RTL/LTR", "ar": "دعم كامل لثلاث لغات مع اتجاه RTL تلقائي"}
  ]'::jsonb,
  true,
  true,
  1
),
(
  'cross-platform-mobile-engineering',
  'mobile_app',
  'Smartphone',
  '{
    "en": "Cross-Platform Mobile Engineering",
    "fr": "Ingénierie Mobile Multiplateforme",
    "ar": "تطوير تطبيقات الهواتف الذكية"
  }'::jsonb,
  '{
    "en": "Native-compiled iOS and Android applications with offline-first synchronization and real-time backend updates.",
    "fr": "Applications natives iOS et Android avec synchronisation hors ligne et mises à jour en temps réel.",
    "ar": "تطبيقات جوال متوافقة مع أنظمة iOS و Android مع دعم العمل دون إنترنت وتحديثات فورية."
  }'::jsonb,
  '{
    "en": "From user authentication to real-time notifications, we develop responsive mobile applications using modern frameworks connected directly to Supabase Auth and database events.",
    "fr": "De l''authentification aux notifications en temps réel, nous concevons des applications mobiles réactives connectées directement à Supabase.",
    "ar": "نصمم ونبني تطبيقات الهواتف الذكية مع أنظمة مصادقة متقدمة وإشعارات فورية وربط مباشر مع قواعد البيانات."
  }'::jsonb,
  '{
    "en": "Build Mobile Application",
    "fr": "Créer une Application Mobile",
    "ar": "ابدأ مشروع تطبيقك"
  }'::jsonb,
  '[
    {"en": "Single codebase compiled to iOS and Android", "fr": "Base de code unifiée pour iOS et Android", "ar": "قاعدة برمجية موحدة تدعم كلا النظامين"},
    {"en": "Offline-first data caching and sync", "fr": "Synchronisation et cache hors-ligne", "ar": "تخزين ومزامنة البيانات في وضع عدم الاتصال"},
    {"en": "Biometric authentication & push notifications", "fr": "Authentification biométrique et notifications push", "ar": "تسجيل دخول بيومتري وإشعارات فورية"}
  ]'::jsonb,
  true,
  true,
  2
),
(
  'n8n-workflow-automation',
  'automation',
  'Cpu',
  '{
    "en": "Autonomous n8n Workflow Automation",
    "fr": "Automatisation des Workflows n8n",
    "ar": "أتمتة مسارات العمل المتقدمة عبر n8n"
  }'::jsonb,
  '{
    "en": "Self-hosted business automation pipelines that eliminate manual tasks, connect enterprise APIs, and slash operational overhead.",
    "fr": "Pipelines d''automatisation auto-hébergés éliminant les tâches manuelles et connectant les API d''entreprise.",
    "ar": "مسارات عمل مؤتمتة ومستقلة تقضي على المهام اليدوية المتكررة وتربط أنظمة الشركة بالكامل."
  }'::jsonb,
  '{
    "en": "We build scalable, deterministic n8n workflows that ingest leads, sync ERP/CRM data, trigger dynamic alerts, and process financial invoices without recurring SaaS license penalties.",
    "fr": "Nous concevons des workflows n8n évolutifs pour synchroniser CRM, facturation et alertes d''équipe sans frais récurrents de SaaS propriétaires.",
    "ar": "نبني مسارات n8n لمعالجة استفسارات العملاء وإصدار الفواتير ومزامنة المخزون وتنبيه فرق العمل تلقائياً وبأقل كلفة."
  }'::jsonb,
  '{
    "en": "Automate Workflows",
    "fr": "Automatiser les Workflows",
    "ar": "أتمت أعمالك الآن"
  }'::jsonb,
  '[
    {"en": "Self-hosted infrastructure with zero per-task fees", "fr": "Infrastructure auto-hébergée sans frais par tâche", "ar": "بنية مستقلة بالكامل بدون رسوم شهرية لكل مهمة"},
    {"en": "Multi-step error recovery & retry logic", "fr": "Gestion d''erreurs multi-niveaux et reprise automatique", "ar": "معالجة ذكية للأخطاء مع محاولات إعادة التشغيل"},
    {"en": "Secure webhook authentication & HMAC verification", "fr": "Authentification sécurisée par webhook et HMAC", "ar": "تحقق أمني مشدد عبر الويبهوك والتوقيع الرقمي"}
  ]'::jsonb,
  true,
  true,
  3
),
(
  'database-rls-engineering',
  'web_dev',
  'Database',
  '{
    "en": "Database & RLS Architecture",
    "fr": "Architecture de Base de Données & RLS",
    "ar": "هندسة قواعد البيانات وحماية RLS"
  }'::jsonb,
  '{
    "en": "Enterprise-grade PostgreSQL schema design, Row-Level Security, atomic rate limiters, and automated backup strategies.",
    "fr": "Schémas PostgreSQL d''entreprise, sécurité RLS, limiteurs de débit et sauvegardes automatiques.",
    "ar": "تصميم متكامل لقواعد بيانات بوستجريس مع أمان RLS صارم وتحديد ذري لمعدل الطلبات."
  }'::jsonb,
  '{
    "en": "We optimize relational databases with partial indexing, query plans (EXPLAIN ANALYZE), connection pooling, and automated keep-alive tasks to guarantee continuous availability.",
    "fr": "Optimisation PostgreSQL complète: indexation partielle, plans d''exécution, pooling de connexions et tâches de maintien en activité.",
    "ar": "تحسين مستمر لأداء الاستعلامات والفهارس الجزئية وإدارة اتصالات قاعدة البيانات للحفاظ على استقرار النظام دائماً."
  }'::jsonb,
  '{
    "en": "Audit Database Architecture",
    "fr": "Auditer la Base de Données",
    "ar": "فحص بنية قاعدة البيانات"
  }'::jsonb,
  '[
    {"en": "Row-Level Security eliminating unauthorized access", "fr": "Politiques RLS éliminant tout accès non autorisé", "ar": "حماية دقيقة تمنع أي وصول غير مصرح به للسجلات"},
    {"en": "Atomic stored procedures with security definer", "fr": "Fonctions stockées atomiques et sécurisées", "ar": "دوال مخزنة تمنع التضارب وتعمل بسرية تامة"},
    {"en": "Optimized partial and composite indexes", "fr": "Index partiels et composites optimisés", "ar": "فهارس متقدمة لتسريع الاستعلامات المعقدة"}
  ]'::jsonb,
  false,
  true,
  4
),
(
  'autonomous-ai-agents',
  'automation',
  'Bot',
  '{
    "en": "Autonomous AI Qualification Agents",
    "fr": "Agents IA de Qualification Autonomes",
    "ar": "وكلاء الذكاء الاصطناعي لتأهيل العملاء"
  }'::jsonb,
  '{
    "en": "Conversational AI agents integrated with company knowledge, qualifying project budgets, and booking discovery meetings.",
    "fr": "Agents conversationnels IA intégrés à vos données, qualifiant les prospects et réservant des rendez-vous.",
    "ar": "مساعدات ذكية محادثة تجيب على استفسارات العملاء وتؤهل الميزانيات وتحجز مواعيد الاتصال تلقائياً."
  }'::jsonb,
  '{
    "en": "We design intelligent chatbots connected to your private CRM via n8n. Visitors receive tailored service guidance, timeline estimation, and direct scheduling links.",
    "fr": "Chatbots intelligents connectés à votre CRM via n8n pour orienter les visiteurs, estimer les délais et planifier des appels.",
    "ar": "روبوتات محادثة ذكية متصلة بنظام n8n لتوجيه الزوار وحساب المهل الزمنية وحجز جلسات العمل التنسيقية."
  }'::jsonb,
  '{
    "en": "Deploy AI Agent",
    "fr": "Déployer un Agent IA",
    "ar": "نشر وكيل الذكاء الاصطناعي"
  }'::jsonb,
  '[
    {"en": "Context-aware memory buffer via session IDs", "fr": "Mémoire contextuelle persistante par identifiant de session", "ar": "ذاكرة محادثة ذكية تحتفظ بسياق الزائر"},
    {"en": "Sanitized Markdown rendering with booking links", "fr": "Rendu Markdown sécurisé avec liens de réservation", "ar": "عرض منسق وآمن للنصوص وروابط حجز المواعيد"},
    {"en": "Fail-safe fallback to direct WhatsApp / Telegram", "fr": "Bascule de secours instantanée vers WhatsApp et Telegram", "ar": "تحويل فوري للتواصل عبر واتساب وتيليغرام عند الحاجة"}
  ]'::jsonb,
  true,
  true,
  5
),
(
  'api-cloud-integrations',
  'automation',
  'Network',
  '{
    "en": "Enterprise API & Cloud Integrations",
    "fr": "Intégrations API & Cloud d''Entreprise",
    "ar": "ربط واجهات برمجة التطبيقات والخدمات السحابية"
  }'::jsonb,
  '{
    "en": "Robust middleware connecting disparate software suites, payment processors, and cloud infrastructure.",
    "fr": "Middleware robuste connectant logiciels d''entreprise, processeurs de paiement et cloud.",
    "ar": "أنظمة وسيطة متينة لربط البرمجيات المختلفة وبوابات الدفع والخدمات السحابية العالمية."
  }'::jsonb,
  '{
    "en": "Seamlessly integrate Stripe, PayPal, Google Cloud, AWS, Telegram, and WhatsApp into unified data streams with real-time logging and monitoring.",
    "fr": "Intégrez Stripe, PayPal, Google Cloud, AWS, Telegram et WhatsApp dans des flux de données unifiés avec surveillance en direct.",
    "ar": "ربط متكامل لخدمات الدفع والرسائل الفورية والتخزين السحابي مع مراقبة حية لسلامة تدفق البيانات."
  }'::jsonb,
  '{
    "en": "Connect Systems",
    "fr": "Connecter les Systèmes",
    "ar": "ربط الأنظمة البرمجية"
  }'::jsonb,
  '[
    {"en": "Webhook signature verification & secret management", "fr": "Vérification des signatures webhook et gestion des secrets", "ar": "تحقق رقمي من مصداقية الرسائل وإدارة المفاتيح السرية"},
    {"en": "Automated data transformation pipelines", "fr": "Pipelines de transformation et nettoyage de données", "ar": "مسارات تحويل وتنسيق البيانات آلياً"},
    {"en": "Audit logging and retry buffers", "fr": "Journalisation d''audit et tampons de reprise", "ar": "سجلات تتبع كاملة ومخازن مؤقتة لضمان عدم ضياع أي طلب"}
  ]'::jsonb,
  false,
  true,
  6
)
ON CONFLICT (slug) DO UPDATE
SET
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  cta_label = EXCLUDED.cta_label,
  features = EXCLUDED.features,
  is_featured_home = EXCLUDED.is_featured_home,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- 4. PROJECTS (4 Comprehensive Case Studies)
INSERT INTO public.projects (
  slug,
  category,
  title,
  short_summary,
  problem_statement,
  solution_provided,
  results_achieved,
  tech_stack,
  cover_image_url,
  gallery_images,
  live_url,
  is_featured,
  is_published,
  display_order
)
VALUES
(
  'nexus-logistics-portal',
  'web_dev',
  '{
    "en": "Nexus B2B Supply Chain & Logistics Portal",
    "fr": "Nexus Portail B2B Logistique & Chaîne d''Approvisionnement",
    "ar": "بوابة نيكسوس اللوجستية لإدارة سلاسل الإمداد"
  }'::jsonb,
  '{
    "en": "High-throughput freight coordination portal handling 25,000+ monthly shipments with sub-second page loads.",
    "fr": "Portail de fret haute cadence gérant plus de 25 000 expéditions par mois avec un chargement instantané.",
    "ar": "بوابة لوجستية متطورة لتنسيق أكثر من 25,000 شحنة شهرياً مع سرعة استجابة فائقة."
  }'::jsonb,
  '{
    "en": "The client operated on a legacy PHP portal plagued by slow response times (4.8s LCP), frequent database deadlocks during peak inventory reconciliation, and zero mobile responsiveness for warehouse operators.",
    "fr": "Le client utilisait un portail PHP vieillissant avec des temps de réponse de 4,8s, des blocages de base de données en période de pointe et aucune ergonomie mobile.",
    "ar": "كان العميل يعاني من نظام قديم بطيء الاستجابة (أكثر من 4.8 ثانية) مع تكرار توقف قاعدة البيانات أثناء جرد البضائع وعدم ملاءمته لأجهزة الهواتف."
  }'::jsonb,
  '{
    "en": "Devyx re-architected the entire front and backend with Next.js 15, PostgreSQL, and on-demand ISR edge caching. We designed a clean blueprint UI with exposed grids, instantaneous live filtering, and offline-capable mobile views.",
    "fr": "Devyx a restructuré le système complet avec Next.js 15, PostgreSQL et mise en cache edge ISR. Nous avons créé une interface blueprint nette avec filtrage instantané.",
    "ar": "قامت ديفيكس بإعادة بناء النظام بالكامل عبر Next.js 15 وبوستجريس مع التخزين السحابي الفوري وواجهة هندسية دقيقة تعمل بكفاءة على كافة الأجهزة."
  }'::jsonb,
  '{
    "en": "Page load time reduced from 4.8s to 0.62s (87% improvement). Zero database downtime during peak month-end audits. Freight coordination processing velocity increased by 3.4x.",
    "fr": "Temps de chargement réduit de 4,8s à 0,62s (gain de 87%). Zéro panne lors des clôtures mensuelles. Vitesse de traitement multipliée par 3,4.",
    "ar": "انخفاض زمن تحميل الصفحات من 4.8 ثانية إلى 0.62 ثانية (تحسن بنسبة 87%)، وانعدام فترات التوقف، وزيادة سرعة معالجة الشحنات بمقدار 3.4 أضعاف."
  }'::jsonb,
  ARRAY['Next.js', 'PostgreSQL', 'Tailwind CSS', 'TypeScript', 'Supabase Storage']::text[],
  '/images/projects/nexus-cover.webp',
  ARRAY['/images/projects/nexus-1.webp', '/images/projects/nexus-2.webp', '/images/projects/nexus-3.webp']::text[],
  'https://nexus-demo.devyx.com',
  true,
  true,
  1
),
(
  'autonomous-lead-qualification-agent',
  'automation',
  '{
    "en": "Omni-Channel AI Lead Qualification Pipeline",
    "fr": "Pipeline d''Acquisition & Qualification IA Multi-Canal",
    "ar": "نظام الذكاء الاصطناعي المؤتمت لتأهيل واستقطاب العملاء"
  }'::jsonb,
  '{
    "en": "Autonomous n8n pipeline qualifying B2B enterprise leads 24/7 across website, WhatsApp, and Telegram.",
    "fr": "Pipeline n8n autonome qualifiant les prospects B2B 24/7 sur le site web, WhatsApp et Telegram.",
    "ar": "مسار عمل ذاتي عبر n8n لتأهيل واستقبال العملاء على مدار الساعة عبر الويب وواتساب وتيليغرام."
  }'::jsonb,
  '{
    "en": "A B2B agency was losing qualified international leads due to time-zone delays (average 14-hour first response time). Sales teams spent 40% of their work week manually screening unqualified inquiries.",
    "fr": "Une agence B2B perdait des prospects qualifiés en raison du décalage horaire (délai moyen de réponse de 14h) et passait 40% de son temps à filtrer les messages manuellement.",
    "ar": "كانت الشركة تفقد عملاء مهتمين بسبب تأخر الرد (متوسط 14 ساعة بسبب اختلاف التوقيت العالمي)، مع هدر 40% من وقت المبيعات في فرز الاستفسارات غير المؤهلة."
  }'::jsonb,
  '{
    "en": "Devyx developed an autonomous n8n agent integrated with OpenAI and Supabase. The agent engages prospects instantly in Arabic, French, or English, assesses project requirements and budgets, and automatically generates Calendly booking appointments.",
    "fr": "Devyx a créé un agent n8n autonome connecté à OpenAI et Supabase. L''agent engage immédiatement les prospects en arabe, français ou anglais et réserve des créneaux dans l''agenda.",
    "ar": "طورت ديفيكس وكيلاً ذكياً متكاملاً يتحدث بالعربية والفرنسية والإنجليزية، يحدد ميزانيات المشاريع ومتطلباتها ويحجز المواعيد في تقويم الفريق آلياً."
  }'::jsonb,
  '{
    "en": "First response time dropped from 14 hours to 4 seconds. Lead-to-discovery meeting conversion rate increased by 210%. Over 65 hours of manual screening saved every month.",
    "fr": "Temps de réponse réduit de 14h à 4 secondes. Taux de conversion rendez-vous augmenté de 210%. Plus de 65 heures de travail manuel économisées chaque mois.",
    "ar": "انخفض وقت الاستجابة الأولية من 14 ساعة إلى 4 ثوانٍ فقط، وارتفع معدل حجز المواعيد بنسبة 210% مع توفير أكثر من 65 ساعة عمل شهرياً."
  }'::jsonb,
  ARRAY['n8n', 'OpenAI', 'Supabase', 'WhatsApp Business API', 'Telegram API', 'Next.js']::text[],
  '/images/projects/leadbot-cover.webp',
  ARRAY['/images/projects/leadbot-1.webp', '/images/projects/leadbot-2.webp']::text[],
  NULL, -- Pure backend automation project without public URL
  true,
  true,
  2
),
(
  'zenith-crossplatform-fintech',
  'mobile_app',
  '{
    "en": "Zenith Multi-Currency Mobile Wallet",
    "fr": "Portefeuille Mobile Multi-Devises Zenith",
    "ar": "محفظة زينيث المالية متعددة العملات"
  }'::jsonb,
  '{
    "en": "Cross-platform mobile wallet supporting biometric security, instant peer-to-peer transfers, and offline balance caching.",
    "fr": "Portefeuille mobile multi-devises avec sécurité biométrique, transferts instantanés et solde hors-ligne.",
    "ar": "تطبيق محفظة مالية للهواتف الذكية يدعم الحماية البيومترية والتحويلات الفورية وعرض الأرصدة دون إنترنت."
  }'::jsonb,
  '{
    "en": "The client required a mobile payment solution that could function reliably in emerging markets with unstable cellular connectivity, while upholding strict financial security standards.",
    "fr": "Le client avait besoin d''une application de paiement fonctionnant de façon fiable dans des zones à connectivité instable tout en respectant des normes strictes de sécurité financière.",
    "ar": "احتاج العميل إلى حل مالي يعمل بثبات وموثوقية في بيئات اتصال متذبذبة مع الالتزام بأعلى معايير التشفير والأمان المالي."
  }'::jsonb,
  '{
    "en": "Devyx built a unified cross-platform mobile client with offline encrypted SQLite local caching, biometric authentication, and optimistic UI updates backed by Supabase PostgreSQL.",
    "fr": "Devyx a conçu une application mobile unifiée avec stockage local SQLite chiffré, authentification biométrique et synchronisation PostgreSQL sécurisée.",
    "ar": "قامت ديفيكس ببناء تطبيق جوال متطور بتقنية التخزين المحلي المشفر والمصادقة البيومترية والمزامنة الفورية مع قواعد البيانات."
  }'::jsonb,
  '{
    "en": "Over 120,000 active transactions executed within first 90 days. 99.99% transaction reliability with zero balance desynchronization reports.",
    "fr": "Plus de 120 000 transactions exécutées au cours des 90 premiers jours avec 99,99% de fiabilité et zéro anomalie de solde.",
    "ar": "تنفيذ أكثر من 120,000 معاملة ناجحة خلال أول 90 يوماً بنسبة استقرار بلغت 99.99% ودون أي خطأ في مطابقة الأرصدة."
  }'::jsonb,
  ARRAY['Flutter', 'Supabase Auth', 'PostgreSQL', 'SQLite', 'WebSockets']::text[],
  '/images/projects/zenith-cover.webp',
  ARRAY['/images/projects/zenith-1.webp', '/images/projects/zenith-2.webp', '/images/projects/zenith-3.webp']::text[],
  'https://zenith-app.devyx.com',
  true,
  true,
  3
),
(
  'enterprise-erp-synchronization',
  'automation',
  '{
    "en": "Enterprise ERP & E-Commerce Synchronization Engine",
    "fr": "Moteur de Synchronisation ERP & E-Commerce d''Entreprise",
    "ar": "محرك مزامنة أنظمة تخطيط الموارد والتجارة الإلكترونية"
  }'::jsonb,
  '{
    "en": "Resilient multi-node n8n engine synchronizing catalog inventory, sales orders, and invoices in real time.",
    "fr": "Moteur n8n multi-nœuds synchronisant en temps réel les stocks, commandes et factures.",
    "ar": "محرك n8n متعدد العقد لمزامنة المخزون والطلبات والفواتير بين منصة التجارة ونظام إدارة المؤسسة لحظياً."
  }'::jsonb,
  '{
    "en": "A multi-branch retail company faced stock desynchronization and overselling across their online store and brick-and-mortar ERP, leading to customer disputes and manual catalog reconciliation.",
    "fr": "Une entreprise de distribution subissait des ruptures de stock imprévues et des erreurs de commande entre sa boutique en ligne et son ERP physique.",
    "ar": "كانت شركة بيع بالتجزئة متعددة الفروع تعاني من تعارض بيانات المخزون بين المتجر الإلكتروني ونظام الفروع، مما تسبب في بيع سلع نافدة وتذمر العملاء."
  }'::jsonb,
  '{
    "en": "Devyx implemented an event-driven n8n pipeline with webhook ingest queues, batch deduplication, and PostgreSQL audit logging to guarantee zero dropped order events.",
    "fr": "Devyx a mis en place un pipeline n8n piloté par événements avec files d''attente, déduplication et journalisation PostgreSQL complète.",
    "ar": "صممت ديفيكس مساراً مؤتمتاً عبر n8n يعتمد على الأحداث الفورية مع منع تكرار الطلبات وتسجيل كافة العمليات في قاعدة البيانات بدقة تامة."
  }'::jsonb,
  '{
    "en": "Overselling rate dropped to 0%. Over 450,000 monthly SKU updates synchronized with sub-second latency across 8 regional warehouses.",
    "fr": "Taux de survente ramené à 0%. Plus de 450 000 mises à jour de stocks synchronisées chaque mois à travers 8 entrepôts régionaux.",
    "ar": "انعدام أخطاء بيع السلع غير المتوفرة (0%)، وتحديث أكثر من 450,000 حركة مخزون شهرياً في أجزاء من الثانية عبر 8 مستودعات إقليمية."
  }'::jsonb,
  ARRAY['n8n', 'PostgreSQL', 'REST APIs', 'Node.js', 'Docker']::text[],
  '/images/projects/erp-sync-cover.webp',
  ARRAY['/images/projects/erp-sync-1.webp', '/images/projects/erp-sync-2.webp']::text[],
  NULL, -- Internal ERP automation without public URL
  false,
  true,
  4
)
ON CONFLICT (slug) DO UPDATE
SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  short_summary = EXCLUDED.short_summary,
  problem_statement = EXCLUDED.problem_statement,
  solution_provided = EXCLUDED.solution_provided,
  results_achieved = EXCLUDED.results_achieved,
  tech_stack = EXCLUDED.tech_stack,
  cover_image_url = EXCLUDED.cover_image_url,
  gallery_images = EXCLUDED.gallery_images,
  live_url = EXCLUDED.live_url,
  is_featured = EXCLUDED.is_featured,
  is_published = EXCLUDED.is_published,
  display_order = EXCLUDED.display_order;

-- 5. SOCIAL MEDIA HUB (6 Pre-Seeded Channels)
INSERT INTO public.social_links (
  platform,
  url,
  display_handle,
  custom_label,
  is_active,
  display_order
)
VALUES
(
  'whatsapp',
  'https://wa.me/213000000000',
  '+213 Devyx Direct',
  '{"en": "WhatsApp Direct", "fr": "WhatsApp Direct", "ar": "واتساب المباشر"}'::jsonb,
  true,
  1
),
(
  'telegram',
  'https://t.me/devyx_official',
  '@devyx_official',
  '{"en": "Telegram Channel", "fr": "Canal Telegram", "ar": "قناة تيليغرام"}'::jsonb,
  true,
  2
),
(
  'messenger',
  'https://m.me/devyx',
  'devyx',
  '{"en": "Facebook Messenger", "fr": "Facebook Messenger", "ar": "فيسبوك ماسنجر"}'::jsonb,
  true,
  3
),
(
  'instagram',
  'https://instagram.com/devyx.tech',
  '@devyx.tech',
  '{"en": "Instagram Tech", "fr": "Instagram Tech", "ar": "إنستغرام التقني"}'::jsonb,
  true,
  4
),
(
  'tiktok',
  'https://tiktok.com/@devyx.tech',
  '@devyx.tech',
  '{"en": "TikTok Engineering", "fr": "TikTok Ingénierie", "ar": "تيك توك البرمجي"}'::jsonb,
  true,
  5
),
(
  'youtube',
  'https://youtube.com/@devyx',
  'Devyx Engineering',
  '{"en": "YouTube Channel", "fr": "Chaîne YouTube", "ar": "قناة يوتيوب"}'::jsonb,
  true,
  6
)
ON CONFLICT (platform) DO UPDATE
SET
  url = EXCLUDED.url,
  display_handle = EXCLUDED.display_handle,
  custom_label = EXCLUDED.custom_label,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;
