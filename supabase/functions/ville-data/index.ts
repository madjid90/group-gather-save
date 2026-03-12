import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ENEDIS_BASE = "https://opendata.enedis.fr/api/explore/v2.1/catalog/datasets";
const GRDF_BASE = "https://opendata.grdf.fr/api/explore/v2.1/catalog/datasets";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", ".").replace(/\s/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function fetchRecords(baseUrl: string, datasetId: string, where: string, limit = 1) {
  const params = new URLSearchParams({ where, limit: String(limit) });
  const url = `${baseUrl}/${datasetId}/records?${params.toString()}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(`${datasetId} HTTP ${res.status}: ${bodyText.slice(0, 220)}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    throw new Error(`${datasetId} réponse non JSON: ${bodyText.slice(0, 220)}`);
  }

  return Array.isArray(parsed?.results) ? parsed.results : [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { code_postal } = await req.json();
    if (!code_postal) {
      return new Response(JSON.stringify({ error: "code_postal requis" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ── APPEL 1 : geo.api.gouv.fr ──────────────────────────────
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

    // ── APPEL 2 : Enedis conso électricité résidentielle 2023 ──
    let nb_logements_elec: number | null = null;
    let conso_moyenne_kwh: number | null = null;
    try {
      const rows = await fetchRecords(
        ENEDIS_BASE,
        "consommation-electrique-par-secteur-dactivite-commune",
        `code_commune="${code_insee}" AND annee="2023" AND code_grand_secteur="RESIDENTIEL"`,
        1
      );
      const rec = rows[0];
      if (rec) {
        nb_logements_elec = toNumber(rec.nb_sites);
        const consoMoyMwh = toNumber(rec.conso_moyenne_mwh);
        const consoTotaleMwh = toNumber(rec.conso_totale_mwh);

        if (consoMoyMwh !== null) {
          conso_moyenne_kwh = Math.round(consoMoyMwh * 1000);
        } else if (consoTotaleMwh !== null && nb_logements_elec && nb_logements_elec > 0) {
          conso_moyenne_kwh = Math.round((consoTotaleMwh * 1000) / nb_logements_elec);
        }
      }
    } catch (e) {
      console.error("Enedis conso elec:", e);
    }

    // ── APPEL 3 : Gestionnaire réseau (ELD / Enedis) ───────────
    // Ce dataset n'est plus sur opendata.enedis.fr → on assume Enedis par défaut
    let reseau_elec = "Enedis";
    let nom_eld: string | null = null;

    // ── APPEL 4 : GRDF conso gaz résidentielle 2023 ────────────
    // Source : opendata.grdf.fr — dataset IRIS, agrégé par commune
    let nb_logements_gaz: number | null = null;
    let conso_gaz_kwh: number | null = null;
    try {
      const rows = await fetchRecords(
        GRDF_BASE,
        "consommation-annuelle-de-gaz-par-iris-et-code-naf0",
        `code_insee_commune="${code_insee}" AND annee_consommation=date'2023' AND libelle_grand_secteur_activite="Résidentiel"`,
        200 // Max IRIS par commune (ex: Paris en a ~120)
      );

      if (rows.length > 0) {
        // Agréger les IRIS : somme des PDL et somme des MWh
        let totalPdl = 0;
        let totalMwh = 0;

        for (const row of rows) {
          const pdl = toNumber(row.nombre_points_de_livraison);
          const mwh = toNumber(row.consommation_annuelle_en_mwh);
          if (pdl !== null) totalPdl += pdl;
          if (mwh !== null) totalMwh += mwh;
        }

        nb_logements_gaz = totalPdl > 0 ? totalPdl : null;
        conso_gaz_kwh = (totalPdl > 0 && totalMwh > 0)
          ? Math.round((totalMwh * 1000) / totalPdl)
          : null;

        console.log(`[ville-data] GRDF ${nom}: ${rows.length} IRIS, ${totalPdl} PCE, ${totalMwh.toFixed(0)} MWh → ${conso_gaz_kwh} kWh/an`);
      }
    } catch (e) {
      console.error("GRDF gaz:", e);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Lire le TRV depuis la table tarifs_energie
    let prix_trv_kwh = 0.2516;
    try {
      const { data: tarifs } = await supabase
        .from("tarifs_energie")
        .select("trv_elec_kwh")
        .eq("id", "current")
        .single();
      if (tarifs?.trv_elec_kwh) prix_trv_kwh = tarifs.trv_elec_kwh;
    } catch (e) {
      console.error("Tarifs lecture failed:", e);
    }

    const villeData = {
      slug,
      nom,
      code_postal,
      code_insee,
      departement,
      region,
      population,
      nb_logements_elec,
      conso_moyenne_kwh,
      reseau_elec,
      nom_eld,
      prix_trv_kwh,
      nb_logements_gaz,
      conso_gaz_kwh,
      reseau_gaz: "GRDF",
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
