-- Table pour stocker les paramètres SEO appliqués par page
CREATE TABLE public.seo_page_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  keywords TEXT[] DEFAULT '{}',
  robots TEXT DEFAULT 'index, follow',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour recherche rapide par URL
CREATE INDEX idx_seo_page_settings_url ON public.seo_page_settings(page_url);

-- Enable RLS
ALTER TABLE public.seo_page_settings ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent gérer les paramètres SEO
CREATE POLICY "Admins can manage SEO settings"
ON public.seo_page_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Lecture publique pour appliquer les settings sur le frontend
CREATE POLICY "Public can read active SEO settings"
ON public.seo_page_settings
FOR SELECT
USING (is_active = true);

-- Trigger pour updated_at
CREATE TRIGGER update_seo_page_settings_updated_at
BEFORE UPDATE ON public.seo_page_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();