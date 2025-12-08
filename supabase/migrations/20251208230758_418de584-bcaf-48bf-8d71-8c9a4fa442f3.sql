-- Table pour stocker les exports et le mapping client_id -> user_id
CREATE TABLE public.campaign_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaign_settings(id) ON DELETE CASCADE,
  export_date timestamptz DEFAULT now(),
  total_profiles integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table pour le mapping anonyme client_id -> user_id par export
CREATE TABLE public.export_client_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_id uuid REFERENCES public.campaign_exports(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(export_id, client_id)
);

-- Table pour stocker les offres utilisateur importées
CREATE TABLE public.user_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  export_id uuid REFERENCES public.campaign_exports(id) ON DELETE SET NULL,
  client_id text,
  fournisseur_nom text,
  offre_nom text,
  prix_kwh numeric,
  abonnement_mensuel numeric,
  economie_estimee_mensuelle numeric,
  economie_estimee_annuelle numeric,
  commentaire_fournisseur text,
  statut text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_client_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_exports
CREATE POLICY "Admins can manage campaign exports"
ON public.campaign_exports FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for export_client_mapping
CREATE POLICY "Admins can manage export mappings"
ON public.export_client_mapping FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for user_offers
CREATE POLICY "Admins can manage all user offers"
ON public.user_offers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own offers"
ON public.user_offers FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_offers_updated_at
BEFORE UPDATE ON public.user_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();