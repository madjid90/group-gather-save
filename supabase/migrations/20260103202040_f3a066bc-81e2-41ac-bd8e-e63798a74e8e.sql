-- Remove overly permissive RLS policies on user_offers
-- Token-based access is already handled securely by SECURITY DEFINER functions:
-- - get_offer_by_token
-- - update_offer_status_by_token

-- Drop the permissive SELECT policy for token access
DROP POLICY IF EXISTS "Anyone can view offers with valid token and active campaign" ON public.user_offers;

-- Drop the permissive UPDATE policy for token access
DROP POLICY IF EXISTS "Anyone can update offer status with valid token and active camp" ON public.user_offers;