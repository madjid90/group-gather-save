import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fallback statique ultime (si DB indisponible)
const FALLBACK_STATIC: Record<string, any[]> = {
  electricite: [
    { id: "ohm-extra-eco", fournisseur: "OHM Énergie", nom_offre: "Extra Eco", type: "fixe", prix_kwh: 0.2180, abonnement_annuel: 149, label_vert: false, url_souscription: "https://selectra.info/energie/fournisseurs/ohm-energie" },
    { id: "octopus-eco", fournisseur: "Octopus Energy", nom_offre: "Eco-conso Fixe", type: "fixe", prix_kwh: 0.2210, abonnement_annuel: 155, label_vert: true, url_souscription: "https://selectra.info/energie/fournisseurs/octopus-energy" },
    { id: "alpiq-stable", fournisseur: "Alpiq", nom_offre: "Électricité Stable", type: "fixe", prix_kwh: 0.2160, abonnement_annuel: 158, label_vert: false, url_souscription: "https://selectra.info/energie/fournisseurs/alpiq" },
    { id: "total-fixe", fournisseur: "TotalEnergies", nom_offre: "Fixe 2 ans", type: "fixe", prix_kwh: 0.2240, abonnement_annuel: 162, label_vert: false, url_souscription: "https://selectra.info/energie/fournisseurs/totalenergies" },
    { id: "engie-3ans", fournisseur: "Engie", nom_offre: "Référence 3 ans", type: "fixe", prix_kwh: 0.2280, abonnement_annuel: 168, label_vert: false, url_souscription: "https://selectra.info/energie/fournisseurs/engie" },
  ],
  gaz: [
    { id: "ohm-gaz", fournisseur: "OHM Énergie", nom_offre: "Gaz Initial", type: "fixe", prix_kwh: 0.0870, abonnement_annuel: 220, label_vert: false, url_souscription: "https://selectra.info/energie/fournisseurs/ohm-energie" },
    { id: "total-gaz", fournisseur: "TotalEnergies", nom_offre: "Spéciale Gaz", type: "fixe", prix_kwh: 0.0892, abonnement_annuel: 230, label_vert: false, url_souscription: "https://selectra.info/energie/fournisseurs/totalenergies" },
    { id: "engie-gaz", fournisseur: "Engie", nom_offre: "Gaz Référence 3 ans", type: "fixe", prix_kwh: 0.0910, abonnement_annuel: 242, label_vert: false, url_souscription: "https://selectra.info/energie/fournisseurs/engie" },
    { id: "ekwateur-biogaz", fournisseur: "Ekwateur", nom_offre: "Biogaz 100%", type: "fixe", prix_kwh: 0.0930, abonnement_annuel: 235, label_vert: true, url_souscription: "https://selectra.info/energie/fournisseurs/ekwateur" },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { type = "electricite", code_postal = "" } = await req.json();
    const TOKEN = Deno.env.get("SELECTRA_TOKEN");

    // Lire offres fallback depuis tarifs_energie
    let fallbackElec = FALLBACK_STATIC.electricite;
    let fallbackGaz = FALLBACK_STATIC.gaz;

    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: tarifs } = await supabase
        .from("tarifs_energie")
        .select("offres_elec_fallback, offres_gaz_fallback")
        .eq("id", "current")
        .single();
      if (tarifs?.offres_elec_fallback?.length) fallbackElec = tarifs.offres_elec_fallback;
      if (tarifs?.offres_gaz_fallback?.length) fallbackGaz = tarifs.offres_gaz_fallback;
    } catch (e) { console.error("Tarifs offres lecture:", e); }

    const FALLBACK = { electricite: fallbackElec, gaz: fallbackGaz };

    let offres = FALLBACK[type as keyof typeof FALLBACK] || FALLBACK.electricite;
    let source = "fallback";

    if (TOKEN) {
      try {
        const res = await fetch(
          `https://api.selectra.com/comparator/offers?type=${type}&code_postal=${code_postal}`,
          { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
        );
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : data?.offers;
            if (arr?.length) { offres = arr; source = "selectra_api"; }
          }
        }
      } catch (e) { console.error("Selectra API fallback:", e); }
    }

    return new Response(JSON.stringify({ success: true, source, type, offres }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
