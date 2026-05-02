CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand text NOT NULL,
  last4 text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON public.user_payment_methods FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payment methods"
  ON public.user_payment_methods FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payment methods"
  ON public.user_payment_methods FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own payment methods"
  ON public.user_payment_methods FOR DELETE
  USING (user_id = auth.uid());
