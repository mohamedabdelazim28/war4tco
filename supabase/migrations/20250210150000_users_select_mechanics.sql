-- Allow authenticated users to list mechanics (for booking flow)
CREATE POLICY "Authenticated users can view mechanics"
  ON public.mechanics
  FOR SELECT
  TO authenticated
  USING (true);
