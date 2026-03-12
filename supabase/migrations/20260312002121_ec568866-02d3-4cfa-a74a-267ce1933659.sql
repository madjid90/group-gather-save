
-- Rename villes columns for clarity (elec vs gaz)
ALTER TABLE villes RENAME COLUMN nb_logements TO nb_logements_elec;
ALTER TABLE villes RENAME COLUMN reseau TO reseau_elec;
ALTER TABLE villes RENAME COLUMN prix_moyen_kwh TO prix_trv_kwh;

-- Add gaz data columns
ALTER TABLE villes ADD COLUMN IF NOT EXISTS nb_logements_gaz integer;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS conso_gaz_kwh numeric;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS reseau_gaz text DEFAULT 'GRDF';

-- Add IA content columns
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_elec_meta text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_elec_intro text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_elec_contexte text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_elec_conseils text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_gaz_meta text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_gaz_intro text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_gaz_contexte text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_gaz_conseils text;
ALTER TABLE villes ADD COLUMN IF NOT EXISTS contenu_genere_at timestamptz;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_villes_code_postal ON villes(code_postal);
CREATE INDEX IF NOT EXISTS idx_villes_code_insee ON villes(code_insee);
CREATE INDEX IF NOT EXISTS idx_villes_departement ON villes(departement);

-- Leads: add missing columns for 6-step comparator form
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ville text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS type_logement text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS nb_personnes integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mode_chauffage text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS eau_chaude text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fournisseur_actuel text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tarif_reglemente boolean;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conso_estimee_kwh integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS economie_estimee integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consentement boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS note text;

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_statut ON leads(statut);
CREATE INDEX IF NOT EXISTS idx_leads_telephone ON leads(telephone);
