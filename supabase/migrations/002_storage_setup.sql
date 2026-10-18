-- ==============================================================================
-- Devyx Platform & Headless CMS — Migration 002: Storage Setup & Hygiene
-- Configures 'devyx-media' bucket with 5MB limit, modern image formats, & RLS
-- ==============================================================================

-- 1. INSERT STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'devyx-media',
  'devyx-media',
  true,
  5242880, -- 5 MB in bytes
  ARRAY[
    'image/webp',
    'image/png',
    'image/jpeg',
    'image/avif',
    'image/svg+xml'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/webp',
    'image/png',
    'image/jpeg',
    'image/avif',
    'image/svg+xml'
  ]::text[];

-- 2. STORAGE OBJECTS RLS POLICIES
-- Public Read: Anyone can view images from devyx-media bucket
CREATE POLICY "Public read devyx-media objects"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'devyx-media');

-- Admin Upload: Authenticated admins can insert new files
CREATE POLICY "Admin insert devyx-media objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'devyx-media'
    AND (select auth.uid()) IS NOT NULL
  );

-- Admin Update/Upsert: Authenticated admins can update existing files
-- (Requires both USING and WITH CHECK per Supabase best practices)
CREATE POLICY "Admin update devyx-media objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'devyx-media'
    AND (select auth.uid()) IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'devyx-media'
    AND (select auth.uid()) IS NOT NULL
  );

-- Admin Delete: Authenticated admins can delete files (for storage hygiene)
CREATE POLICY "Admin delete devyx-media objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'devyx-media'
    AND (select auth.uid()) IS NOT NULL
  );
