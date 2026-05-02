-- =========================================================================================
-- SELLER FLOW UPDATE
-- Run this ENTIRE file in the Supabase SQL Editor.
-- It will:
--   1. Add a 'description' column to products
--   2. Add RLS policies so sellers can see orders for their products
--   3. Allow all authenticated users to read profiles (for seller name on products)
--   4. Create 'product-images' storage bucket for product image uploads
-- =========================================================================================

-- 1. ADD DESCRIPTION COLUMN TO PRODUCTS (if not exists)
DO $$ BEGIN
  ALTER TABLE public.products ADD COLUMN description text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. ALLOW ALL AUTHENTICATED USERS TO READ ANY PROFILE (name, avatar)
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 3. SELLERS CAN VIEW ORDERS THAT CONTAIN THEIR PRODUCTS
-- Via order_items table
DROP POLICY IF EXISTS "Sellers can view orders for their products" ON public.orders;
CREATE POLICY "Sellers can view orders for their products"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT oi.order_id FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE p.seller_id IN (SELECT s.id FROM public.sellers s WHERE s.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Sellers can view order_items for their products" ON public.order_items;
CREATE POLICY "Sellers can view order_items for their products"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT p.id FROM public.products p
      WHERE p.seller_id IN (SELECT s.id FROM public.sellers s WHERE s.user_id = auth.uid())
    )
  );

-- Sellers can also update order status (for fulfillment)
DROP POLICY IF EXISTS "Sellers can update orders for their products" ON public.orders;
CREATE POLICY "Sellers can update orders for their products"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT oi.order_id FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE p.seller_id IN (SELECT s.id FROM public.sellers s WHERE s.user_id = auth.uid())
    )
  );

-- order_line_items: sellers can view line items for orders containing their products
DROP POLICY IF EXISTS "Sellers can view order_line_items for their products" ON public.order_line_items;
CREATE POLICY "Sellers can view order_line_items for their products"
  ON public.order_line_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT oi.order_id FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE p.seller_id IN (SELECT s.id FROM public.sellers s WHERE s.user_id = auth.uid())
    )
  );

-- 4. ALLOW SELLERS TO VIEW ALL SELLER ROWS (for user store to join)
DROP POLICY IF EXISTS "Authenticated users can view sellers" ON public.sellers;
CREATE POLICY "Authenticated users can view sellers"
  ON public.sellers FOR SELECT
  TO authenticated
  USING (true);

-- 5. CREATE PRODUCT-IMAGES STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to product-images
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to view product images (public bucket)
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow sellers to delete their own product images
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
CREATE POLICY "Users can delete own product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
