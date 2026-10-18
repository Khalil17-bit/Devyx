# Product Requirements Document (PRD): Devyx Platform & Headless CMS

| Metadata | Specification |
| :--- | :--- |
| **Product Name** | Devyx Corporate Platform, Custom Headless CMS & AI Qualification Engine |
| **Brand Name** | Devyx |
| **Document Version** | 1.1.0 (Production Release — Code-Free Specification) |
| **Target Infrastructure** | Vercel (Hobby Tier) + Supabase (Free Tier) + Self-Hosted/Cloud n8n |
| **Core Stack** | Next.js (App Router), TypeScript (Strict), Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), next-intl, next-themes |
| **Supported Locales** | Arabic (ar - RTL), French (fr - LTR), English (en - LTR) |

---

## 1. Project Overview & Core Objectives

### 1.1 Product Vision
Devyx is a multi-page B2B corporate platform representing a software development and workflow automation agency. The platform combines a high-performance, statically cached public frontend with a 100% custom-built Headless CMS (Admin Panel) and an n8n-powered AI Lead Qualification Chatbot.

### 1.2 Target Audience
Business owners, C-level executives, operations directors, and entrepreneurs seeking custom web applications, cross-platform mobile applications, and AI-driven business process automation.

### 1.3 Primary Business Objectives
1. **Visual Proof of Competence:** Showcase case studies, UI mockups, and backend automation architecture diagrams across a dedicated portfolio experience without relying on slow or fragile live iframes.
2. **Trilingual Market Reach:** Deliver a localized experience across Arabic, French, and English with automatic layout direction switching (RTL for Arabic, LTR for French and English).
3. **Automated Lead Qualification:** Engage visitors 24/7 via an AI chatbot that answers service inquiries, qualifies project budgets/timelines, and books discovery calls directly via rendered Markdown booking links.
4. **Omni-Channel Lead Capture:** Allow prospects to reach Devyx via a dynamic Social Media Hub or a database-backed Consultation Form that the Admin can toggle on or off globally with a single click.

---

## 2. Architectural Constraints & Free-Tier Hardening

Operating a dynamic CMS and AI proxy on Vercel Hobby and Supabase Free Tier requires strict architectural guardrails to avoid resource exhaustion, database pausing, and serverless timeouts:

### 2.1 Zero-SSR Public Architecture & On-Demand ISR
* **Strict Prohibition of Per-Request SSR:** Public pages must never query Supabase on every visitor page load. Runtime access to request headers, cookies, or dynamic search parameters inside public server components is strictly prohibited.
* **Infinite Static Caching:** All database queries for public pages are wrapped in Next.js Data Cache (`unstable_cache`) with infinite revalidation (`revalidate: false`) and granular cache tags.
* **Event-Driven Cache Invalidation:** The cache is purged and rebuilt exclusively when an authenticated Admin saves, updates, or deletes records in the Admin Panel via Next.js Server Actions triggering `revalidateTag` and `revalidatePath`.

