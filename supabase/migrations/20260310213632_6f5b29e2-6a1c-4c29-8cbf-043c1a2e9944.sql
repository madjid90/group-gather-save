CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT,
  telephone TEXT,
  email TEXT,
  code_postal TEXT,
  type_energie TEXT,
  superficie TEXT,
  fournisseur_choisi TEXT,
  offre_choisie TEXT,
  url_affiliation TEXT,
  source TEXT DEFAULT 'comparateur',
  statut TEXT DEFAULT 'nouveau',
  commission_eur DECIMAL(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (from comparator page, no auth required)
CREATE POLICY "Anyone can insert leads"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read/manage leads
CREATE POLICY "Admins can manage leads"
ON public.leads FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));