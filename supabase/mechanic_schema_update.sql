-- =========================================================================================
-- MECHANIC ROLE SCHEMA UPDATE
-- Run this in Supabase SQL Editor after master_setup.sql
-- =========================================================================================

-- 1. ADD NEW COLUMNS TO MECHANICS TABLE
ALTER TABLE public.mechanics ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.mechanics ADD COLUMN IF NOT EXISTS bio text;

-- 2. NEW TABLES

-- mechanic_skills: المهارات/الخدمات
CREATE TABLE IF NOT EXISTS public.mechanic_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- mechanic_portfolio: أعمال سابقة
CREATE TABLE IF NOT EXISTS public.mechanic_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- mechanic_service_areas: مناطق الخدمة
CREATE TABLE IF NOT EXISTS public.mechanic_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  area_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. ENABLE RLS
ALTER TABLE public.mechanic_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_service_areas ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR mechanic_skills
DROP POLICY IF EXISTS "Mechanics can view own skills" ON public.mechanic_skills;
CREATE POLICY "Mechanics can view own skills" ON public.mechanic_skills
  FOR SELECT USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated can view all skills" ON public.mechanic_skills;
CREATE POLICY "Authenticated can view all skills" ON public.mechanic_skills
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Mechanics can insert own skills" ON public.mechanic_skills;
CREATE POLICY "Mechanics can insert own skills" ON public.mechanic_skills
  FOR INSERT WITH CHECK (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Mechanics can delete own skills" ON public.mechanic_skills;
CREATE POLICY "Mechanics can delete own skills" ON public.mechanic_skills
  FOR DELETE USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

-- 5. RLS POLICIES FOR mechanic_portfolio
DROP POLICY IF EXISTS "Mechanics can view own portfolio" ON public.mechanic_portfolio;
CREATE POLICY "Mechanics can view own portfolio" ON public.mechanic_portfolio
  FOR SELECT USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated can view all portfolio" ON public.mechanic_portfolio;
CREATE POLICY "Authenticated can view all portfolio" ON public.mechanic_portfolio
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Mechanics can insert own portfolio" ON public.mechanic_portfolio;
CREATE POLICY "Mechanics can insert own portfolio" ON public.mechanic_portfolio
  FOR INSERT WITH CHECK (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Mechanics can delete own portfolio" ON public.mechanic_portfolio;
CREATE POLICY "Mechanics can delete own portfolio" ON public.mechanic_portfolio
  FOR DELETE USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Mechanics can update own portfolio" ON public.mechanic_portfolio;
CREATE POLICY "Mechanics can update own portfolio" ON public.mechanic_portfolio
  FOR UPDATE USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

-- 6. RLS POLICIES FOR mechanic_service_areas
DROP POLICY IF EXISTS "Mechanics can view own service areas" ON public.mechanic_service_areas;
CREATE POLICY "Mechanics can view own service areas" ON public.mechanic_service_areas
  FOR SELECT USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated can view all service areas" ON public.mechanic_service_areas;
CREATE POLICY "Authenticated can view all service areas" ON public.mechanic_service_areas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Mechanics can insert own service areas" ON public.mechanic_service_areas;
CREATE POLICY "Mechanics can insert own service areas" ON public.mechanic_service_areas
  FOR INSERT WITH CHECK (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Mechanics can delete own service areas" ON public.mechanic_service_areas;
CREATE POLICY "Mechanics can delete own service areas" ON public.mechanic_service_areas
  FOR DELETE USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

-- 7. UPDATE PROFILES RLS: allow anyone authenticated to read any profile (for name lookups)
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
CREATE POLICY "Authenticated can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- 8. UPDATE BOOKINGS RLS: allow mechanic to update bookings assigned to them (confirm/cancel)
DROP POLICY IF EXISTS "Mechanics can view bookings assigned to them" ON public.bookings;
CREATE POLICY "Mechanics can view bookings assigned to them" ON public.bookings
  FOR SELECT USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Mechanics can update bookings assigned to them" ON public.bookings;
CREATE POLICY "Mechanics can update bookings assigned to them" ON public.bookings
  FOR UPDATE USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

-- 9. SUPABASE STORAGE BUCKET FOR PORTFOLIO IMAGES
-- Note: Run this in Supabase Dashboard > Storage or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('mechanic-portfolio', 'mechanic-portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
DROP POLICY IF EXISTS "Authenticated can upload portfolio images" ON storage.objects;
CREATE POLICY "Authenticated can upload portfolio images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'mechanic-portfolio');

DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
CREATE POLICY "Anyone can view portfolio images" ON storage.objects
  FOR SELECT USING (bucket_id = 'mechanic-portfolio');

DROP POLICY IF EXISTS "Users can delete own portfolio images" ON storage.objects;
CREATE POLICY "Users can delete own portfolio images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'mechanic-portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 10. REALTIME: enable realtime on requests table (may already exist)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN OTHERS THEN NULL; END $$;
