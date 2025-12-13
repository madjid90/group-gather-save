-- Add token expiration column with default 7 days from creation
ALTER TABLE public.user_offers 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days');

-- Update existing offers to have expiration 7 days from now
UPDATE public.user_offers 
SET token_expires_at = now() + interval '7 days'
WHERE token_expires_at IS NULL;

-- Drop existing public access policies
DROP POLICY IF EXISTS "Anyone can view offers with valid token" ON public.user_offers;
DROP POLICY IF EXISTS "Anyone can update offer status with valid token" ON public.user_offers;

-- Create new policies that check token expiration
CREATE POLICY "Anyone can view offers with valid non-expired token" 
ON public.user_offers 
FOR SELECT 
USING (
  offer_token IS NOT NULL 
  AND token_expires_at IS NOT NULL 
  AND token_expires_at > now()
);

CREATE POLICY "Anyone can update offer status with valid non-expired token" 
ON public.user_offers 
FOR UPDATE 
USING (
  offer_token IS NOT NULL 
  AND token_expires_at IS NOT NULL 
  AND token_expires_at > now()
)
WITH CHECK (
  offer_token IS NOT NULL 
  AND token_expires_at IS NOT NULL 
  AND token_expires_at > now()
);

-- Create a secure function to get offer by token without exposing sensitive IDs
CREATE OR REPLACE FUNCTION public.get_offer_by_token(p_token uuid)
RETURNS TABLE (
  id uuid,
  offre_nom text,
  fournisseur_nom text,
  prix_kwh numeric,
  abonnement_mensuel numeric,
  economie_estimee_mensuelle numeric,
  economie_estimee_annuelle numeric,
  commentaire_fournisseur text,
  statut text,
  is_expired boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uo.id,
    uo.offre_nom,
    uo.fournisseur_nom,
    uo.prix_kwh,
    uo.abonnement_mensuel,
    uo.economie_estimee_mensuelle,
    uo.economie_estimee_annuelle,
    uo.commentaire_fournisseur,
    uo.statut,
    (uo.token_expires_at IS NULL OR uo.token_expires_at <= now()) as is_expired
  FROM public.user_offers uo
  WHERE uo.offer_token = p_token;
END;
$$;

-- Create a secure function to update offer status by token
CREATE OR REPLACE FUNCTION public.update_offer_status_by_token(p_token uuid, p_statut text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- Get offer and check expiration
  SELECT id, token_expires_at INTO v_offer_id, v_expires_at
  FROM public.user_offers
  WHERE offer_token = p_token;
  
  -- Check if offer exists
  IF v_offer_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if token is expired
  IF v_expires_at IS NULL OR v_expires_at <= now() THEN
    RETURN false;
  END IF;
  
  -- Validate status value
  IF p_statut NOT IN ('acceptee', 'refusee') THEN
    RETURN false;
  END IF;
  
  -- Update the status
  UPDATE public.user_offers
  SET statut = p_statut, updated_at = now()
  WHERE id = v_offer_id;
  
  RETURN true;
END;
$$;