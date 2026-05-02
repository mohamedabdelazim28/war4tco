-- Seed demo mechanics (runs after migrations on supabase db reset).
-- Password for all: MechanicPass123!

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  ELSE
    INSERT INTO public.mechanics (user_id, workshop_name, experience_years, rating, availability_status)
    SELECT p.id, COALESCE(p.name, 'Mechanic') || ' Workshop', 5, 4.5, 'available'
    FROM public.profiles p
    LEFT JOIN public.mechanics m ON m.user_id = p.id
    WHERE p.role = 'mechanic' AND m.id IS NULL;
  END IF;
END $$;
