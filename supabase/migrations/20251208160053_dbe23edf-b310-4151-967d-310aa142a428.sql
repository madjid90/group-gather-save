-- Allow anonymous users to insert housing profiles using the token validation
CREATE OR REPLACE FUNCTION public.insert_housing_profile_with_token(
  p_token uuid,
  p_type_logement text,
  p_surface integer,
  p_nombre_occupants integer,
  p_isolation text,
  p_mode_chauffage text,
  p_chauffe_eau_electrique boolean,
  p_fournisseur_electricite text,
  p_option_tarifaire text,
  p_puissance_compteur text,
  p_montant_facture numeric,
  p_type_connexion text,
  p_fournisseur_internet text,
  p_prix_mensuel_internet numeric,
  p_satisfaction_internet integer,
  p_eligible_fibre boolean,
  p_temps_domicile text,
  p_equipements_energivores text[],
  p_recharge_vehicule_electrique boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Validate token and get user_id
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE housing_token = p_token;
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Insert or update housing profile
  INSERT INTO public.housing_profiles (
    user_id, type_logement, surface, nombre_occupants, isolation,
    mode_chauffage, chauffe_eau_electrique, fournisseur_electricite,
    option_tarifaire, puissance_compteur, montant_facture, type_connexion,
    fournisseur_internet, prix_mensuel_internet, satisfaction_internet,
    eligible_fibre, temps_domicile, equipements_energivores, recharge_vehicule_electrique
  ) VALUES (
    v_user_id, p_type_logement, p_surface, p_nombre_occupants, p_isolation,
    p_mode_chauffage, p_chauffe_eau_electrique, p_fournisseur_electricite,
    p_option_tarifaire, p_puissance_compteur, p_montant_facture, p_type_connexion,
    p_fournisseur_internet, p_prix_mensuel_internet, p_satisfaction_internet,
    p_eligible_fibre, p_temps_domicile, p_equipements_energivores, p_recharge_vehicule_electrique
  )
  ON CONFLICT (user_id) DO UPDATE SET
    type_logement = EXCLUDED.type_logement,
    surface = EXCLUDED.surface,
    nombre_occupants = EXCLUDED.nombre_occupants,
    isolation = EXCLUDED.isolation,
    mode_chauffage = EXCLUDED.mode_chauffage,
    chauffe_eau_electrique = EXCLUDED.chauffe_eau_electrique,
    fournisseur_electricite = EXCLUDED.fournisseur_electricite,
    option_tarifaire = EXCLUDED.option_tarifaire,
    puissance_compteur = EXCLUDED.puissance_compteur,
    montant_facture = EXCLUDED.montant_facture,
    type_connexion = EXCLUDED.type_connexion,
    fournisseur_internet = EXCLUDED.fournisseur_internet,
    prix_mensuel_internet = EXCLUDED.prix_mensuel_internet,
    satisfaction_internet = EXCLUDED.satisfaction_internet,
    eligible_fibre = EXCLUDED.eligible_fibre,
    temps_domicile = EXCLUDED.temps_domicile,
    equipements_energivores = EXCLUDED.equipements_energivores,
    recharge_vehicule_electrique = EXCLUDED.recharge_vehicule_electrique,
    updated_at = now();
  
  -- Mark form as completed
  UPDATE public.profiles SET housing_form_completed = true WHERE id = v_user_id;
  
  RETURN true;
END;
$$;

-- Add unique constraint on user_id for housing_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'housing_profiles_user_id_key'
  ) THEN
    ALTER TABLE public.housing_profiles ADD CONSTRAINT housing_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.insert_housing_profile_with_token TO anon;
GRANT EXECUTE ON FUNCTION public.insert_housing_profile_with_token TO authenticated;