### 2.2 Supabase Free-Tier Inactivity Mitigation
* **The Risk:** Because public visitors are served entirely from Vercel's Edge Cache, zero public page views hit the Supabase database. If no Admin logs in and no lead form is submitted for 7 consecutive days, Supabase automatically pauses Free Tier projects.
* **The Engineering Requirement:** Configure a daily Vercel Cron Job (running once every 24 hours at midnight UTC, within Vercel Hobby's cron allowance) that hits a secured internal keep-alive endpoint. This endpoint executes a lightweight single-row read against the `site_settings` table to maintain continuous database activity.

### 2.3 Serverless Execution Timeouts (Vercel Hobby)
* **The Risk:** Vercel Hobby defaults to a 10-second serverless function timeout, while n8n AI Agent workflows (involving LLM reasoning and calendar/CRM tool calls) can take 8 to 20 seconds.
* **The Engineering Requirement:** The Next.js `/api/chat` route must explicitly configure its maximum execution duration to 60 seconds (the maximum permitted on Vercel Hobby) and enforce a strict 55-second upstream request timeout when calling n8n so the server can return a structured fallback message before Vercel terminates the process.

### 2.4 Serverless-Safe Rate Limiting
* **The Risk:** In-memory rate limiters fail in serverless environments because memory is not shared across concurrent lambda instances or cold starts.
* **The Engineering Requirement:** Rate limiting for both the AI Chatbot (`/api/chat`) and the Consultation Form is enforced atomically inside PostgreSQL via a dedicated Security Definer RPC function (`check_rate_limit`) that tracks hashed client IP addresses over a sliding time window.

---

## 3. Internationalization (i18n) & Theme Specification

### 3.1 Routing & Locale Resolution
* **Sub-Path Routing:** All public pages are served under `/ar`, `/fr`, and `/en` sub-paths. Visiting the root path (`/`) automatically redirects the visitor to their preferred locale based on browser language negotiation, defaulting to English (`/en`) or French (`/fr`).
* **Static Route Generation:** Every public page pre-renders all three language variants at build and revalidation time using `generateStaticParams`.
* **Admin Panel Exclusion:** All `/admin` and `/api` routes bypass localization middleware. The Admin Panel interface is rendered strictly in English (LTR) while providing tabbed input fields to manage Arabic, French, and English content side by side.

### 3.2 Layout Direction (RTL / LTR) & Typography
* **Document Direction:** The root HTML container dynamically assigns `dir="rtl"` when the active locale is `ar`, and `dir="ltr"` when the active locale is `fr` or `en`.
* **Logical CSS Properties:** All styling must use CSS logical properties (such as inline-start and inline-end margins, paddings, borders, and text alignment) rather than physical left/right utilities so that UI components, chat widgets, and carousels mirror seamlessly in Arabic.
* **Typography Pairing:** Latin locales (`fr`, `en`) load geometric sans-serif variable fonts (such as Inter and Plus Jakarta Sans), while the Arabic locale (`ar`) conditionally loads a modern Arabic UI typeface (such as Cairo or IBM Plex Sans Arabic).

### 3.3 Theme Management
* **Persistent Dark & Light Modes:** Managed via `next-themes` using class-based switching, defaulting to Dark Mode with system preference detection enabled and local storage persistence.

---

## 4. Database Schema & Persistence Architecture (Supabase PostgreSQL)

All localized text fields across the database use a standardized JSONB structure containing keys for `ar`, `fr`, and `en`. An automatic fallback helper resolves missing translations by checking the active locale first, then falling back to English, French, and Arabic so the frontend never renders blank text.

### 4.1 Table Specifications

| Table Name | Primary Key | Purpose & Column Specifications |
| :--- | :--- | :--- |
| **site_settings** | `id` (Integer, constrained to `1`) | Singleton configuration row. Contains `brand_name` ("Devyx"), `enable_contact_form` (Boolean master toggle for the consultation form), `chatbot_enabled` (Boolean master toggle for the AI widget), `primary_cta_action` (Enum: open chat vs. navigate to contact), `contact_email`, and localized JSONB fields `seo_title` and `seo_description`. |
| **page_sections** | `section_key` (Text) | Stores editable promotional copy for every section across all public pages (`home_hero`, `home_why_us`, `services_header`, `projects_header`, `about_story`, `contact_header`). Contains localized JSONB columns for `badge_text`, `headline`, `subheadline`, `body_text`, `primary_cta_label`, `secondary_cta_label`, plus a `metadata_items` JSONB array for dynamic metrics and value propositions. |
| **services** | `id` (UUID) | Agency service offerings. Contains `slug` (Unique Text), `category` (Enum: `web_dev`, `mobile_app`, `automation`), `icon_name` (Lucide icon identifier), localized JSONB columns for `title`, `short_description`, `full_description`, `cta_label`, a `features` JSONB array of localized deliverable bullet points, `is_featured_home` (Boolean), `is_active` (Boolean), and `display_order` (Integer). |
| **projects** | `id` (UUID) | Portfolio case studies. Contains `slug` (Unique Text), `category` (Enum: `web_dev`, `mobile_app`, `automation`), localized JSONB columns for `title`, `short_summary`, `problem_statement`, `solution_provided`, and `results_achieved`. Also contains `tech_stack` (Text Array), `cover_image_url` (Text), `gallery_images` (Text Array of storage URLs), `live_url` (Nullable Text), `is_featured` (Boolean), `is_published` (Boolean), and `display_order` (Integer). |
| **social_links** | `id` (UUID) | Pre-seeded rows for `whatsapp`, `telegram`, `messenger`, `instagram`, `tiktok`, and `youtube`. Contains `platform` (Unique Enum), `url` (Text), `display_handle` (Text), localized `custom_label` (JSONB), `is_active` (Boolean), and `display_order` (Integer). |
| **leads** | `id` (UUID) | Direct consultation inquiries. Contains `full_name` (Text, 2–120 chars), `phone` (Text, 6–30 chars), `state_province` (Text, 2–100 chars), `service_type` (Text), `message` (Text, 10–3000 chars), `locale` (`ar`, `fr`, `en`), `status` (Enum: `new`, `contacted`, `qualified`, `closed`, `spam`), `admin_notes` (Nullable Text), `n8n_synced` (Boolean), `ip_hash` (Text), and `created_at` (Timestamp). |
| **api_rate_limits** | `key` (Text) | Tracks sliding-window request counts per hashed IP address and endpoint prefix (`chat:` or `lead:`). Contains `request_count` (Integer) and `window_start` (Timestamp). |

### 4.2 Row-Level Security (RLS) & Storage Rules
1. **Public Read Access:** Anonymous read access (`SELECT`) is granted on `site_settings`, `page_sections`, active `services`, published `projects`, and active `social_links` strictly to support static build and ISR cache revalidation.
2. **Public Lead Insertion Guard:** Anonymous `INSERT` on the `leads` table is permitted only when a database-level check confirms `site_settings.enable_contact_form` is `true`. Anonymous users have zero `SELECT`, `UPDATE`, or `DELETE` privileges on `leads`.
3. **Admin Full Control:** Only authenticated Supabase Admin users hold full CRUD privileges across all tables.
4. **Supabase Storage Bucket (`devyx-media`):** Configured as a public-read bucket restricting file uploads, updates, and deletions strictly to authenticated Admins. Enforces a 5 MB per-file limit and restricts MIME types to modern image formats (`webp`, `png`, `jpeg`, `avif`, `svg`).

---

## 5. Multi-Page Public Frontend Specifications

Every headline, sub-headline, promotional paragraph, metric, and CTA button across the four core pages is dynamically populated from the cached `page_sections` and entity tables in all three languages.

### 5.1 Home Page (`/[locale]`)
* **Hero Section:** Displays localized badge, headline, and sub-headline from `home_hero`. Features a Primary CTA button (which either opens the AI Chatbot widget or navigates to the Contact page, depending on the Admin's global setting) and a Secondary CTA button linking to `/[locale]/projects`.
* **Services Overview:** Displays a responsive grid of featured services (`is_featured_home = true` and `is_active = true`), showing each service's icon, localized title, short description, and a link to its detailed section on the Services page.
* **Featured Projects:** Displays a curated grid of top portfolio items (`is_featured = true` and `is_published = true`). Clicking any card opens the rich Project Detail Modal.
* **Value Proposition / Why Us Section:** Renders localized agency differentiators and quantitative impact metrics (such as hours saved, workflows automated, and delivery velocity) managed via `home_why_us`.

### 5.2 Services Page (`/[locale]/services`)
* **Core Pillars Breakdown:** Presents a comprehensive breakdown of Devyx's core offerings across Web Applications, Mobile Applications, and Workflow & AI Automation.
* **Service Cards:** Each active service renders its custom icon or illustration, localized title, comprehensive multi-paragraph description, localized list of key deliverables/features, and a service-specific CTA button.
* **Contextual Action:** Clicking a service CTA either navigates to `/[locale]/contact` with that service pre-selected in the form dropdown (if the contact form is enabled) or opens the AI Chatbot pre-populated with an inquiry about that specific service (if the contact form is disabled).

### 5.3 Portfolio / Projects Page (`/[locale]/projects`)
* **Interactive Category Filtering:** Instant client-side filtering tabs for **All**, **Web Development**, **Mobile Apps**, and **Automation**. Because all published projects are pre-cached via ISR, switching tabs filters the grid instantaneously with zero database queries.
* **Visual Card Display (No Live Iframes):** Each project is presented as a high-conversion visual card featuring a 16:10 optimized cover image, localized title, category badge, 3-line summary, and top technology stack tags.
* **Project Detail Modal:** Clicking any project card opens an accessible, shareable modal containing:
  * **Interactive Image Gallery / Slider:** Supports multiple high-resolution screenshots, mobile UI mockups, or before/after n8n automation architecture diagrams. Includes thumbnail navigation, RTL-aware swipe and keyboard controls, and full-screen lightbox zoom so prospects can inspect technical diagrams clearly.
  * **Structured Case Study Breakdown:** Three distinct localized sections detailing **The Problem**, **The Solution & Architecture**, and **Measurable Results**.
  * **Tech Stack Tags:** Complete list of technologies, frameworks, and AI models utilized (e.g., Next.js, n8n, Supabase, Flutter, OpenAI).
  * **Conditional External Link:** A "Visit Live Project" button that renders **only** when the project record contains a non-empty `live_url`. For internal backend automations or private mobile apps without a public URL, the button is completely omitted from the interface.

### 5.4 About & Contact Page (`/[locale]/contact`)
* **Agency Story & Vision:** Renders Devyx's localized company background, engineering philosophy, and mission statement from `about_story`.
* **Dynamic Social Media Hub:** Displays a grid of direct communication cards for **WhatsApp, Telegram, Messenger, Instagram, TikTok, and YouTube**. Only platforms marked as `is_active = true` in the Admin Panel are rendered. If an Admin disables a platform, it disappears across all locales immediately upon revalidation.
* **Toggleable Consultation / Lead Capture Form:**
  * **Global Visibility Switch:** Controlled entirely by `site_settings.enable_contact_form`. When toggled off by the Admin, the form section is completely unmounted from the page layout.
  * **Form Fields:**
    1. **Full Name** (`full_name` — required, 2 to 120 characters)
    2. **Phone Number** (`phone` — required, validated international/local phone format)
    3. **State / Province** (`state_province` — required, 2 to 100 characters)
    4. **Requested Service Type** (`service_type` — dropdown dynamically populated from active services)
    5. **Project Details** (`message` — required, 10 to 3000 characters)
  * **Submission Pipeline:** Validated on both client and server, protected by a hidden honeypot field and IP rate limiting (max 3 submissions per 10 minutes). Saves the lead directly to the `leads` table in Supabase first, and then asynchronously forwards the lead payload to an optional n8n notification webhook for instant team alerting.

---

## 6. Custom Headless CMS (Admin Panel `/admin`) Specification

### 6.1 Authentication & Access Control
* **Authentication Provider:** Supabase Auth using Email and Password. Public sign-ups are disabled at the infrastructure level; only pre-provisioned Admin accounts can authenticate.
* **Route Protection:** Next.js Middleware intercepts all `/admin` routes, validates the active Supabase session token via secure HTTP-only cookies, and redirects unauthenticated users to `/admin/login`.

### 6.2 Admin Functional Modules
1. **Dashboard & Master Switches (`/admin/dashboard`):** Displays lead conversion metrics, unread lead counts, total published projects, and features two instant 1-click toggle switches: **Enable Public Contact Form** (`enable_contact_form`) and **Enable AI Chatbot Widget** (`chatbot_enabled`).
2. **Page Copy & Hero Editor (`/admin/content`):** Allows editing of every headline, sub-headline, CTA label, about story paragraph, and numeric agency metric across Arabic, French, and English using clean language tabs.
3. **Services Manager (`/admin/services`):** Full CRUD interface for agency services with drag-and-drop display ordering, icon selection, trilingual descriptions, deliverable bullet-point builders, and active/featured toggles.
4. **Projects & Case Studies Manager (`/admin/projects`):** Full CRUD interface for portfolio items. Includes a trilingual case study editor (Problem, Solution, Results), technology tag input, optional live URL input, Featured/Published toggles, and a drag-and-drop multi-image gallery uploader.
5. **Social Hub Manager (`/admin/socials`):** Central control panel for WhatsApp, Telegram, Messenger, Instagram, TikTok, and YouTube links. Admins can update URLs, handles, and toggle `is_active` on or off per channel.
6. **Leads CRM (`/admin/leads`):** Filterable table of all consultation form submissions. Admins can filter by status (`new`, `contacted`, `qualified`, `closed`, `spam`), inspect full project details, record internal admin notes, initiate 1-click WhatsApp or phone follow-ups, and export leads to CSV.

### 6.3 Media Compression & Storage Hygiene
To preserve the 1 GB Supabase Free Tier storage quota:
* All project cover images and gallery screenshots uploaded through the Admin Panel are automatically compressed and converted to WebP format (maximum dimension 1920px, 85% quality) in the browser prior to upload.
* Deleting a project or removing an image from a project's gallery in the Admin Panel automatically triggers a storage cleanup action that permanently deletes the corresponding image files from the `devyx-media` bucket.

### 6.4 Cache Revalidation Matrix

| Admin Mutation Performed | Cache Tag Invalidated | Public Routes Revalidated |
| :--- | :--- | :--- |
| Update Global Settings or Form/Chat Toggles | `cms:site_settings` | All `/ar`, `/fr`, `/en` layouts and `/[locale]/contact` |
| Update Page Headlines, CTAs, Why Us, or About Copy | `cms:page_content` | `/[locale]`, `/[locale]/services`, `/[locale]/projects`, `/[locale]/contact` |
| Create, Update, Reorder, or Delete a Service | `cms:services` | `/[locale]` and `/[locale]/services` |
| Create, Update, Reorder, or Delete a Project | `cms:projects` | `/[locale]` and `/[locale]/projects` |
| Toggle or Update a Social Media Channel | `cms:social_links` | All `/ar`, `/fr`, `/en` footers and `/[locale]/contact` |
| Update Lead Status or Admin Notes | *None* | *No public revalidation needed (Admin-only data)* |

---

## 7. AI Chatbot & Secure n8n Proxy Architecture

### 7.1 Floating Chat Widget (Frontend UI)
* **Global Availability:** Accessible from a floating launcher button across all public pages (positioned bottom-right in LTR locales and automatically mirrored to bottom-left in Arabic RTL).
* **Session Persistence:** Generates a unique UUID v4 `sessionId` on the visitor's first interaction and persists both the `sessionId` and message history in `localStorage` so conversations survive page navigation and refreshes.
* **Sanitized Markdown Rendering:** Bot responses are rendered with full Markdown support (bold text, bulleted lists, numbered steps, and clickable appointment booking links) and sanitized against XSS injection. All external links rendered inside chat bubbles open safely in a new browser tab.
* **Resilience States:** Includes an animated typing indicator while awaiting responses, input locking during in-flight requests to prevent double-sending, and an inline **Retry** button if a message fails due to network drop or timeout.

### 7.2 Backend Security Proxy (`/api/chat`)
* **Zero Client Exposure:** The n8n Webhook URL and authentication credentials are kept strictly on the server as private environment variables and are never exposed to the browser bundle.
* **Proxy Validation Pipeline:**
  1. Validates the request `Origin` header against the configured production domain.
  2. Validates the incoming JSON payload structure and enforces a maximum message length of 1,500 characters.
  3. Hashes the caller's IP address using SHA-256 with a server-side salt and invokes the `check_rate_limit` database RPC (enforcing a maximum of 20 messages per 5-minute window per IP).
  4. Attaches the `x-n8n-secret` authentication header and forwards the request to the upstream n8n webhook with a 55-second timeout.
  5. Returns the sanitized AI reply to the browser client.

### 7.3 Website-to-n8n API Contract

#### Outbound Request (Next.js `/api/chat` to n8n Webhook)
* **HTTP Method:** `POST`
* **Required Headers:**
  * `Content-Type`: `application/json`
  * `x-n8n-secret`: Secret token matching `process.env.N8N_WEBHOOK_SECRET`
* **JSON Body Attributes:**
  * `sessionId`: Valid UUID v4 string identifying the visitor's conversation memory buffer in n8n.
  * `message`: Sanitized user message text (1 to 1,500 characters).
  * `language`: Active locale code (`ar`, `fr`, or `en`) so the AI agent responds in the visitor's language.
  * `currentPage`: Current URL pathname (e.g., `/ar/projects` or `/en/services`) to give the AI agent page-level context.

#### Inbound Response (n8n Webhook to Next.js `/api/chat`)
* **HTTP Status:** `200 OK`
* **JSON Body Attributes:**
  * `reply`: Markdown-formatted string generated by the n8n AI Agent (containing qualification questions, service explanations, or clickable appointment booking URLs).
  * `sessionId`: Echoed UUID v4 string confirming session continuity.

---

## 8. Edge Cases & Failure Mode Handling

| Scenario / Edge Case | System Behavior & Mitigation |
| :--- | :--- |
| **Incomplete Translation in Admin Panel** | If an Admin leaves a French or Arabic field blank while saving a project or section, the frontend localization helper automatically falls back to the English value (or the next populated locale) so visitors never encounter raw JSON keys or empty containers. |
| **Backend Automation Project Without a Public URL** | Many n8n workflow and mobile app projects do not have public websites. When `live_url` is left empty in the Admin Panel, the "Visit Live Project" button is completely omitted, and the modal highlights the architecture diagram slider and case study metrics instead. |
| **Visitor Submits Contact Form After Admin Disables It** | If a visitor had the `/contact` page open before the Admin toggled `enable_contact_form` to `false`, both the Server Action and the PostgreSQL RLS policy reject the submission and display a localized notification directing the visitor to the AI Chatbot or Social Media Hub. |
| **n8n Server Downtime or Timeout** | If the n8n webhook returns an error or exceeds 55 seconds, `/api/chat` returns a localized fallback message inside the chat window offering direct 1-click links to Devyx's active WhatsApp and Telegram channels, ensuring no lead is lost. |
| **Spam Bot Flood on Chat or Lead Form** | The PostgreSQL `check_rate_limit` RPC blocks excessive requests per hashed IP (429 Too Many Requests) before invoking n8n (protecting LLM token budgets) or inserting into the `leads` table. |