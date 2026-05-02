-- Mechanics can see pending requests (for nearby list) and accept them (update pending rows).
-- Existing policies still allow mechanics to view/update requests assigned to them.

CREATE POLICY "Mechanics can view pending requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (SELECT 1 FROM public.mechanics m WHERE m.user_id = auth.uid())
  );

CREATE POLICY "Mechanics can accept pending requests"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (
    status = 'pending'
    AND mechanic_id IS NULL
    AND EXISTS (SELECT 1 FROM public.mechanics m WHERE m.user_id = auth.uid())
  )
  WITH CHECK (true);
