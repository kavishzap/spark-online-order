-- Run this once in Supabase Dashboard → SQL Editor
-- Enables public product + color reads for the deployed storefront

-- Catalog items (SodaMax storefront)
ALTER TABLE public.whatsapp_bot_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.whatsapp_bot_items;

CREATE POLICY "Allow public read access"
  ON public.whatsapp_bot_items
  FOR SELECT
  TO anon, authenticated
  USING (company = 'sodamax');

-- Item colors
ALTER TABLE public.whatsapp_bot_item_colors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.whatsapp_bot_item_colors;

CREATE POLICY "Allow public read access"
  ON public.whatsapp_bot_item_colors
  FOR SELECT
  TO anon, authenticated
  USING (true);
