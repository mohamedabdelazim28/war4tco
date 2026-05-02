-- =========================================================================================
-- CLEANUP: DELETE ALL STATIC/SEED DATA
-- Run this in the Supabase SQL Editor to clear all demo/seed data.
-- After running this, only real user data will remain.
-- =========================================================================================

-- 1. Delete all order line items (depends on orders)
DELETE FROM public.order_line_items;

-- 2. Delete all order items (depends on orders + products)
DELETE FROM public.order_items;

-- 3. Delete all orders
DELETE FROM public.orders;

-- 4. Delete all products (seed products)
DELETE FROM public.products;

-- 5. Delete all ratings
DELETE FROM public.ratings;

-- 6. Delete all bookings
DELETE FROM public.bookings;

-- 7. Delete all requests
DELETE FROM public.requests;

-- 8. Delete all mechanic locations
DELETE FROM public.mechanic_locations;

-- 9. Delete all mechanics (seed mechanics)
DELETE FROM public.mechanics;

-- 10. Delete all sellers (seed sellers)
DELETE FROM public.sellers;

-- 11. Delete all user vehicles
DELETE FROM public.user_vehicles;

-- 12. Delete all user payment methods
DELETE FROM public.user_payment_methods;

-- 13. Delete seed profiles (demo mechanic + seller accounts)
-- Only delete the specific demo accounts, not real users
DELETE FROM public.profiles WHERE id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'f1e2d3c4-b5a6-4c7d-8e9f-0a1b2c3d4e5f'
);

-- 14. Delete seed auth.users (demo mechanic + seller accounts)
DELETE FROM auth.users WHERE id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'f1e2d3c4-b5a6-4c7d-8e9f-0a1b2c3d4e5f'
);

-- Done! All static/seed data has been cleared.
-- Real user accounts created through the app registration will remain.
