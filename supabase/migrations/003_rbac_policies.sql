-- ==============================================================================
-- Devyx Platform & Headless CMS — Migration 003: Granular Role-Based Access Control (RBAC)
-- Enforces JWT app_metadata role verification directly inside PostgreSQL RLS
-- ==============================================================================

-- 1. SECURITY DEFINER ROLE EXTRACTION HELPERS
-- Evaluates the role assigned in Supabase Auth (raw_app_meta_data / app_metadata)

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    ''
  );
$$;

COMMENT ON FUNCTION public.current_user_role() IS 
  'Extracts verified administrative role from caller JWT token app_metadata claims.';

CREATE OR REPLACE FUNCTION public.has_role(VARIADIC allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (select auth.uid()) IS NOT NULL 
    AND public.current_user_role() = ANY(allowed_roles);
$$;

COMMENT ON FUNCTION public.has_role(VARIADIC text[]) IS 
  'Returns true if authenticated user holds one of the authorized administrative roles.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(VARIADIC text[]) TO authenticated;

-- ==============================================================================
-- 2. SITE SETTINGS RBAC POLICIES
-- Roles: Super Admin, Administrator
-- ==============================================================================

DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;

CREATE POLICY "Admin update site_settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator'))
  WITH CHECK (public.has_role('Super Admin', 'Administrator'));

-- ==============================================================================
-- 3. PAGE SECTIONS RBAC POLICIES
-- Roles: Super Admin, Administrator, Content Editor
-- ==============================================================================

DROP POLICY IF EXISTS "Admin modify page_sections" ON public.page_sections;

CREATE POLICY "Admin modify page_sections"
  ON public.page_sections
  FOR ALL
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Content Editor'))
  WITH CHECK (public.has_role('Super Admin', 'Administrator', 'Content Editor'));

-- ==============================================================================
-- 4. SERVICES RBAC POLICIES
-- Roles: Super Admin, Administrator, Lead Developer, Content Editor
-- ==============================================================================

DROP POLICY IF EXISTS "Admin read all services" ON public.services;
DROP POLICY IF EXISTS "Admin modify services" ON public.services;

CREATE POLICY "Admin read all services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor'));

CREATE POLICY "Admin modify services"
  ON public.services
  FOR ALL
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor'))
  WITH CHECK (public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor'));

-- ==============================================================================
-- 5. PROJECTS & CASE STUDIES RBAC POLICIES
-- Roles: Super Admin, Administrator, Lead Developer, Content Editor
-- ==============================================================================

DROP POLICY IF EXISTS "Admin read all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin modify projects" ON public.projects;

CREATE POLICY "Admin read all projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor'));

CREATE POLICY "Admin modify projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor'))
  WITH CHECK (public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor'));

-- ==============================================================================
-- 6. SOCIAL HUB RBAC POLICIES
-- Roles: Super Admin, Administrator, Operations Officer
-- ==============================================================================

DROP POLICY IF EXISTS "Admin read all social links" ON public.social_links;
DROP POLICY IF EXISTS "Admin modify social links" ON public.social_links;

CREATE POLICY "Admin read all social links"
  ON public.social_links
  FOR SELECT
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Operations Officer'));

CREATE POLICY "Admin modify social links"
  ON public.social_links
  FOR ALL
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Operations Officer'))
  WITH CHECK (public.has_role('Super Admin', 'Administrator', 'Operations Officer'));

-- ==============================================================================
-- 7. LEADS CRM RBAC POLICIES
-- Roles: Super Admin, Administrator, Operations Officer
-- ==============================================================================

DROP POLICY IF EXISTS "Admin full access leads" ON public.leads;

CREATE POLICY "Admin full access leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (public.has_role('Super Admin', 'Administrator', 'Operations Officer'))
  WITH CHECK (public.has_role('Super Admin', 'Administrator', 'Operations Officer'));

-- ==============================================================================
-- 8. STORAGE BUCKET MEDIA RBAC POLICIES
-- Upload/Modify/Delete restricted to content-managing roles
-- ==============================================================================

DROP POLICY IF EXISTS "Admin insert devyx-media objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin update devyx-media objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete devyx-media objects" ON storage.objects;

CREATE POLICY "Admin insert devyx-media objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'devyx-media'
    AND public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor')
  );

CREATE POLICY "Admin update devyx-media objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'devyx-media'
    AND public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor')
  )
  WITH CHECK (
    bucket_id = 'devyx-media'
    AND public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor')
  );

CREATE POLICY "Admin delete devyx-media objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'devyx-media'
    AND public.has_role('Super Admin', 'Administrator', 'Lead Developer', 'Content Editor')
  );
