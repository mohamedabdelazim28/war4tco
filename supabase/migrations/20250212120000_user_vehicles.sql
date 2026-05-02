-- User vehicles for profile/garage
CREATE TABLE IF NOT EXISTS public.user_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  license_plate text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles"
  ON public.user_vehicles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own vehicles"
  ON public.user_vehicles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vehicles"
  ON public.user_vehicles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own vehicles"
  ON public.user_vehicles FOR DELETE
  USING (user_id = auth.uid());
