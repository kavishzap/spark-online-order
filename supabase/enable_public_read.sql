-- Allow public (anonymous) read access to whatsapp_bot_items (SodaMax only)
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.whatsapp_bot_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.whatsapp_bot_items;

CREATE POLICY "Allow public read access"
  ON public.whatsapp_bot_items
  FOR SELECT
  TO anon, authenticated
  USING (company = 'sodamax');
