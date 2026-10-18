# Devyx — Supabase Production Setup Guide

This guide details the step-by-step procedure to deploy the database schema, Security Definer rate-limiting functions, Row-Level Security (RLS) policies, storage buckets, and trilingual seed data on a production Supabase instance.

---

## 1. Create Supabase Project

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project** and select your organization.
3. Configure the project parameters:
   - **Name:** `Devyx-Production`
   - **Database Password:** Generate and securely store a high-entropy password.
   - **Region:** Select the region closest to your target audience (e.g., `eu-west-3` Paris or `eu-central-1` Frankfurt).
   - **Pricing Plan:** Free Tier (fully supported by our daily Keep-Alive cron).

---

## 2. Retrieve Production Credentials

In your Supabase project dashboard, navigate to **Project Settings** $\rightarrow$ **API**:

| Key Name | Location | Usage in Devyx |
| :--- | :--- | :--- |
| **Project URL** | Project Settings $\rightarrow$ Data API $\rightarrow$ URL | `NEXT_PUBLIC_SUPABASE_URL` |
| **Anon Public Key** | Project Settings $\rightarrow$ Data API $\rightarrow$ `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Service Role Key** | Project Settings $\rightarrow$ Data API $\rightarrow$ `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` *(Server-only)* |

> [!CAUTION]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components or prefix it with `NEXT_PUBLIC_`. It bypasses all Row-Level Security policies.

---

## 3. Deploy Database Migrations

Open the **SQL Editor** in the Supabase Dashboard and execute the SQL scripts in numerical order:

### Step 3.1: Initial Schema, RLS & Rate-Limiter RPC
Copy the entire contents of [`supabase/migrations/001_initial_schema.sql`](file:///e:/Devyx/supabase/migrations/001_initial_schema.sql) and execute it in the SQL Editor.

This script provisions:
- Custom PostgreSQL Enums: `service_category`, `project_category`, `social_platform`, `lead_status`, `primary_cta_action`.
- Tables with constraints: `site_settings`, `page_sections`, `services`, `projects`, `social_links`, `leads`, `api_rate_limits`.
- **Atomic Sliding-Window Rate Limiting Function:**
  ```sql
  CREATE OR REPLACE FUNCTION check_rate_limit(
      p_key text,
      p_max_requests int,
      p_window_seconds int
  ) RETURNS boolean ...
  ```
- **Row-Level Security (RLS):** Enabled on all 7 tables with anonymous `SELECT` on public content and restricted `INSERT` on `leads` gated by `site_settings.enable_contact_form`.

### Step 3.2: Storage Bucket & Upload Policies
Copy the entire contents of [`supabase/migrations/002_storage_setup.sql`](file:///e:/Devyx/supabase/migrations/002_storage_setup.sql) and execute it.

This script provisions:
- Storage bucket: `devyx-media` (Public read enabled).
- Max file size limit: 5 MB (`5242880` bytes).
- Permitted MIME types: `image/webp`, `image/png`, `image/jpeg`, `image/avif`, `image/svg+xml`.
- Storage policies: Public read for all visitors; Insert/Update/Delete strictly restricted to authenticated Admins.

---

## 4. Seed Initial Trilingual Content

Copy the entire contents of [`supabase/seed.sql`](file:///e:/Devyx/supabase/seed.sql) and execute it in the SQL Editor.

This seeds:
- Singleton `site_settings` configuration.
- 6 complete trilingual `page_sections` (`home_hero`, `home_why_us`, `services_header`, `projects_header`, `about_story`, `contact_header`).
- 3 foundational agency `services` (Web Platform Architecture, Cross-Platform Mobile Apps, Autonomous n8n Pipelines) with deliverable feature points.
- 4 comprehensive portfolio `projects` with 3-part case studies (Problem, Solution, Results) and tech stack arrays.
- 6 active direct `social_links` (WhatsApp, Telegram, Messenger, Instagram, TikTok, YouTube).

---

## 5. Provision Admin User for Headless CMS

1. In Supabase Dashboard, navigate to **Authentication** $\rightarrow$ **Users**.
2. Click **Add User** $\rightarrow$ **Create User**.
3. Enter the administrator credentials:
   - **Email:** e.g., `admin@devyx.com` (or your personal admin email)
   - **Password:** A strong administrative password.
   - **Auto Confirm User:** Checked (Yes).
4. In **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**:
   - Ensure Email provider is enabled.
   - Disable **Confirm email** if you want immediate access, or configure production SMTP.

---

## 6. Verify Database & Storage Setup

Run this diagnostic query in the SQL Editor to verify all components are active:

```sql
SELECT 
    (SELECT count(*) FROM site_settings) as settings_count,
    (SELECT count(*) FROM page_sections) as sections_count,
    (SELECT count(*) FROM services) as services_count,
    (SELECT count(*) FROM projects) as projects_count,
    (SELECT count(*) FROM social_links) as socials_count,
    (SELECT count(*) FROM storage.buckets WHERE id = 'devyx-media') as bucket_count;
```

**Expected Result:**
```
settings_count: 1
sections_count: 6
services_count: 3
projects_count: 4
socials_count:  6
bucket_count:   1
```
