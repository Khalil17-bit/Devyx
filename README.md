# Devyx — High-Performance Web & Workflow Automation Agency

> **Deterministic Architecture. Autonomous Workflows. Zero Fluff.**

Devyx is a production-grade digital agency platform engineering mission-critical web platforms, cross-platform mobile apps, and self-hosted n8n automation pipelines. Built strictly in adherence with the **Anti-AI Blueprint Design System** ([`Design.md`](file:///e:/Devyx/Design.md)) and the comprehensive technical specification ([`PRD.md`](file:///e:/Devyx/PRD.md)).

---

## ⚡ Architectural Highlights

1. **Zero-SSR Public Performance:**
   - Public pages across Arabic (`/ar` - RTL), French (`/fr` - LTR), and English (`/en` - LTR) are pre-rendered into static HTML at build time (`generateStaticParams`).
   - Data fetching uses Next.js `unstable_cache` with `revalidate: false` and granular cache tags (`cms:site_settings`, `cms:page_content`, `cms:services`, `cms:projects`, `cms:social_links`).
   - Serves 100% of public page views directly from Vercel's global Edge CDN with sub-50ms TTFB and zero database load.

2. **Strict Anti-AI Blueprint Aesthetic:**
   - **Zero Floating Blur Orbs:** Replaced by exposed 1px technical blueprint rails and 8×8px crosshairs (`+`).
   - **Zero Gradient Text Clips:** High-contrast solid typography with WCAG AA compliance.
   - **Mechanical Chamfers:** 45-degree chamfered geometry (`.clip-chamfer`) on buttons and interactive elements, automatically mirroring between LTR and RTL.
   - **Mechanical Theme Switcher:** Dual-state hardware switch `[ DARK // LIGHT ]`.

3. **Secure Consultation Ingest Pipeline:**
   - Client and server-side Zod validation with phone international regex and province parameters.
   - Invisible anti-spam honeypot input field: automatically traps automated crawlers with a silent 200 OK simulated response.
   - Atomic sliding-window rate limiting in PostgreSQL (`check_rate_limit` RPC): maximum 3 submissions per 10 minutes per hashed IP.
   - Confirmation modal with instant 1-click WhatsApp priority follow-up.

4. **Hardened AI Chatbot & n8n Serverless Proxy (`/api/chat`):**
   - Floating widget with CSS logical properties (`bottom-6 end-6`), automatically mirroring in Arabic RTL (bottom-left) and Latin LTR (bottom-right).
   - Session persistence via UUID v4 and `localStorage`.
   - Vercel execution configured to `maxDuration = 60;` with a strict 55-second upstream timeout to prevent serverless drops.
   - Atomic rate limiting (20 messages / 5-min sliding window).
   - Resilient fallback returning direct WhatsApp and Telegram links on upstream outage or timeout.

5. **Supabase Free-Tier Inactivity Keep-Alive Cron:**
   - Scheduled via [`vercel.json`](file:///e:/Devyx/vercel.json) to trigger daily at midnight UTC (`0 0 * * *`).
   - Authorizes requests via `CRON_SECRET` and executes a lightweight single-row read on `site_settings` to maintain database activity and prevent Supabase's 7-day auto-pause.

6. **Custom Headless CMS (`/admin`):**
   - Strictly English LTR control room interface protected by Supabase Auth and Next.js middleware.
   - **1-Click Master Switches:** Instant circuit breakers for `enable_contact_form`, `chatbot_enabled`, and Primary CTA routing.
   - **Page Copy Editor:** Side-by-side trilingual editing for all 6 sections and dynamic quantitative metrics.
   - **Services Manager:** Full CRUD with Lucide icons, order indexing, and deliverable bullet builders.
   - **Projects Manager:** Trilingual 3-part case study editor, tech stack pills, and in-browser Canvas WebP image compression (max 1920px, 85% quality) to preserve the 1 GB Supabase quota.
   - **Social Hub:** Instant toggle and handle updates for WhatsApp, Telegram, Messenger, Instagram, TikTok, and YouTube.
   - **Leads CRM:** Filterable inquiry table, status updater, internal engineering notes, CSV export, and 1-click WhatsApp follow-up.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Zero-SSR Edge Caching)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 3, CSS Logical Properties, Blueprint Design System
- **Database & Auth:** Supabase PostgreSQL, Row-Level Security (RLS), Supabase Storage
- **Internationalization:** `next-intl` (Sub-path routing: `/ar`, `/fr`, `/en`)
- **Validation:** Zod 3
- **Automation:** n8n Webhook Integration
- **Typography:** Google Variable Fonts (Space Grotesk, Plus Jakarta Sans, IBM Plex Sans Arabic, JetBrains Mono)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm 10+
- A Supabase account (Free Tier supported)

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# n8n AI Chatbot & Notifications
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/chat
N8N_WEBHOOK_SECRET=your-n8n-auth-secret
N8N_LEAD_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/leads

# Security & Infrastructure
CRON_SECRET=your-high-entropy-cron-secret
RATE_LIMIT_SALT=your-high-entropy-ip-hashing-salt
NEXT_PUBLIC_SITE_URL=https://devyx.com
```

### 3. Database Deployment
Follow the step-by-step instructions in [`docs/supabase-setup.md`](file:///e:/Devyx/docs/supabase-setup.md) to apply the database migrations, RLS policies, storage bucket, and trilingual seed data.

### 4. Install Dependencies & Run Locally

```bash
# Install packages
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Verification

```bash
# 1. Automated E2E Verification Suite (Localization, Anti-AI CSS, Honeypot, Schemas)
npx tsx scripts/verify-e2e.ts

# 2. Strict TypeScript Type Check
npx tsc --noEmit

# 3. Static Code Analysis & Linting
npm run lint

# 4. Production Build & Static Route Pre-rendering
npm run build
```

---

## 📁 Repository Structure

```
Devyx/
├── actions/                  # Next.js Server Actions (Auth, CMS, Lead Ingest)
├── app/
│   ├── [locale]/             # Public Trilingual Routes (Home, Services, Projects, Contact)
│   ├── admin/                # Headless CMS Control Room (/admin)
│   ├── api/
│   │   ├── chat/             # Hardened n8n AI Chatbot Proxy
│   │   └── cron/keep-alive/  # Free-Tier Database Inactivity Keep-Alive Cron
│   ├── globals.css           # Blueprint Design System & CSS Variables
│   └── layout.tsx            # Root Server Layout
├── components/
│   ├── admin/                # CMS Components (Shell, Toggles, Editors, CRM)
│   ├── brand/                # Technical Logo with animated SVG ribbon
│   ├── chat/                 # Floating AI Qualification Chatbot Widget
│   ├── contact/              # Lead Ingest Form & Social Media Hub
│   ├── layout/               # Navbar, Footer, Theme Switcher, Locale Switcher
│   ├── projects/             # Portfolio Grid, Case Study Modal, Lightbox
│   ├── services/             # Service Cards & Pillar Breakdown
│   └── ui/                   # Chamfered Buttons, Cards, Dialogs, Automation Pipeline
├── docs/                     # Production Setup & Walkthrough Guides
├── i18n/                     # next-intl Routing Configuration
├── lib/                      # Database clients, Fonts, Localization, Validation
├── messages/                 # Trilingual UI Strings (ar.json, fr.json, en.json)
├── scripts/                  # E2E Automated Verification Test Suite
├── supabase/                 # PostgreSQL Migrations, Storage & Seed Scripts
└── vercel.json               # Daily Keep-Alive Cron Schedule
```

---

## 🔒 Security & Privacy Invariants

- **GDPR-Compliant IP Anonymization:** Client IP addresses are never stored in raw form; all rate-limiting entries use SHA-256 hashes combined with a server-side salt.
- **Strict Row-Level Security:** Anonymous visitors have zero `SELECT`, `UPDATE`, or `DELETE` access to the `leads` table. Insertion is dynamically restricted by the `site_settings.enable_contact_form` database flag.
- **Zero Client Credential Leakage:** Upstream n8n webhook URLs, secrets, and Supabase service role keys reside strictly in serverless runtime environments and are never bundled into client JavaScript.
