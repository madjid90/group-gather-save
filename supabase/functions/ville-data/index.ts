import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code_postal } = await req.json();

    if (!code_postal) {
      return new Response(
        JSON.stringify({ error: "code_postal requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── APPEL 1 : geo.api.gouv.fr ──
    const geoRes = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${code_postal}&fields=nom,code,population,codesPostaux,departement,region&format=json&limit=1`
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return new Response(
        JSON.stringify({ error: `Commune non trouvée pour CP ${code_postal}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const commune = geoData[0];
    const code_insee = commune.code;
    const nom = commune.nom;
    const population = commune.population || 0;
    const departement = commune.departement?.nom || "";
    const region = commune.region?.nom || "";

    // ── APPEL 2 : Enedis — consommation résidentielle par commune ──
    let conso_moyenne_kwh = null;
    let nb_logements = null;

    try {
      const enedisUrl = `https://data.enedis.fr/api/explore/v2.1/catalog/datasets/consommation-electrique-par-secteur-dactivite-commune/records?where=code_commune%3D%22${code_insee}%22%20AND%20annee%3D2023%20AND%20libelle_secteur%3D%22R%C3%A9sidentiel%22&limit=1`;
      const enedisRes = await fetch(enedisUrl);
      const enedisData = await enedisRes.json();
      const record = enedisData.results?.[0];

      if (record) {
        const conso_totale_mwh = record.conso_totale_mwh || 0;
        const nb_sites = record.nb_sites_actifs_residentiel || record.nb_sites || 1;
        nb_logements = nb_sites;
        conso_moyenne_kwh = nb_sites > 0
          ? Math.round((conso_totale_mwh * 1000) / nb_sites)
          : null;
      }
    } catch (e) {
      console.error("Erreur Enedis conso:", e);
    }

    // ── APPEL 3 : Enedis — périmètre distributeur ──
    let reseau = "Enedis";
    let nom_eld = null;

    try {
      const reseauUrl = `https://data.enedis.fr/api/explore/v2.1/catalog/datasets/perimetre-de-desserte-des-gestionnaires-de-reseau-de-distribution-publique/records?where=code_commune%3D%22${code_insee}%22&limit=1`;
      const reseauRes = await fetch(reseauUrl);
      const reseauData = await reseauRes.json();
      const distributeur = reseauData.results?.[0];

      if (distributeur) {
        const gestionnaire = distributeur.gestionnaire || distributeur.libelle_gestionnaire || "ENEDIS";
        if (gestionnaire.toUpperCase().includes("ENEDIS")) {
          reseau = "Enedis";
          nom_eld = null;
        } else {
          reseau = "ELD";
          nom_eld = gestionnaire;
        }
      }
    } catch (e) {
      console.error("Erreur Enedis réseau:", e);
    }

    // ── CONSTRUCTION DU SLUG ──
    const slug = nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + code_postal;

    // ── UPSERT DANS SUPABASE ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const villeData = {
      slug,
      nom,
      code_postal,
      code_insee,
      departement,
      region,
      population,
      nb_logements,
      conso_moyenne_kwh,
      reseau,
      nom_eld,
      prix_moyen_kwh: 0.2516,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("villes")
      .upsert(villeData, { onConflict: "slug" });

    if (upsertError) {
      console.error("Erreur upsert:", upsertError);
    }

    return new Response(
      JSON.stringify({ success: true, data: villeData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
