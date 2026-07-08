-- Allow public read access to whatsapp_bot_item_colors
-- Run in Supabase Dashboard → SQL Editor (alongside enable_public_read.sql)

ALTER TABLE public.whatsapp_bot_item_colors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.whatsapp_bot_item_colors;

CREATE POLICY "Allow public read access"
  ON public.whatsapp_bot_item_colors
  FOR SELECT
  TO anon, authenticated
  USING (true);
