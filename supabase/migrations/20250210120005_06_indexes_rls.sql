-- AutoAssist: Indexes and Row Level Security (RLS)

-- ---------- INDEXES ----------
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_mechanics_availability_status ON public.mechanics(availability_status);
CREATE INDEX idx_mechanics_rating ON public.mechanics(rating);

CREATE INDEX idx_mechanic_locations_mechanic_id ON public.mechanic_locations(mechanic_id);
CREATE INDEX idx_mechanic_locations_mechanic_updated ON public.mechanic_locations(mechanic_id, updated_at DESC);

CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_mechanic_id ON public.requests(mechanic_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_created_at ON public.requests(created_at);
CREATE INDEX idx_requests_mechanic_status ON public.requests(mechanic_id, status);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_mechanic_id ON public.bookings(mechanic_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX idx_ratings_mechanic_id ON public.ratings(mechanic_id);
CREATE INDEX idx_ratings_request_id ON public.ratings(request_id);

-- ---------- ROW LEVEL SECURITY ----------
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

-- profiles: users can read and update own row only (INSERT via trigger)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- mechanics: own row by user_id
CREATE POLICY "Mechanics can view own row"
  ON public.mechanics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert mechanic profile for self"
  ON public.mechanics FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Mechanics can update own row"
  ON public.mechanics FOR UPDATE
  USING (user_id = auth.uid());

-- sellers: own row by user_id
CREATE POLICY "Sellers can view own row"
  ON public.sellers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert seller profile for self"
  ON public.sellers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sellers can update own row"
  ON public.sellers FOR UPDATE
  USING (user_id = auth.uid());

-- mechanic_locations: mechanics manage own; all authenticated can read (for nearby mechanics map)
CREATE POLICY "Authenticated users can view mechanic locations"
  ON public.mechanic_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mechanics can insert own location"
  ON public.mechanic_locations FOR INSERT
  WITH CHECK (
    mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid())
  );

CREATE POLICY "Mechanics can update own location"
  ON public.mechanic_locations FOR UPDATE
  USING (
    mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid())
  );

CREATE POLICY "Mechanics can delete own location"
  ON public.mechanic_locations FOR DELETE
  USING (
    mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid())
  );

-- requests: user sees own; mechanic sees assigned; user inserts; both can update (status)
CREATE POLICY "Users can view own requests"
  ON public.requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Mechanics can view requests assigned to them"
  ON public.requests FOR SELECT
  USING (
    mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own requests"
  ON public.requests FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Mechanics can update requests assigned to them"
  ON public.requests FOR UPDATE
  USING (
    mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid())
  );

-- bookings: user sees own; mechanic sees own; user inserts; both update
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Mechanics can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Mechanics can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    mechanic_id IN (SELECT id FROM public.mechanics WHERE user_id = auth.uid())
  );

-- products: sellers CRUD own; all authenticated can SELECT (store listing)
CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  );

CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  USING (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  );

CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE
  USING (
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  );

-- orders: users see and create own
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (user_id = auth.uid());

-- order_items: access only via order ownership
CREATE POLICY "Users can view order_items for own orders"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert order_items into own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update order_items in own orders"
  ON public.order_items FOR UPDATE
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete order_items from own orders"
  ON public.order_items FOR DELETE
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- ratings: user inserts own; everyone can read (for mechanic profile display)
CREATE POLICY "Authenticated users can view ratings"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings for self"
  ON public.ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ratings"
  ON public.ratings FOR UPDATE
  USING (user_id = auth.uid());
