-- Table pour stocker les pages SEO locales générées
CREATE TABLE public.local_seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ville TEXT NOT NULL,
  code_postal TEXT,
  slug TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  meta_description TEXT,
  contenu_hero TEXT,
  contenu_principal TEXT,
  contenu_avantages TEXT,
  contenu_cta TEXT,
  mots_cles TEXT[],
  publie BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX idx_local_seo_pages_slug ON public.local_seo_pages(slug);
CREATE INDEX idx_local_seo_pages_ville ON public.local_seo_pages(ville);
CREATE INDEX idx_local_seo_pages_publie ON public.local_seo_pages(publie);

-- Enable RLS
ALTER TABLE public.local_seo_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Les pages publiées sont accessibles à tous
CREATE POLICY "Pages publiées accessibles à tous" 
ON public.local_seo_pages 
FOR SELECT 
USING (publie = true);

-- Policy: Admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer les pages" 
ON public.local_seo_pages 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger pour updated_at
CREATE TRIGGER update_local_seo_pages_updated_at
BEFORE UPDATE ON public.local_seo_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();