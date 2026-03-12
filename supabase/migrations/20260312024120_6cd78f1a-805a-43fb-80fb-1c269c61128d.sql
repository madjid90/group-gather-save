UPDATE public.villes SET
  contenu_elec_intro = NULL,
  contenu_elec_contexte = NULL,
  contenu_elec_conseils = NULL,
  contenu_elec_meta = NULL,
  contenu_gaz_intro = NULL,
  contenu_gaz_contexte = NULL,
  contenu_gaz_conseils = NULL,
  contenu_gaz_meta = NULL,
  contenu_genere_at = NULL
WHERE contenu_genere_at IS NOT NULL;