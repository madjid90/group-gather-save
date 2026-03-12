
-- Table singleton — toujours 1 seule ligne (id = 'current')
CREATE TABLE IF NOT EXISTS public.tarifs_energie (
  id                       text PRIMARY KEY DEFAULT 'current',
  trv_elec_kwh             numeric(6,4) NOT NULL DEFAULT 0.2516,
  trv_elec_abo_annuel      numeric(6,2) NOT NULL DEFAULT 150.00,
  meilleure_offre_elec_kwh numeric(6,4) NOT NULL DEFAULT 0.2160,
  trv_gaz_kwh              numeric(6,4) NOT NULL DEFAULT 0.1244,
  trv_gaz_abo_annuel       numeric(6,2) NOT NULL DEFAULT 230.00,
  meilleure_offre_gaz_kwh  numeric(6,4) NOT NULL DEFAULT 0.0870,
  offres_elec_fallback     jsonb,
  offres_gaz_fallback      jsonb,
  source_trv_elec          text DEFAULT 'hardcoded',
  source_trv_gaz           text DEFAULT 'hardcoded',
  source_offres            text DEFAULT 'hardcoded',
  periode_validite         text DEFAULT '2026',
  updated_at               timestamptz DEFAULT now(),
  updated_by               text DEFAULT 'init'
);

ALTER TABLE public.tarifs_energie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecture_publique_tarifs"
  ON public.tarifs_energie FOR SELECT
  TO anon, authenticated USING (true);

INSERT INTO public.tarifs_energie (
  id,
  trv_elec_kwh, trv_elec_abo_annuel, meilleure_offre_elec_kwh,
  trv_gaz_kwh, trv_gaz_abo_annuel, meilleure_offre_gaz_kwh,
  offres_elec_fallback, offres_gaz_fallback,
  source_trv_elec, source_trv_gaz, source_offres, periode_validite, updated_by
) VALUES (
  'current',
  0.2516, 150.00, 0.2160,
  0.1244, 230.00, 0.0870,
  '[
    {"id":"ohm-extra-eco","fournisseur":"OHM Énergie","nom_offre":"Extra Eco","type":"fixe","prix_kwh":0.2180,"abonnement_annuel":149,"label_vert":false,"url_souscription":"https://selectra.info/energie/fournisseurs/ohm-energie"},
    {"id":"octopus-eco","fournisseur":"Octopus Energy","nom_offre":"Eco-conso Fixe","type":"fixe","prix_kwh":0.2210,"abonnement_annuel":155,"label_vert":true,"url_souscription":"https://selectra.info/energie/fournisseurs/octopus-energy"},
    {"id":"alpiq-stable","fournisseur":"Alpiq","nom_offre":"Électricité Stable","type":"fixe","prix_kwh":0.2160,"abonnement_annuel":158,"label_vert":false,"url_souscription":"https://selectra.info/energie/fournisseurs/alpiq"},
    {"id":"total-fixe","fournisseur":"TotalEnergies","nom_offre":"Fixe 2 ans","type":"fixe","prix_kwh":0.2240,"abonnement_annuel":162,"label_vert":false,"url_souscription":"https://selectra.info/energie/fournisseurs/totalenergies"},
    {"id":"engie-3ans","fournisseur":"Engie","nom_offre":"Référence 3 ans","type":"fixe","prix_kwh":0.2280,"abonnement_annuel":168,"label_vert":false,"url_souscription":"https://selectra.info/energie/fournisseurs/engie"}
  ]'::jsonb,
  '[
    {"id":"ohm-gaz","fournisseur":"OHM Énergie","nom_offre":"Gaz Initial","type":"fixe","prix_kwh":0.0870,"abonnement_annuel":220,"label_vert":false,"url_souscription":"https://selectra.info/energie/fournisseurs/ohm-energie"},
    {"id":"total-gaz","fournisseur":"TotalEnergies","nom_offre":"Spéciale Gaz","type":"fixe","prix_kwh":0.0892,"abonnement_annuel":230,"label_vert":false,"url_souscription":"https://selectra.info/energie/fournisseurs/totalenergies"},
    {"id":"engie-gaz","fournisseur":"Engie","nom_offre":"Gaz Référence 3 ans","type":"fixe","prix_kwh":0.0910,"abonnement_annuel":242,"label_vert":false,"url_souscription":"https://selectra.info/energie/fournisseurs/engie"},
    {"id":"ekwateur-biogaz","fournisseur":"Ekwateur","nom_offre":"Biogaz 100%","type":"fixe","prix_kwh":0.0930,"abonnement_annuel":235,"label_vert":true,"url_souscription":"https://selectra.info/energie/fournisseurs/ekwateur"}
  ]'::jsonb,
  'hardcoded', 'hardcoded', 'hardcoded', '2026', 'migration_init'
)
ON CONFLICT (id) DO NOTHING;
