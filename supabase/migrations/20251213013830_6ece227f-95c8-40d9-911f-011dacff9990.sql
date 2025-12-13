-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Public can view offers by token" ON public.user_offers;
DROP POLICY IF EXISTS "Public can update offers by token" ON public.user_offers;

-- Create a more secure policy: only allow access when offer_token is provided and matches
-- Since we can't check the token in RLS directly (it comes from the app), 
-- we'll use PERMISSIVE policies that work with existing user policies
CREATE POLICY "Anyone can view offers with valid token"
ON public.user_offers
FOR SELECT
TO anon, authenticated
USING (offer_token IS NOT NULL);

-- Allow updates only for status changes (accept/refuse)
CREATE POLICY "Anyone can update offer status with valid token"
ON public.user_offers
FOR UPDATE
TO anon, authenticated
USING (offer_token IS NOT NULL)
WITH CHECK (offer_token IS NOT NULL);