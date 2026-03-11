import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Offres statiques de fallback (en attendant l'accès API Selectra)
const OFFRES_FALLBACK: Record<string, any[]> = {
  electricite: [
    {
      id: "ohm-extra-eco",
      fournisseur: "OHM Énergie",
      nom_offre: "Extra Eco",
      type: "fixe",
      prix_kwh: 0.2180,
      abonnement_annuel: 149,
      prix_annuel_6000kwh: 1457,
      economie_vs_trv: 283,
      label_vert: false,
      selectra_score: "B",
      url_souscription: "https://selectra.info/energie/selection/ohm-energie",
      logo_url: null,
    },
    {
      id: "octopus-eco-conso",
      fournisseur: "Octopus Energy",
      nom_offre: "Eco-conso Fixe",
      type: "fixe",
      prix_kwh: 0.2210,
      abonnement_annuel: 155,
      prix_annuel_6000kwh: 1481,
      economie_vs_trv: 259,
      label_vert: true,
      selectra_score: "A",
      url_souscription: "https://selectra.info/energie/selection/octopus-energy",
      logo_url: null,
    },
    {
      id: "totalenergies-fixe-2ans",
      fournisseur: "TotalEnergies",
      nom_offre: "Fixe 2 ans Électricité",
      type: "fixe",
      prix_kwh: 0.2240,
      abonnement_annuel: 162,
      prix_annuel_6000kwh: 1506,
      economie_vs_trv: 234,
      label_vert: false,
      selectra_score: "B",
      url_souscription: "https://selectra.info/energie/selection/totalenergies",
      logo_url: null,
    },
    {
      id: "alpiq-stable",
      fournisseur: "Alpiq",
      nom_offre: "Électricité Stable",
      type: "fixe",
      prix_kwh: 0.2160,
      abonnement_annuel: 158,
      prix_annuel_6000kwh: 1454,
      economie_vs_trv: 286,
      label_vert: false,
      selectra_score: "A",
      url_souscription: "https://selectra.info/energie/selection/alpiq",
      logo_url: null,
    },
    {
      id: "engie-reference-3ans",
      fournisseur: "Engie",
      nom_offre: "Elec Référence 3 ans",
      type: "fixe",
      prix_kwh: 0.2280,
      abonnement_annuel: 168,
      prix_annuel_6000kwh: 1536,
      economie_vs_trv: 204,
      label_vert: false,
      selectra_score: "B",
      url_souscription: "https://selectra.info/energie/selection/engie",
      logo_url: null,
    },
  ],
  gaz: [
    {
      id: "totalenergies-speciale-gaz",
      fournisseur: "TotalEnergies",
      nom_offre: "Spéciale Gaz",
      type: "fixe",
      prix_kwh: 0.0892,
      abonnement_annuel: 230,
      prix_annuel_10000kwh: 1122,
      economie_vs_repere: 122,
      label_vert: false,
      selectra_score: "B",
      url_souscription: "https://selectra.info/energie/selection/totalenergies/speciale-gaz",
      logo_url: null,
    },
    {
      id: "engie-gaz-reference",
      fournisseur: "Engie",
      nom_offre: "Gaz Référence 3 ans",
      type: "fixe",
      prix_kwh: 0.0910,
      abonnement_annuel: 242,
      prix_annuel_10000kwh: 1152,
      economie_vs_repere: 92,
      label_vert: false,
      selectra_score: "B",
      url_souscription: "https://selectra.info/energie/selection/engie",
      logo_url: null,
    },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type = "electricite", code_postal = "" } = await req.json();
    const SELECTRA_TOKEN = Deno.env.get("SELECTRA_TOKEN");

    let offres = OFFRES_FALLBACK[type] || OFFRES_FALLBACK.electricite;
    let source = "fallback";

    // Tentative appel API Selectra si token disponible
    if (SELECTRA_TOKEN) {
      try {
        const apiRes = await fetch(
          `https://api.selectra.com/comparator/offers?type=${type}`,
          {
            headers: {
              Authorization: `Bearer ${SELECTRA_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (apiRes.ok) {
          const contentType = apiRes.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const apiData = await apiRes.json();
            if (apiData && Array.isArray(apiData)) {
              offres = apiData;
              source = "selectra_api";
            } else if (apiData?.offers) {
              offres = apiData.offers;
              source = "selectra_api";
            }
          }
        }
      } catch (e) {
        console.error("API Selectra indisponible, fallback utilisé:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, source, type, offres }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
