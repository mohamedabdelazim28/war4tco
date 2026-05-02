-- Allow users to insert their own profile row (fallback when trigger on auth.users did not run)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());
