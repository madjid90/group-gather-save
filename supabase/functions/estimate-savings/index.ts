import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculatorProfile {
  logement: "appartement" | "maison" | null;
  surface: "moins_60" | "60_100" | "plus_100" | null;
  chauffage: "electrique" | "gaz" | "pompe_chaleur" | "fioul" | "collectif" | "autre" | null;
  facture: "moins_80" | "80_120" | "plus_120" | "inconnu" | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const profile: CalculatorProfile = body.profile || {
      logement: body.logement || null,
      surface: body.surface || null,
      chauffage: body.chauffage || null,
      facture: body.facture || null,
    };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify(calculateFallbackEstimation(profile)), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt = buildPrompt(profile);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Tu es un expert en énergie et économies domestiques en France pour Switchly, comparateur gratuit d'électricité et de gaz. Tu dois estimer les économies potentielles qu'un foyer peut réaliser en changeant de fournisseur via Switchly.

CONTEXTE SWITCHLY:
- Switchly compare les offres de 20+ fournisseurs d'électricité et de gaz
- Économie moyenne constatée: 300€/an
- 100% gratuit et sans engagement
- Rémunéré par commission fournisseur

RÈGLES:
- Donne TOUJOURS une fourchette (min et max)
- Estimations RÉALISTES et CRÉDIBLES
- N'utilise JAMAIS le mot "garanti"
- Arrondis à la dizaine
- Mentionne électricité ET/OU gaz selon le chauffage

FOURCHETTES DE RÉFÉRENCE (par an):
- Petit appartement (< 60 m²): 150-250€
- Appartement moyen (60-100 m²): 220-350€
- Grande maison (> 100 m²): 300-480€
- Chauffage électrique: fourchette haute
- Chauffage gaz: ajouter 80-150€ pour économies gaz

Réponds UNIQUEMENT en JSON:
{
  "minEconomie": number,
  "maxEconomie": number,
  "explication": "1-2 phrases max"
}`
          },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "estimate_savings",
            description: "Estimation des économies",
            parameters: {
              type: "object",
              properties: {
                minEconomie: { type: "number" },
                maxEconomie: { type: "number" },
                explication: { type: "string" }
              },
              required: ["minEconomie", "maxEconomie", "explication"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "estimate_savings" } }
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify(calculateFallbackEstimation(profile)), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      return new Response(JSON.stringify(JSON.parse(toolCall.function.arguments)), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        return new Response(JSON.stringify(JSON.parse(content)), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch { /* fallback */ }
    }

    return new Response(JSON.stringify(calculateFallbackEstimation(profile)), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function buildPrompt(profile: CalculatorProfile): string {
  const logement = profile.logement === "maison" ? "une maison" : "un appartement";
  const surface = profile.surface === "moins_60" ? "moins de 60 m²" : profile.surface === "60_100" ? "60 à 100 m²" : "plus de 100 m²";
  const chauffage = profile.chauffage === "electrique" ? "électrique" : profile.chauffage === "gaz" ? "au gaz" : profile.chauffage === "pompe_chaleur" ? "par pompe à chaleur" : profile.chauffage === "fioul" ? "au fioul" : profile.chauffage === "collectif" ? "collectif" : "autre";
  const facture = profile.facture === "moins_80" ? "moins de 80€/mois" : profile.facture === "80_120" ? "80 à 120€/mois" : profile.facture === "plus_120" ? "plus de 120€/mois" : "montant inconnu";

  return `Estime les économies annuelles pour:\n- Logement: ${logement}\n- Surface: ${surface}\n- Chauffage: ${chauffage}\n- Facture énergie: ${facture}`;
}

function calculateFallbackEstimation(profile: CalculatorProfile) {
  let min = 150, max = 250;
  if (profile.logement === "maison") { min += 70; max += 120; }
  if (profile.surface === "60_100") { min += 50; max += 80; }
  else if (profile.surface === "plus_100") { min += 120; max += 180; }
  if (profile.chauffage === "electrique") { min += 30; max += 50; }
  else if (profile.chauffage === "gaz") { min += 80; max += 150; }
  else if (profile.chauffage === "pompe_chaleur") { min += 40; max += 70; }
  else if (profile.chauffage === "fioul") { min += 100; max += 180; }
  else if (profile.chauffage === "collectif") { min -= 30; max -= 20; }
  if (profile.facture === "80_120") { min += 40; max += 60; }
  else if (profile.facture === "plus_120") { min += 80; max += 120; }

  const logementLabel = profile.logement === "maison" ? "une maison" : "un appartement";
  const chauffageLabel = profile.chauffage === "electrique" ? "l'électricité" : profile.chauffage === "gaz" ? "l'électricité et le gaz" : "l'énergie";

  return {
    minEconomie: Math.round(min / 10) * 10,
    maxEconomie: Math.round(max / 10) * 10,
    explication: `Pour ${logementLabel} avec votre profil, vous pouvez économiser sur ${chauffageLabel} en changeant de fournisseur via Switchly. Estimation basée sur des foyers similaires.`
  };
}
