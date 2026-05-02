-- =========================================================================================
-- AUTOASSIST SEED STORE & MECHANICS
-- Copy ALL of this file into the Supabase SQL Editor and run it.
-- This will insert 7 mechanics, 1 seller, and 36 products with working image URLs.
-- =========================================================================================

DO $$
DECLARE
  s_uid uuid := '11111111-1111-1111-1111-111111111111';
  m1_uid uuid := '22222222-2222-2222-2222-222222222221';
  m2_uid uuid := '22222222-2222-2222-2222-222222222222';
  m3_uid uuid := '22222222-2222-2222-2222-222222222223';
  m4_uid uuid := '22222222-2222-2222-2222-222222222224';
  m5_uid uuid := '22222222-2222-2222-2222-222222222225';
  m6_uid uuid := '22222222-2222-2222-2222-222222222226';
  m7_uid uuid := '22222222-2222-2222-2222-222222222227';
  pwd text := crypt('DemoPass123!', gen_salt('bf'));
BEGIN
  -- 1. Insert Seller
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (s_uid, 'authenticated', 'authenticated', 'seller_demo@autoassist.app', pwd, now(), '{"role":"seller","name":"AutoAssist Main Store"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Insert 7 Mechanics
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES 
    (m1_uid, 'authenticated', 'authenticated', 'm1@autoassist.app', pwd, now(), '{"role":"mechanic","name":"Ahmed Garage"}'::jsonb),
    (m2_uid, 'authenticated', 'authenticated', 'm2@autoassist.app', pwd, now(), '{"role":"mechanic","name":"Khaled Auto"}'::jsonb),
    (m3_uid, 'authenticated', 'authenticated', 'm3@autoassist.app', pwd, now(), '{"role":"mechanic","name":"Yousef Fix"}'::jsonb),
    (m4_uid, 'authenticated', 'authenticated', 'm4@autoassist.app', pwd, now(), '{"role":"mechanic","name":"Omar Motors"}'::jsonb),
    (m5_uid, 'authenticated', 'authenticated', 'm5@autoassist.app', pwd, now(), '{"role":"mechanic","name":"Tariq Service"}'::jsonb),
    (m6_uid, 'authenticated', 'authenticated', 'm6@autoassist.app', pwd, now(), '{"role":"mechanic","name":"Hassan Workshop"}'::jsonb),
    (m7_uid, 'authenticated', 'authenticated', 'm7@autoassist.app', pwd, now(), '{"role":"mechanic","name":"Ali Repair"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- The trigger might have fired and created profiles/mechanics/sellers, but let's upsert to be safe.
  
  -- Seller Profile & Entry
  INSERT INTO public.profiles (id, name, email, role) VALUES (s_uid, 'AutoAssist Main Store', 'seller_demo@autoassist.app', 'seller') ON CONFLICT (id) DO UPDATE SET role = 'seller', name = 'AutoAssist Main Store';
  INSERT INTO public.sellers (user_id, shop_name) VALUES (s_uid, 'AutoAssist Main Store') ON CONFLICT (user_id) DO UPDATE SET shop_name = 'AutoAssist Main Store';

  -- Mechanic Profiles & Entries
  INSERT INTO public.profiles (id, name, email, role) VALUES 
    (m1_uid, 'Ahmed Garage', 'm1@autoassist.app', 'mechanic'),
    (m2_uid, 'Khaled Auto', 'm2@autoassist.app', 'mechanic'),
    (m3_uid, 'Yousef Fix', 'm3@autoassist.app', 'mechanic'),
    (m4_uid, 'Omar Motors', 'm4@autoassist.app', 'mechanic'),
    (m5_uid, 'Tariq Service', 'm5@autoassist.app', 'mechanic'),
    (m6_uid, 'Hassan Workshop', 'm6@autoassist.app', 'mechanic'),
    (m7_uid, 'Ali Repair', 'm7@autoassist.app', 'mechanic')
  ON CONFLICT (id) DO UPDATE SET role = 'mechanic';

  INSERT INTO public.mechanics (user_id, workshop_name, experience_years, rating, availability_status) VALUES
    (m1_uid, 'Ahmed Garage', 12, 4.8, 'available'),
    (m2_uid, 'Khaled Auto', 5, 4.2, 'available'),
    (m3_uid, 'Yousef Fix', 8, 4.5, 'busy'),
    (m4_uid, 'Omar Motors', 15, 4.9, 'available'),
    (m5_uid, 'Tariq Service', 3, 3.8, 'available'),
    (m6_uid, 'Hassan Workshop', 10, 4.6, 'offline'),
    (m7_uid, 'Ali Repair', 7, 4.3, 'available')
  ON CONFLICT (user_id) DO UPDATE SET 
    experience_years = EXCLUDED.experience_years, 
    rating = EXCLUDED.rating, 
    workshop_name = EXCLUDED.workshop_name;

  -- Delete existing products for this seller to avoid duplicates
  DELETE FROM public.products WHERE seller_id IN (SELECT id FROM public.sellers WHERE user_id = s_uid);

  -- Insert 36 Products with working picsum links
  WITH s AS (SELECT id FROM public.sellers WHERE user_id = s_uid LIMIT 1)
  INSERT INTO public.products (seller_id, name, category, price, stock, image_url)
  SELECT s.id, p.name, p.category, p.price, p.stock, p.image_url
  FROM s, (VALUES 
    -- Tires
    ('Sport Tire Pro All-Season', 'tires', 89.99, 50, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'),
    ('Winter Grip Master', 'tires', 110.00, 30, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'),
    ('Off-Road Mud Terrain', 'tires', 145.50, 20, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'),
    ('Eco Touring Tire', 'tires', 75.00, 60, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'),
    ('High Performance Summer', 'tires', 130.00, 40, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'),
    ('Budget Commuter Tire', 'tires', 55.99, 100, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'),
    -- Batteries
    ('PowerMax 12V Car Battery', 'batteries', 120.00, 45, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80'),
    ('EverStart Ultra', 'batteries', 140.00, 25, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80'),
    ('Lithium Ion Jump Starter', 'batteries', 99.99, 60, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80'),
    ('Heavy Duty Truck Battery', 'batteries', 185.50, 15, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80'),
    ('Standard Life Battery', 'batteries', 89.99, 80, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80'),
    ('Deep Cycle Marine/RV', 'batteries', 160.00, 20, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80'),
    -- Oil
    ('Premium Synthetic 5W-30', 'oil', 45.00, 100, 'https://images.unsplash.com/photo-1606168094080-60b6d4c06f15?w=400&q=80'),
    ('High Mileage 10W-40', 'oil', 38.50, 80, 'https://images.unsplash.com/photo-1606168094080-60b6d4c06f15?w=400&q=80'),
    ('Full Synthetic 0W-20', 'oil', 50.00, 70, 'https://images.unsplash.com/photo-1606168094080-60b6d4c06f15?w=400&q=80'),
    ('Conventional Motor Oil 5W-20', 'oil', 25.00, 150, 'https://images.unsplash.com/photo-1606168094080-60b6d4c06f15?w=400&q=80'),
    ('Diesel Engine Oil 15W-40', 'oil', 55.00, 40, 'https://images.unsplash.com/photo-1606168094080-60b6d4c06f15?w=400&q=80'),
    ('Motorcycle Synthetic 10W-50', 'oil', 60.00, 30, 'https://images.unsplash.com/photo-1606168094080-60b6d4c06f15?w=400&q=80'),
    -- Filters
    ('CleanAir Cabin Filter', 'filters', 24.99, 120, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&q=80'),
    ('High-Flow Engine Air Filter', 'filters', 35.00, 90, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&q=80'),
    ('Premium Oil Filter', 'filters', 12.50, 200, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&q=80'),
    ('Fuel Filter Replacement', 'filters', 18.00, 80, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&q=80'),
    ('Performance Air Intake Filter', 'filters', 65.00, 40, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&q=80'),
    ('Transmission Fluid Filter', 'filters', 22.00, 60, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&q=80'),
    -- Accessories
    ('Pro Mechanic Tool Set', 'accessories', 149.99, 25, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'),
    ('LED Headlight Bulbs', 'accessories', 45.00, 80, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'),
    ('All-Weather Floor Mats', 'accessories', 55.00, 60, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'),
    ('Windshield Wiper Blades', 'accessories', 22.50, 150, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'),
    ('Car Wash & Wax Kit', 'accessories', 35.99, 100, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'),
    ('Portable Tire Inflator', 'accessories', 42.00, 70, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'),
    -- Brakes
    ('Ceramic Brake Pads', 'brakes', 65.00, 85, 'https://images.unsplash.com/photo-1506544777-64cfbea7e96b?w=400&q=80'),
    ('Performance Brake Rotors', 'brakes', 110.00, 40, 'https://images.unsplash.com/photo-1506544777-64cfbea7e96b?w=400&q=80'),
    ('Semi-Metallic Brake Pads', 'brakes', 45.00, 110, 'https://images.unsplash.com/photo-1506544777-64cfbea7e96b?w=400&q=80'),
    ('Brake Fluid DOT 4', 'brakes', 15.00, 130, 'https://images.unsplash.com/photo-1506544777-64cfbea7e96b?w=400&q=80'),
    ('Slotted Brake Rotors', 'brakes', 130.00, 30, 'https://images.unsplash.com/photo-1506544777-64cfbea7e96b?w=400&q=80'),
    ('Brake Caliper Assembly', 'brakes', 95.00, 25, 'https://images.unsplash.com/photo-1506544777-64cfbea7e96b?w=400&q=80')
  ) AS p(name, category, price, stock, image_url);

END $$;
