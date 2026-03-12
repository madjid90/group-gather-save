import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ENEDIS_BASE = "https://opendata.enedis.fr/api/explore/v2.1/catalog/datasets";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function fetchEnedisRecords(datasetId: string, where: string, limit = 1) {
  const params = new URLSearchParams({ where, limit: String(limit) });
  const url = `${ENEDIS_BASE}/${datasetId}/records?${params.toString()}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(`Enedis ${datasetId} HTTP ${res.status}: ${bodyText.slice(0, 220)}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    throw new Error(`Enedis ${datasetId} réponse non JSON: ${bodyText.slice(0, 220)}`);
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

    // APPEL 2 : Enedis conso électricité résidentielle (2023)
    let nb_logements_elec: number | null = null;
    let conso_moyenne_kwh: number | null = null;
    try {
      const rows = await fetchEnedisRecords(
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

    // APPEL 3 : Gestionnaire de réseau (ELD / Enedis)
    let reseau_elec = "Enedis";
    let nom_eld: string | null = null;
    try {
      const rows = await fetchEnedisRecords(
        "perimetre-de-desserte-des-gestionnaires-de-reseau-de-distribution-publique",
        `code_commune="${code_insee}"`,
        1
      );
      const rec = rows[0];
      if (rec) {
        const g = String(rec.gestionnaire || rec.libelle_gestionnaire || "ENEDIS");
        if (!g.toUpperCase().includes("ENEDIS")) {
          reseau_elec = "ELD";
          nom_eld = g;
        }
      }
    } catch (e) {
      console.error("Enedis réseau:", e);
    }

    // APPEL 4 : Tentative conso gaz 2023 via portail Enedis (si disponible)
    let nb_logements_gaz: number | null = null;
    let conso_gaz_kwh: number | null = null;
    try {
      const rows = await fetchEnedisRecords(
        "consommation-annuelle-delectricite-et-gaz-par-commune",
        `code_commune="${code_insee}" AND annee="2023"`,
        200
      );

      const gazRows = rows.filter((r: any) => {
        const filiere = String(r.filiere || r.energie || "").toLowerCase();
        return filiere.includes("gaz");
      });

      const gazRow = gazRows.find((r: any) => {
        const secteur = String(r.code_grand_secteur || r.grand_secteur || r.secteur || "").toLowerCase();
        return secteur.includes("res");
      }) || gazRows[0];

      if (gazRow) {
        nb_logements_gaz = toNumber(gazRow.nb_sites || gazRow.nb_points || gazRow.nb_pce);

        const consoMoyMwhGaz = toNumber(gazRow.conso_moyenne_mwh);
        const consoTotaleMwhGaz = toNumber(gazRow.conso_totale_mwh || gazRow.conso_mwh);

        if (consoMoyMwhGaz !== null) {
          conso_gaz_kwh = Math.round(consoMoyMwhGaz * 1000);
        } else if (consoTotaleMwhGaz !== null && nb_logements_gaz && nb_logements_gaz > 0) {
          conso_gaz_kwh = Math.round((consoTotaleMwhGaz * 1000) / nb_logements_gaz);
        }
      }
    } catch (e) {
      console.error("Enedis gaz:", e);
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
