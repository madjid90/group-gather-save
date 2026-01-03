-- Table pour stocker l'historique des métriques SEO
CREATE TABLE public.seo_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_title TEXT,
  overall_score INTEGER NOT NULL DEFAULT 0,
  title_score INTEGER DEFAULT 0,
  meta_score INTEGER DEFAULT 0,
  content_score INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  mobile_score INTEGER DEFAULT 0,
  keywords TEXT[] DEFAULT '{}',
  issues TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes par URL et date
CREATE INDEX idx_seo_metrics_url ON public.seo_metrics(page_url);
CREATE INDEX idx_seo_metrics_created_at ON public.seo_metrics(created_at DESC);

-- Enable RLS
ALTER TABLE public.seo_metrics ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent gérer les métriques SEO
CREATE POLICY "Admins can manage SEO metrics"
ON public.seo_metrics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permettre l'insertion par les edge functions (service role)
CREATE POLICY "Service role can insert metrics"
ON public.seo_metrics
FOR INSERT
WITH CHECK (true);