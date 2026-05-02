-- =========================================================================================
-- AUTOASSIST UPDATE SCRIPT
-- Copy ALL of this file into the Supabase SQL Editor and run it.
-- This will update the user registration trigger and seed the store with 36 products.
-- =========================================================================================

-- 1. UPDATE PROFILE TRIGGER (Mechanic & Seller auto-registration)
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

-- Drop and recreate the trigger to ensure it uses the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 2. SEED PRODUCTS
DO $$
DECLARE
  seller_uid uuid := 'f1e2d3c4-b5a6-4c7d-8e9f-0a1b2c3d4e5f';
  inst_id uuid;
  pwd text := crypt('SellerPass123!', gen_salt('bf'));
  s_id uuid;
BEGIN
  -- 2a. Find an instance id
  SELECT id INTO inst_id FROM auth.instances LIMIT 1;
  IF inst_id IS NULL THEN
    SELECT instance_id INTO inst_id FROM auth.users LIMIT 1;
  END IF;

  IF inst_id IS NOT NULL THEN
    -- 2b. Insert dummy seller into auth.users
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data)
    VALUES
      (seller_uid, inst_id, 'authenticated', 'authenticated', 'store@demo.autoassist.app', pwd, now(), now(), now(), '{"role":"seller","name":"AutoAssist Main Store"}'::jsonb, '{}'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    -- Ensure profile exists
    UPDATE public.profiles SET role = 'seller'::user_role, name = 'AutoAssist Main Store', email = 'store@demo.autoassist.app' WHERE id = seller_uid;

    -- Create seller entry
    INSERT INTO public.sellers (user_id, shop_name, address)
    VALUES (seller_uid, 'AutoAssist Main Store', '123 Main St, Cityville')
    ON CONFLICT (user_id) DO UPDATE SET shop_name = EXCLUDED.shop_name;

    -- Get the seller ID
    SELECT id INTO s_id FROM public.sellers WHERE user_id = seller_uid LIMIT 1;

    -- 2c. Clear existing products to avoid duplicates
    DELETE FROM public.products WHERE seller_id = s_id;

    -- 2d. Insert 36 Products (6 for each of 6 categories)
    INSERT INTO public.products (seller_id, name, category, price, stock, image_url) VALUES
    -- Tires
    (s_id, 'Sport Tire Pro All-Season', 'tires', 89.99, 50, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Winter Grip Master', 'tires', 110.00, 30, 'https://images.unsplash.com/photo-1596483584857-e6eb26da234a?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Off-Road Mud Terrain', 'tires', 145.50, 20, 'https://images.unsplash.com/photo-1592419356345-2dfb70a7b489?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Eco Touring Tire', 'tires', 75.00, 60, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'High Performance Summer', 'tires', 130.00, 40, 'https://images.unsplash.com/photo-1596483584857-e6eb26da234a?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Budget Commuter Tire', 'tires', 55.99, 100, 'https://images.unsplash.com/photo-1592419356345-2dfb70a7b489?auto=format&fit=crop&q=80&w=400&h=300'),
    -- Batteries
    (s_id, 'PowerMax 12V Car Battery', 'batteries', 120.00, 45, 'https://images.unsplash.com/photo-1595180424560-6b6de1b0ab9f?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'EverStart Ultra', 'batteries', 140.00, 25, 'https://images.unsplash.com/photo-1621516629910-85f0ef2ef788?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Lithium Ion Jump Starter', 'batteries', 99.99, 60, 'https://images.unsplash.com/photo-1595180424560-6b6de1b0ab9f?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Heavy Duty Truck Battery', 'batteries', 185.50, 15, 'https://images.unsplash.com/photo-1621516629910-85f0ef2ef788?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Standard Life Battery', 'batteries', 89.99, 80, 'https://images.unsplash.com/photo-1595180424560-6b6de1b0ab9f?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Deep Cycle Marine/RV', 'batteries', 160.00, 20, 'https://images.unsplash.com/photo-1621516629910-85f0ef2ef788?auto=format&fit=crop&q=80&w=400&h=300'),
    -- Oil
    (s_id, 'Premium Synthetic 5W-30', 'oil', 45.00, 100, 'https://images.unsplash.com/photo-1532415170068-d6537eb14c81?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'High Mileage 10W-40', 'oil', 38.50, 80, 'https://images.unsplash.com/photo-1582298606470-3889158bf37e?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Full Synthetic 0W-20', 'oil', 50.00, 70, 'https://images.unsplash.com/photo-1532415170068-d6537eb14c81?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Conventional Motor Oil 5W-20', 'oil', 25.00, 150, 'https://images.unsplash.com/photo-1582298606470-3889158bf37e?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Diesel Engine Oil 15W-40', 'oil', 55.00, 40, 'https://images.unsplash.com/photo-1532415170068-d6537eb14c81?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Motorcycle Synthetic 10W-50', 'oil', 60.00, 30, 'https://images.unsplash.com/photo-1582298606470-3889158bf37e?auto=format&fit=crop&q=80&w=400&h=300'),
    -- Filters
    (s_id, 'CleanAir Cabin Filter', 'filters', 24.99, 120, 'https://images.unsplash.com/photo-1605335198083-d922a969db23?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'High-Flow Engine Air Filter', 'filters', 35.00, 90, 'https://images.unsplash.com/photo-1605335198083-d922a969db23?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Premium Oil Filter', 'filters', 12.50, 200, 'https://images.unsplash.com/photo-1605335198083-d922a969db23?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Fuel Filter Replacement', 'filters', 18.00, 80, 'https://images.unsplash.com/photo-1605335198083-d922a969db23?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Performance Air Intake Filter', 'filters', 65.00, 40, 'https://images.unsplash.com/photo-1605335198083-d922a969db23?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Transmission Fluid Filter', 'filters', 22.00, 60, 'https://images.unsplash.com/photo-1605335198083-d922a969db23?auto=format&fit=crop&q=80&w=400&h=300'),
    -- Accessories
    (s_id, 'Pro Mechanic Tool Set', 'accessories', 149.99, 25, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'LED Headlight Bulbs', 'accessories', 45.00, 80, 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'All-Weather Floor Mats', 'accessories', 55.00, 60, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Windshield Wiper Blades', 'accessories', 22.50, 150, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Car Wash & Wax Kit', 'accessories', 35.99, 100, 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Portable Tire Inflator', 'accessories', 42.00, 70, 'https://images.unsplash.com/photo-1554223090-7e482851df45?auto=format&fit=crop&q=80&w=400&h=300'),
    -- Brakes
    (s_id, 'Ceramic Brake Pads', 'brakes', 65.00, 85, 'https://images.unsplash.com/photo-1619623199859-9730cd9062d3?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Performance Brake Rotors', 'brakes', 110.00, 40, 'https://images.unsplash.com/photo-1619623199859-9730cd9062d3?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Semi-Metallic Brake Pads', 'brakes', 45.00, 110, 'https://images.unsplash.com/photo-1619623199859-9730cd9062d3?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Brake Fluid DOT 4', 'brakes', 15.00, 130, 'https://images.unsplash.com/photo-1532415170068-d6537eb14c81?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Slotted Brake Rotors', 'brakes', 130.00, 30, 'https://images.unsplash.com/photo-1619623199859-9730cd9062d3?auto=format&fit=crop&q=80&w=400&h=300'),
    (s_id, 'Brake Caliper Assembly', 'brakes', 95.00, 25, 'https://images.unsplash.com/photo-1619623199859-9730cd9062d3?auto=format&fit=crop&q=80&w=400&h=300');

  END IF;
END $$;
