-- Add phone to profiles and update trigger to set it from signup metadata
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

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
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    profile_role
  );
  RETURN NEW;
END;
$$;
