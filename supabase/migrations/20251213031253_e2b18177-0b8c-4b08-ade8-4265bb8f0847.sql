-- Remove the default 7-day expiration and set to NULL
ALTER TABLE public.user_offers 
ALTER COLUMN token_expires_at DROP DEFAULT;

-- Set all existing token_expires_at to NULL (will use campaign status instead)
UPDATE public.user_offers 
SET token_expires_at = NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view offers with valid non-expired token" ON public.user_offers;
DROP POLICY IF EXISTS "Anyone can update offer status with valid non-expired token" ON public.user_offers;

-- Create new policies that check campaign status instead of token expiration
CREATE POLICY "Anyone can view offers with valid token and active campaign" 
ON public.user_offers 
FOR SELECT 
USING (
  offer_token IS NOT NULL 
  AND (
    campaign_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.campaigns c 
      WHERE c.id = campaign_id 
      AND c.statut != 'terminee'
    )
  )
);

CREATE POLICY "Anyone can update offer status with valid token and active campaign" 
ON public.user_offers 
FOR UPDATE 
USING (
  offer_token IS NOT NULL 
  AND (
    campaign_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.campaigns c 
      WHERE c.id = campaign_id 
      AND c.statut != 'terminee'
    )
  )
)
WITH CHECK (
  offer_token IS NOT NULL 
  AND (
    campaign_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.campaigns c 
      WHERE c.id = campaign_id 
      AND c.statut != 'terminee'
    )
  )
);

-- Update get_offer_by_token function to check campaign status
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
    -- Token is expired if campaign is terminated
    (
      uo.campaign_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.campaigns c 
        WHERE c.id = uo.campaign_id 
        AND c.statut = 'terminee'
      )
    ) as is_expired
  FROM public.user_offers uo
  WHERE uo.offer_token = p_token;
END;
$$;

-- Update update_offer_status_by_token function to check campaign status
CREATE OR REPLACE FUNCTION public.update_offer_status_by_token(p_token uuid, p_statut text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer_id uuid;
  v_campaign_id uuid;
  v_campaign_status text;
BEGIN
  -- Get offer and campaign info
  SELECT id, campaign_id INTO v_offer_id, v_campaign_id
  FROM public.user_offers
  WHERE offer_token = p_token;
  
  -- Check if offer exists
  IF v_offer_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if campaign is terminated
  IF v_campaign_id IS NOT NULL THEN
    SELECT statut INTO v_campaign_status
    FROM public.campaigns
    WHERE id = v_campaign_id;
    
    IF v_campaign_status = 'terminee' THEN
      RETURN false;
    END IF;
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