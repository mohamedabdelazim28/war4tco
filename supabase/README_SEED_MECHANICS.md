# Seed mechanics for booking

The migration `20250210160000_seed_mechanics.sql` and `seed.sql` add 3 demo mechanics so the "Book a mechanic" screen shows results.

## Why no rows were inserted

The seed needs an **instance_id** from the auth schema (`auth.instances` or from an existing user in `auth.users`). If the project has no users yet, both are empty and the seed skips creating new auth users (so no mechanics are added).

## What was changed

- The migration now gets **instance_id** from `auth.instances` or, if that’s empty, from **any existing row in `auth.users`**.
- If there is still no instance_id, it tries to add **mechanics rows for any existing profiles with role = mechanic** (so you can create mechanic users in the Dashboard first, then run the migration/seed to fill `mechanics`).

## What to do

### Option A – Local (Supabase CLI)

1. Start the DB and run migrations + seed:
   ```bash
   supabase db reset
   ```
   With a fresh `supabase start`, `auth.instances` should have a row, so the seed should create the 3 mechanic users and 3 mechanics.

### Option B – You already have at least one user

If you’ve already signed up once (any role):

1. Run the migration again, or run the contents of `seed.sql` in the Supabase SQL Editor.
2. The script will use `instance_id` from the existing user and insert the 3 mechanic accounts and 3 mechanics.

### Option C – Cloud project, no users yet

1. In Supabase Dashboard: **Authentication → Users → Add user**. Create one user (e.g. email `admin@test.com`, set role in **User metadata** to `user`).
2. Then in **SQL Editor**, run the contents of `seed.sql` (or run the seed migration again). The script will use that user’s `instance_id` and create the 3 mechanic users and 3 mechanics.

### Option D – Add mechanics for existing mechanic accounts

If you already created users with role **mechanic** (e.g. via sign-up or Dashboard):

1. Run in SQL Editor:
   ```sql
   INSERT INTO public.mechanics (user_id, workshop_name, experience_years, rating, availability_status)
   SELECT p.id, COALESCE(p.name, 'Mechanic') || ' Workshop', 5, 4.5, 'available'
   FROM public.profiles p
   LEFT JOIN public.mechanics m ON m.user_id = p.id
   WHERE p.role = 'mechanic' AND m.id IS NULL;
   ```
   This adds one mechanics row per profile that is a mechanic and doesn’t have a mechanics row yet.

## Demo mechanic logins (when seed runs successfully)

| Email                         | Password          |
|-------------------------------|-------------------|
| mechanic1@demo.autoassist.app | MechanicPass123!  |
| mechanic2@demo.autoassist.app | MechanicPass123!  |
| mechanic3@demo.autoassist.app | MechanicPass123!  |

Workshop names: **Alex Garage**, **Riverside Auto**, **Quick Fix Motors**.
