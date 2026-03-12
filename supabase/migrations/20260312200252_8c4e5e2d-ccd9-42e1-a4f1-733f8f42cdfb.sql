-- Ajouter les colonnes de publication sur la table villes
ALTER TABLE public.villes
  ADD COLUMN IF NOT EXISTS statut_publication TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS validation_ia_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS validation_ia_statut TEXT,
  ADD COLUMN IF NOT EXISTS validation_ia_commentaire TEXT,
  ADD COLUMN IF NOT EXISTS validation_ia_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validation_humaine_statut TEXT,
  ADD COLUMN IF NOT EXISTS validation_humaine_par TEXT,
  ADD COLUMN IF NOT EXISTS validation_humaine_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validation_humaine_note TEXT,
  ADD COLUMN IF NOT EXISTS import_batch_id TEXT,
  ADD COLUMN IF NOT EXISTS generation_tentatives INTEGER DEFAULT 0;

-- Index pour filtrer rapidement par statut
CREATE INDEX IF NOT EXISTS idx_villes_statut ON public.villes(statut_publication);
CREATE INDEX IF NOT EXISTS idx_villes_batch ON public.villes(import_batch_id);

-- Table pour les jobs d'import batch
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT UNIQUE NOT NULL,
  statut TEXT DEFAULT 'en_attente',
  total_cps INTEGER DEFAULT 0,
  traites INTEGER DEFAULT 0,
  publiees INTEGER DEFAULT 0,
  a_valider INTEGER DEFAULT 0,
  erreurs INTEGER DEFAULT 0,
  codes_postaux TEXT[],
  cp_restants TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins import_jobs"
  ON public.import_jobs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));