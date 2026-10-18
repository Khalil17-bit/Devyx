-- ==============================================================================
-- Devyx Platform & Headless CMS — Migration 001: Initial Schema & RLS
-- Adheres to Supabase Postgres Best Practices (security-rls-performance, schema-constraints)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE service_category AS ENUM ('web_dev', 'mobile_app', 'automation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_category AS ENUM ('web_dev', 'mobile_app', 'automation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM ('whatsapp', 'telegram', 'messenger', 'instagram', 'tiktok', 'youtube');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'closed', 'spam');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE primary_cta_action AS ENUM ('open_chat', 'navigate_contact');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- 3.1 site_settings (Singleton row, id constrained to 1)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  brand_name text NOT NULL DEFAULT 'Devyx',
  enable_contact_form boolean NOT NULL DEFAULT true,
  chatbot_enabled boolean NOT NULL DEFAULT true,
  primary_cta_action primary_cta_action NOT NULL DEFAULT 'open_chat',
  contact_email text NOT NULL DEFAULT 'contact@devyx.com',
  seo_title jsonb NOT NULL DEFAULT '{"en": "Devyx — Web Development & Workflow Automation", "fr": "Devyx — Développement Web & Automatisation des Workflows", "ar": "ديفيكس — تطوير الويب وأتمتة مسارات العمل"}'::jsonb,
  seo_description jsonb NOT NULL DEFAULT '{"en": "High-performance web architecture, cross-platform mobile apps, and autonomous n8n workflows.", "fr": "Architecture web haute performance, applications mobiles et workflows n8n autonomes.", "ar": "بنية ويب عالية الأداء وتطبيقات الهاتف ومسارات عمل n8n ذاتية التشغيل."}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

-- 3.2 page_sections (Promotional copy for every page section in ar, fr, en)
CREATE TABLE IF NOT EXISTS public.page_sections (
  section_key text PRIMARY KEY,
  badge_text jsonb NOT NULL DEFAULT '{}'::jsonb,
  headline jsonb NOT NULL DEFAULT '{}'::jsonb,
  subheadline jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_text jsonb NOT NULL DEFAULT '{}'::jsonb,
  primary_cta_label jsonb NOT NULL DEFAULT '{}'::jsonb,
  secondary_cta_label jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.3 services (Agency service offerings)
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category service_category NOT NULL,
  icon_name text NOT NULL DEFAULT 'Code2',
  title jsonb NOT NULL DEFAULT '{}'::jsonb,
  short_description jsonb NOT NULL DEFAULT '{}'::jsonb,
  full_description jsonb NOT NULL DEFAULT '{}'::jsonb,
  cta_label jsonb NOT NULL DEFAULT '{}'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured_home boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.4 projects (Portfolio case studies)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category project_category NOT NULL,
  title jsonb NOT NULL DEFAULT '{}'::jsonb,
  short_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  problem_statement jsonb NOT NULL DEFAULT '{}'::jsonb,
  solution_provided jsonb NOT NULL DEFAULT '{}'::jsonb,
  results_achieved jsonb NOT NULL DEFAULT '{}'::jsonb,
  tech_stack text[] NOT NULL DEFAULT '{}'::text[],
  cover_image_url text NOT NULL DEFAULT '',
  gallery_images text[] NOT NULL DEFAULT '{}'::text[],
  live_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.5 social_links (Social media hub)
CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform social_platform NOT NULL UNIQUE,
  url text NOT NULL DEFAULT '',
  display_handle text NOT NULL DEFAULT '',
  custom_label jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.6 leads (Consultation inquiries)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 120),
  phone text NOT NULL CHECK (char_length(phone) >= 6 AND char_length(phone) <= 30),
  state_province text NOT NULL CHECK (char_length(state_province) >= 2 AND char_length(state_province) <= 100),
  service_type text NOT NULL,
  message text NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 3000),
  locale text NOT NULL CHECK (locale IN ('ar', 'fr', 'en')),
  status lead_status NOT NULL DEFAULT 'new',
  admin_notes text,
  n8n_synced boolean NOT NULL DEFAULT false,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.7 api_rate_limits (Atomic sliding window rate limiting)
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key text PRIMARY KEY,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);

-- 4. PERFORMANCE & FILTER INDEXES (Per Supabase Postgres Best Practices)
CREATE INDEX IF NOT EXISTS idx_services_display ON public.services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(is_featured_home) WHERE is_featured_home = true;

CREATE INDEX IF NOT EXISTS idx_projects_display ON public.projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);

CREATE INDEX IF NOT EXISTS idx_social_links_active ON public.social_links(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_social_links_display ON public.social_links(display_order);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.api_rate_limits(window_start);

-- 5. ATOMIC RATE LIMITING RPC (SECURITY DEFINER, with fixed search_path)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max_requests int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count int;
  v_window_start timestamptz;
  v_now timestamptz := clock_timestamp();
  v_window_interval interval := (p_window_seconds || ' seconds')::interval;
BEGIN
  -- Insert or select current counter
  INSERT INTO public.api_rate_limits (key, request_count, window_start)
  VALUES (p_key, 1, v_now)
  ON CONFLICT (key) DO UPDATE
  SET
    request_count = CASE
      WHEN clock_timestamp() - public.api_rate_limits.window_start > (p_window_seconds || ' seconds')::interval THEN 1
      ELSE public.api_rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN clock_timestamp() - public.api_rate_limits.window_start > (p_window_seconds || ' seconds')::interval THEN clock_timestamp()
      ELSE public.api_rate_limits.window_start
    END
  RETURNING request_count, window_start INTO v_count, v_window_start;

  -- Verify counter threshold
  IF v_count > p_max_requests THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- 6. PERMISSIONS & DATA API GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public tables accessible via REST for static caching & ISR
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.page_sections TO anon, authenticated;
GRANT SELECT ON public.services TO anon, authenticated;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.social_links TO anon, authenticated;

-- Lead submission access
GRANT INSERT ON public.leads TO anon, authenticated;

-- Admin full access across all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RPC execution permissions
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, int, int) TO anon, authenticated;

-- 7. ROW-LEVEL SECURITY (RLS) POLICIES
-- Uses TO authenticated / TO anon and (select auth.uid()) optimization

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- 7.1 site_settings Policies
CREATE POLICY "Public read site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin update site_settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 7.2 page_sections Policies
CREATE POLICY "Public read page_sections"
  ON public.page_sections
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin modify page_sections"
  ON public.page_sections
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 7.3 services Policies
CREATE POLICY "Public read active services"
  ON public.services
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Admin read all services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Admin modify services"
  ON public.services
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 7.4 projects Policies
CREATE POLICY "Public read published projects"
  ON public.projects
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Admin read all projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Admin modify projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 7.5 social_links Policies
CREATE POLICY "Public read active social links"
  ON public.social_links
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Admin read all social links"
  ON public.social_links
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Admin modify social links"
  ON public.social_links
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 7.6 leads Policies
-- Anonymous users can only INSERT when enable_contact_form is true
CREATE POLICY "Public insert leads when enabled"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (SELECT enable_contact_form FROM public.site_settings WHERE id = 1) = true
  );

CREATE POLICY "Admin full access leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 7.7 api_rate_limits Policies
-- api_rate_limits has NO public policies; accessed exclusively via SECURITY DEFINER check_rate_limit()
CREATE POLICY "Admin read rate limits"
  ON public.api_rate_limits
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);
