-- Allow public access to user_offers via offer_token (for SMS links)
CREATE POLICY "Public can view offers by token"
ON public.user_offers
FOR SELECT
USING (true);

-- Also allow public updates for accepting/refusing offers via token
CREATE POLICY "Public can update offers by token"
ON public.user_offers
FOR UPDATE
USING (true)
WITH CHECK (true);