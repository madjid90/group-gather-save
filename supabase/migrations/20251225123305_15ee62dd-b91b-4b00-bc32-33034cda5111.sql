-- Table pour tracker les clics
CREATE TABLE public.click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'cta_inscription', 'offre_acceptee', 'offre_refusee'
  source TEXT, -- 'hero', 'cta_section', 'mobile_cta', 'navbar', 'mon_offre'
  user_id UUID, -- nullable pour les clics anonymes
  offer_id UUID REFERENCES public.user_offers(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes analytics
CREATE INDEX idx_click_events_type ON public.click_events(event_type);
CREATE INDEX idx_click_events_created_at ON public.click_events(created_at);
CREATE INDEX idx_click_events_source ON public.click_events(source);

-- Enable RLS
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Politique: tout le monde peut insérer (tracking anonyme)
CREATE POLICY "Anyone can insert click events"
ON public.click_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Politique: seuls les admins peuvent lire
CREATE POLICY "Admins can view all click events"
ON public.click_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));