-- ========================================================
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ========================================================

-- 1. Add avatar_url column to profiles (if it doesn't exist yet)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Create avatars storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policy: anyone can read avatars (public)
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 4. Storage policy: authenticated users can upload/update their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Profiles RLS: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. Add email column to profiles (for username-based login lookup)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email text;

-- 7. Backfill email from auth.users for existing profiles
UPDATE profiles
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id
  AND profiles.email IS NULL;
