-- =========================================================================================
-- CLEAN AUTOASSIST SUPABASE MASTER SETUP SCRIPT
-- Copy ALL of this file into the Supabase SQL Editor and run it.
-- =========================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'mechanic', 'seller');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('available', 'busy', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 3. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mechanics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  workshop_name text,
  experience_years integer,
  rating numeric(3,2),
  availability_status availability_status DEFAULT 'offline',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mechanic_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mechanic_id uuid REFERENCES public.mechanics(id) ON DELETE SET NULL,
  status request_status NOT NULL DEFAULT 'pending',
  problem_description text,
  price numeric(10,2),
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  price numeric(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_price numeric(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  delivery_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.requests(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id)
);

CREATE TABLE IF NOT EXISTS public.user_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  license_plate text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand text NOT NULL,
  last4 text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 4. PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role text := NEW.raw_user_meta_data->>'role';
  profile_role user_role;
BEGIN
  profile_role := CASE
    WHEN meta_role = 'mechanic' THEN 'mechanic'::user_role
    WHEN meta_role = 'seller' THEN 'seller'::user_role
    ELSE 'user'::user_role
  END;
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    profile_role
  );
  
  -- Automatically insert into mechanics if role is mechanic
  IF profile_role = 'mechanic'::user_role THEN
    INSERT INTO public.mechanics (user_id, workshop_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'));
  END IF;
  
  -- Automatically insert into sellers if role is seller
  IF profile_role = 'seller'::user_role THEN
    INSERT INTO public.sellers (user_id, shop_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 5. RLS AND PUBLICATION
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
EXCEPTION WHEN duplicate_object THEN NULL; 
WHEN OTHERS THEN NULL; END $$;

-- 6. POLICIES
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Mechanics
DROP POLICY IF EXISTS "Mechanics can view own row" ON public.mechanics;
CREATE POLICY "Mechanics can view own row" ON public.mechanics FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert mechanic profile for self" ON public.mechanics;
CREATE POLICY "Users can insert mechanic profile for self" ON public.mechanics FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Mechanics can update own row" ON public.mechanics;
CREATE POLICY "Mechanics can update own row" ON public.mechanics FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Authenticated users can view mechanics" ON public.mechanics;
CREATE POLICY "Authenticated users can view mechanics" ON public.mechanics FOR SELECT TO authenticated USING (true);


-- Sellers
DROP POLICY IF EXISTS "Sellers can view own row" ON public.sellers;
CREATE POLICY "Sellers can view own row" ON public.sellers FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert seller profile for self" ON public.sellers;
CREATE POLICY "Users can insert seller profile for self" ON public.sellers FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Sellers can update own row" ON public.sellers;
CREATE POLICY "Sellers can update own row" ON public.sellers FOR UPDATE USING (user_id = auth.uid());

-- Requests
DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
CREATE POLICY "Users can view own requests" ON public.requests FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Mechanics can view requests assigned to them" ON public.requests;
CREATE POLICY "Mechanics can view requests assigned to them" ON public.requests FOR SELECT USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
CREATE POLICY "Users can create requests" ON public.requests FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;
CREATE POLICY "Users can update own requests" ON public.requests FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Mechanics can update requests assigned to them" ON public.requests;
CREATE POLICY "Mechanics can update requests assigned to them" ON public.requests FOR UPDATE USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Mechanics can view pending requests" ON public.requests;
CREATE POLICY "Mechanics can view pending requests" ON public.requests FOR SELECT TO authenticated USING (status = 'pending' AND EXISTS (SELECT 1 FROM public.mechanics m WHERE m.user_id = auth.uid()));
DROP POLICY IF EXISTS "Mechanics can accept pending requests" ON public.requests;
CREATE POLICY "Mechanics can accept pending requests" ON public.requests FOR UPDATE TO authenticated USING (status = 'pending' AND mechanic_id IS NULL AND EXISTS (SELECT 1 FROM public.mechanics m WHERE m.user_id = auth.uid())) WITH CHECK (true);


-- 7. DEMO SEED DATA
DO $$
DECLARE
  uid1 uuid := 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
  uid2 uuid := 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e';
  uid3 uuid := 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f';
  inst_id uuid;
  pwd text := crypt('MechanicPass123!', gen_salt('bf'));
BEGIN
  SELECT id INTO inst_id FROM auth.instances LIMIT 1;
  IF inst_id IS NULL THEN
    SELECT instance_id INTO inst_id FROM auth.users LIMIT 1;
  END IF;

  IF inst_id IS NOT NULL THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
    VALUES
      (uid1, inst_id, 'authenticated', 'authenticated', 'mechanic1@demo.autoassist.app', pwd, now(), now(), now(), '{"role":"mechanic","name":"Alex Garage"}'::jsonb, '{}'::jsonb),
      (uid2, inst_id, 'authenticated', 'authenticated', 'mechanic2@demo.autoassist.app', pwd, now(), now(), now(), '{"role":"mechanic","name":"Riverside Auto"}'::jsonb, '{}'::jsonb),
      (uid3, inst_id, 'authenticated', 'authenticated', 'mechanic3@demo.autoassist.app', pwd, now(), now(), now(), '{"role":"mechanic","name":"Quick Fix Motors"}'::jsonb, '{}'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    UPDATE public.profiles SET role = 'mechanic'::user_role, name = 'Alex Garage', email = 'mechanic1@demo.autoassist.app' WHERE id = uid1;
    UPDATE public.profiles SET role = 'mechanic'::user_role, name = 'Riverside Auto', email = 'mechanic2@demo.autoassist.app' WHERE id = uid2;
    UPDATE public.profiles SET role = 'mechanic'::user_role, name = 'Quick Fix Motors', email = 'mechanic3@demo.autoassist.app' WHERE id = uid3;

    INSERT INTO public.mechanics (user_id, workshop_name, experience_years, rating, availability_status)
    VALUES
      (uid1, 'Alex Garage', 8, 4.75, 'available'),
      (uid2, 'Riverside Auto', 12, 4.90, 'available'),
      (uid3, 'Quick Fix Motors', 5, 4.50, 'available')
    ON CONFLICT (user_id) DO UPDATE SET
      workshop_name = EXCLUDED.workshop_name,
      experience_years = EXCLUDED.experience_years,
      rating = EXCLUDED.rating,
      availability_status = EXCLUDED.availability_status,
      updated_at = now();
  END IF;
END $$;
