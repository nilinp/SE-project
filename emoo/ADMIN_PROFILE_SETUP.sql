-- ========================================================
-- Admin Profile Features: Login History + Horoscope View Tracking
-- Run this in Supabase SQL Editor
-- ========================================================

-- 1. Create admin_login_history table
CREATE TABLE IF NOT EXISTS admin_login_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  email text,
  login_at timestamptz DEFAULT now(),
  ip_address text DEFAULT 'Unknown',
  user_agent text DEFAULT 'Unknown'
);

-- RLS for admin_login_history
ALTER TABLE admin_login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read login history"
  ON admin_login_history FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert login history"
  ON admin_login_history FOR INSERT
  WITH CHECK (true);

-- 2. Create horoscope_views table to track every view
CREATE TABLE IF NOT EXISTS horoscope_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('love', 'money', 'study')),
  card_id integer,
  viewed_at timestamptz DEFAULT now()
);

-- RLS for horoscope_views
ALTER TABLE horoscope_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert horoscope views"
  ON horoscope_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read horoscope views"
  ON horoscope_views FOR SELECT
  USING (true);

-- 3. Create index for faster category queries
CREATE INDEX IF NOT EXISTS idx_horoscope_views_category ON horoscope_views(category);
CREATE INDEX IF NOT EXISTS idx_horoscope_views_viewed_at ON horoscope_views(viewed_at);
