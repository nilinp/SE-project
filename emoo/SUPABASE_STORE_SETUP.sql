-- ========================================================
-- EMOO STORE DATABASE & STORAGE SETUP
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ========================================================

-- 1. Create the `products` table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  amount integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create `products` storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policy: anyone can read product images (public)
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- 4. Storage policy: authenticated users can upload/update/delete product images
CREATE POLICY "Authenticated users can manipulate product images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'products' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- 5. Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. Products RLS: anyone can read products
CREATE POLICY "Public read products"
  ON public.products FOR SELECT
  USING (true);

-- 7. Products RLS: authenticated users can act as admins to manage products
-- (Currently simple role check, modify to check auth.uid() against admin list for tighter security later)
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (auth.role() = 'authenticated');
