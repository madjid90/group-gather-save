-- Create new campaign status enum with all required statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'new_campaign_status') THEN
    CREATE TYPE public.new_campaign_status AS ENUM (
      'inscriptions_ouvertes',
      'inscriptions_cloturees', 
      'export_genere',
      'offres_importees',
      'offres_envoyees',
      'terminee'
    );
  END IF;
END $$;

-- Create campaigns table for multiple campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  statut public.new_campaign_status DEFAULT 'inscriptions_ouvertes',
  date_debut TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_fin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Progression tracking
  progression_inscriptions_ouvertes BOOLEAN DEFAULT true,
  progression_inscriptions_cloturees BOOLEAN DEFAULT false,
  progression_export_genere BOOLEAN DEFAULT false,
  progression_offres_importees BOOLEAN DEFAULT false,
  progression_offres_envoyees BOOLEAN DEFAULT false,
  progression_acceptations_exportees BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaigns
CREATE POLICY "Admins can manage campaigns"
ON public.campaigns
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view campaigns"
ON public.campaigns
FOR SELECT
USING (true);

-- Create campaign_users junction table
CREATE TABLE IF NOT EXISTS public.campaign_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  statut_dans_campagne TEXT DEFAULT 'inscrit',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS
ALTER TABLE public.campaign_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_users
CREATE POLICY "Admins can manage campaign_users"
ON public.campaign_users
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own campaign entries"
ON public.campaign_users
FOR SELECT
USING (auth.uid() = user_id);

-- Add campaign_id to user_offers if not exists
ALTER TABLE public.user_offers 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id);

-- Add offer_token to user_offers for secure access
ALTER TABLE public.user_offers 
ADD COLUMN IF NOT EXISTS offer_token UUID DEFAULT gen_random_uuid();

-- Add telephone column to sms_logs if not exists
ALTER TABLE public.sms_logs
ADD COLUMN IF NOT EXISTS telephone TEXT;

-- Add type column to sms_logs for categorizing SMS
ALTER TABLE public.sms_logs
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';

-- Add date_derniere_activite to profiles for reactivation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS date_derniere_activite TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add a_reactiver flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS a_reactiver BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_campaign_users_campaign ON public.campaign_users(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_users_user ON public.campaign_users(user_id);
CREATE INDEX IF NOT EXISTS idx_user_offers_campaign ON public.user_offers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_offers_token ON public.user_offers(offer_token);

-- Trigger to update date_derniere_activite
CREATE OR REPLACE FUNCTION public.update_derniere_activite()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_derniere_activite = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_derniere_activite ON public.profiles;
CREATE TRIGGER update_profiles_derniere_activite
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_derniere_activite();