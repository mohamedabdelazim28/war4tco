-- =============================================================================
-- AutoAssist – Full schema migration (idempotent – safe to run multiple times)
-- =============================================================================

-- ---------- 1. ENUMS (skip if already exist) ----------
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

-- ---------- 2. PROFILES (linked to auth.users) ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- If profiles was created with phone, replace with email
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles DROP COLUMN phone;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;
END $$;

-- Trigger: create profile when a new user signs up (with role from metadata)
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
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email,
    profile_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------- 3. MECHANICS, SELLERS, MECHANIC_LOCATIONS ----------
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

-- ---------- 4. REQUESTS & BOOKINGS ----------
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

-- ---------- 5. PRODUCTS, ORDERS, ORDER_ITEMS ----------
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

-- ---------- 6. RATINGS ----------
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

-- ---------- 7. INDEXES ----------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_mechanics_availability_status ON public.mechanics(availability_status);
CREATE INDEX IF NOT EXISTS idx_mechanics_rating ON public.mechanics(rating);
CREATE INDEX IF NOT EXISTS idx_mechanic_locations_mechanic_id ON public.mechanic_locations(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_locations_mechanic_updated ON public.mechanic_locations(mechanic_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_mechanic_id ON public.requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_mechanic_status ON public.requests(mechanic_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mechanic_id ON public.bookings(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_mechanic_id ON public.ratings(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_ratings_request_id ON public.ratings(request_id);

-- ---------- 8. ROW LEVEL SECURITY ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- ---------- 9. POLICIES (drop if exists then create) ----------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Mechanics can view own row" ON public.mechanics;
DROP POLICY IF EXISTS "Users can insert mechanic profile for self" ON public.mechanics;
DROP POLICY IF EXISTS "Mechanics can update own row" ON public.mechanics;
CREATE POLICY "Mechanics can view own row" ON public.mechanics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert mechanic profile for self" ON public.mechanics FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mechanics can update own row" ON public.mechanics FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can view own row" ON public.sellers;
DROP POLICY IF EXISTS "Users can insert seller profile for self" ON public.sellers;
DROP POLICY IF EXISTS "Sellers can update own row" ON public.sellers;
CREATE POLICY "Sellers can view own row" ON public.sellers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert seller profile for self" ON public.sellers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Sellers can update own row" ON public.sellers FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view mechanic locations" ON public.mechanic_locations;
DROP POLICY IF EXISTS "Mechanics can insert own location" ON public.mechanic_locations;
DROP POLICY IF EXISTS "Mechanics can update own location" ON public.mechanic_locations;
DROP POLICY IF EXISTS "Mechanics can delete own location" ON public.mechanic_locations;
CREATE POLICY "Authenticated users can view mechanic locations" ON public.mechanic_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mechanics can insert own location" ON public.mechanic_locations FOR INSERT
  WITH CHECK (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));
CREATE POLICY "Mechanics can update own location" ON public.mechanic_locations FOR UPDATE
  USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));
CREATE POLICY "Mechanics can delete own location" ON public.mechanic_locations FOR DELETE
  USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
DROP POLICY IF EXISTS "Mechanics can view requests assigned to them" ON public.requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;
DROP POLICY IF EXISTS "Mechanics can update requests assigned to them" ON public.requests;
CREATE POLICY "Users can view own requests" ON public.requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Mechanics can view requests assigned to them" ON public.requests FOR SELECT
  USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));
CREATE POLICY "Users can create requests" ON public.requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own requests" ON public.requests FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Mechanics can update requests assigned to them" ON public.requests FOR UPDATE
  USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Mechanics can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Mechanics can update their bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Mechanics can view their bookings" ON public.bookings FOR SELECT
  USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Mechanics can update their bookings" ON public.bookings FOR UPDATE
  USING (mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE
  USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view order_items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order_items into own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can update order_items in own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can delete order_items from own orders" ON public.order_items;
CREATE POLICY "Users can view order_items for own orders" ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert order_items into own orders" ON public.order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can update order_items in own orders" ON public.order_items FOR UPDATE
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete order_items from own orders" ON public.order_items FOR DELETE
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can create ratings for self" ON public.ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.ratings;
CREATE POLICY "Authenticated users can view ratings" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create ratings for self" ON public.ratings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE USING (user_id = auth.uid());
