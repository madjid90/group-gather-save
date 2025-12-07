
-- Create enums for new fields
CREATE TYPE public.compteur_type AS ENUM ('linky', 'ancien');
CREATE TYPE public.connexion_type AS ENUM ('fibre', 'adsl', '4g_box');
CREATE TYPE public.campaign_status AS ENUM ('ouverte', 'fermee', 'en_negociation', 'offre_prete', 'archivee');
CREATE TYPE public.offer_target AS ENUM ('energie', 'internet', 'tous');

-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN fournisseur_energie_actuel TEXT,
ADD COLUMN fournisseur_internet_actuel TEXT,
ADD COLUMN type_compteur compteur_type,
ADD COLUMN type_connexion_internet connexion_type,
ADD COLUMN prix_actuel_internet NUMERIC,
ADD COLUMN puissance_compteur TEXT,
ADD COLUMN notes_admin TEXT,
ADD COLUMN inclusion_campagne BOOLEAN DEFAULT true;

-- Create campaign settings table (singleton for global campaign)
CREATE TABLE public.campaign_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  statut campaign_status DEFAULT 'ouverte',
  objectif INTEGER DEFAULT 1000,
  date_debut TIMESTAMP WITH TIME ZONE,
  date_fin TIMESTAMP WITH TIME ZONE,
  message_officiel TEXT,
  prochaine_etape TEXT,
  description_publique TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on campaign_settings
ALTER TABLE public.campaign_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_settings
CREATE POLICY "Anyone can view campaign settings"
ON public.campaign_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage campaign settings"
ON public.campaign_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create campaign timeline table
CREATE TABLE public.campaign_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  etape_numero INTEGER NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  date_prevue TIMESTAMP WITH TIME ZONE,
  completee BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on campaign_timeline
ALTER TABLE public.campaign_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign timeline"
ON public.campaign_timeline FOR SELECT USING (true);

CREATE POLICY "Admins can manage campaign timeline"
ON public.campaign_timeline FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add new fields to offres table
ALTER TABLE public.offres
ADD COLUMN prix_negocie NUMERIC,
ADD COLUMN avantage_client TEXT,
ADD COLUMN conditions TEXT,
ADD COLUMN date_validite TIMESTAMP WITH TIME ZONE,
ADD COLUMN fichier_url TEXT,
ADD COLUMN groupe_cible offer_target DEFAULT 'tous',
ADD COLUMN publie BOOLEAN DEFAULT false;

-- Create admin_settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_site TEXT DEFAULT 'Switchly',
  message_global TEXT,
  collecte_avancee_active BOOLEAN DEFAULT true,
  email_confirmation_active BOOLEAN DEFAULT true,
  email_statut_active BOOLEAN DEFAULT true,
  email_offre_active BOOLEAN DEFAULT true,
  script_analytics TEXT,
  pixel_publicitaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view admin settings"
ON public.admin_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage admin settings"
ON public.admin_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default campaign settings
INSERT INTO public.campaign_settings (statut, objectif, prochaine_etape)
VALUES ('ouverte', 1000, 'Collecte des inscriptions en cours');

-- Insert default timeline steps
INSERT INTO public.campaign_timeline (etape_numero, titre, description) VALUES
(1, 'Ouverture des inscriptions', 'Les utilisateurs peuvent s''inscrire à la campagne'),
(2, 'Fermeture des inscriptions', 'Fin de la période d''inscription'),
(3, 'Analyse des données', 'Analyse des besoins et profils des participants'),
(4, 'Négociation fournisseurs', 'Négociation des meilleures offres avec les fournisseurs'),
(5, 'Publication de l''offre', 'Les offres négociées sont disponibles pour les participants');

-- Insert default admin settings
INSERT INTO public.admin_settings (nom_site) VALUES ('Switchly');

-- Create storage bucket for offer files
INSERT INTO storage.buckets (id, name, public) VALUES ('offer-files', 'offer-files', true);

-- Storage policies for offer files
CREATE POLICY "Anyone can view offer files"
ON storage.objects FOR SELECT
USING (bucket_id = 'offer-files');

CREATE POLICY "Admins can upload offer files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'offer-files' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update offer files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'offer-files' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete offer files"
ON storage.objects FOR DELETE
USING (bucket_id = 'offer-files' AND has_role(auth.uid(), 'admin'));

-- Update triggers for new tables
CREATE TRIGGER update_campaign_settings_updated_at
BEFORE UPDATE ON public.campaign_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_timeline_updated_at
BEFORE UPDATE ON public.campaign_timeline
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
