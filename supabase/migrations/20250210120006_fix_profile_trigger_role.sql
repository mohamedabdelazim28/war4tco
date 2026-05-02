-- Fix: set profile.role from signup metadata (name, email, role) so new accounts get the chosen role
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
