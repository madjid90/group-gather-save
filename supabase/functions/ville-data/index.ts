import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { code_postal } = await req.json();
    if (!code_postal) {
      return new Response(JSON.stringify({ error: "code_postal requis" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // APPEL 1 : geo.api.gouv.fr
    const geoRes = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${code_postal}&fields=nom,code,population,departement,region&format=json&limit=1`
    );
    const geoData = await geoRes.json();
    if (!geoData?.length) {
      return new Response(JSON.stringify({ error: `CP ${code_postal} introuvable` }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const commune = geoData[0];
    const code_insee = commune.code;
    const nom = commune.nom;
    const population = commune.population || 0;
    const departement = commune.departement?.nom || "";
    const region = commune.region?.nom || "";
    const slug = nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "")
      + "-" + code_postal;

    // APPEL 2 : Enedis conso électricité résidentielle
    let nb_logements_elec = null, conso_moyenne_kwh = null;
    try {
      const url = `https://data.enedis.fr/api/explore/v2.1/catalog/datasets/consommation-electrique-par-secteur-dactivite-commune/records?where=code_commune%3D%22${code_insee}%22%20AND%20annee%3D2023%20AND%20libelle_secteur%3D%22R%C3%A9sidentiel%22&limit=1`;
      const data = await (await fetch(url)).json();
      const rec = data.results?.[0];
      if (rec) {
        nb_logements_elec = rec.nb_sites_actifs_residentiel || rec.nb_sites || null;
        const mwh = rec.conso_totale_mwh || 0;
        conso_moyenne_kwh = nb_logements_elec > 0 ? Math.round((mwh * 1000) / nb_logements_elec) : null;
      }
    } catch (e) { console.error("Enedis conso elec:", e); }

    // APPEL 3 : Enedis gestionnaire réseau
    let reseau_elec = "Enedis", nom_eld = null;
    try {
      const url = `https://data.enedis.fr/api/explore/v2.1/catalog/datasets/perimetre-de-desserte-des-gestionnaires-de-reseau-de-distribution-publique/records?where=code_commune%3D%22${code_insee}%22&limit=1`;
      const data = await (await fetch(url)).json();
      const rec = data.results?.[0];
      if (rec) {
        const g = rec.gestionnaire || rec.libelle_gestionnaire || "ENEDIS";
        if (!g.toUpperCase().includes("ENEDIS")) { reseau_elec = "ELD"; nom_eld = g; }
      }
    } catch (e) { console.error("Enedis réseau:", e); }

    // APPEL 4 : Enedis conso gaz résidentielle
    let nb_logements_gaz = null, conso_gaz_kwh = null;
    try {
      const url = `https://data.enedis.fr/api/explore/v2.1/catalog/datasets/consommation-gaz-par-commune-en-2023/records?where=code_commune%3D%22${code_insee}%22%20AND%20secteur%3D%22R%C3%A9sidentiel%22&limit=1`;
      const data = await (await fetch(url)).json();
      const rec = data.results?.[0];
      if (rec) {
        nb_logements_gaz = rec.nb_sites_residentiel || rec.nb_sites || null;
        const mwh = rec.conso_totale_mwh || 0;
        conso_gaz_kwh = nb_logements_gaz > 0 ? Math.round((mwh * 1000) / nb_logements_gaz) : null;
      }
    } catch (e) { console.error("Enedis gaz:", e); }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const villeData = {
      slug, nom, code_postal, code_insee, departement, region, population,
      nb_logements_elec, conso_moyenne_kwh, reseau_elec, nom_eld, prix_trv_kwh: 0.2516,
      nb_logements_gaz, conso_gaz_kwh, reseau_gaz: "GRDF",
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase.from("villes").upsert(villeData, { onConflict: "slug" });
    if (upsertError) console.error("Upsert error:", upsertError);

    return new Response(JSON.stringify({ success: true, data: villeData }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
