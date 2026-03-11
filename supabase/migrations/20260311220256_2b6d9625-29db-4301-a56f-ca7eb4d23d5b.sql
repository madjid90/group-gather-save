
CREATE TABLE IF NOT EXISTS public.villes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  nom text NOT NULL,
  code_postal text NOT NULL,
  code_insee text NOT NULL,
  departement text,
  region text,
  population integer,
  nb_logements integer,
  conso_moyenne_kwh numeric(10,2),
  reseau text DEFAULT 'Enedis',
  nom_eld text,
  prix_moyen_kwh numeric(6,4) DEFAULT 0.2516,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_villes_slug ON public.villes(slug);
CREATE INDEX IF NOT EXISTS idx_villes_code_postal ON public.villes(code_postal);
CREATE INDEX IF NOT EXISTS idx_villes_code_insee ON public.villes(code_insee);

ALTER TABLE public.villes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique villes"
  ON public.villes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage villes"
  ON public.villes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
