import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculatorProfile {
  logement: "appartement" | "maison" | null;
  surface: "moins_60" | "60_100" | "plus_100" | null;
  chauffage: "electrique" | "gaz" | "autre" | null;
  facture: "moins_80" | "80_120" | "plus_120" | "inconnu" | null;
  internet: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile } = await req.json() as { profile: CalculatorProfile };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.log("No Lovable API key, using fallback estimation");
      const fallback = calculateFallbackEstimation(profile);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(profile);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Tu es un expert en énergie et économies domestiques en France. Tu dois estimer les économies potentielles qu'un foyer peut réaliser en participant à un achat groupé d'énergie.

RÈGLES IMPORTANTES:
- Donne TOUJOURS une fourchette (min et max), jamais un montant unique
- Les estimations doivent être RÉALISTES et CRÉDIBLES
- N'utilise JAMAIS le mot "garanti"
- Arrondis les montants à la dizaine
- Base tes estimations sur les tarifs réglementés français et les retours d'achats groupés
- Adapte ton explication au profil spécifique du logement

FOURCHETTES DE RÉFÉRENCE (par an):
- Petit appartement électrique: 150-280€
- Appartement moyen électrique: 220-360€
- Grande maison électrique: 300-480€
- Chauffage gaz: réduire de 15-20%
- Avec Internet: ajouter 60-120€

Réponds UNIQUEMENT en JSON valide avec ce format exact:
{
  "minEconomie": number,
  "maxEconomie": number,
  "explication": "string (1-2 phrases max expliquant l'estimation)"
}`
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "estimate_savings",
              description: "Retourne l'estimation des économies pour le profil donné",
              parameters: {
                type: "object",
                properties: {
                  minEconomie: { 
                    type: "number",
                    description: "Montant minimum d'économies en euros par an (arrondi à la dizaine)"
                  },
                  maxEconomie: { 
                    type: "number",
                    description: "Montant maximum d'économies en euros par an (arrondi à la dizaine)"
                  },
                  explication: { 
                    type: "string",
                    description: "Explication courte et personnalisée (1-2 phrases max)"
                  }
                },
                required: ["minEconomie", "maxEconomie", "explication"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "estimate_savings" } }
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      const fallback = calculateFallbackEstimation(profile);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try to parse content as JSON if no tool call
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        console.log("Could not parse AI content as JSON");
      }
    }

    // Fallback
    const fallback = calculateFallbackEstimation(profile);
    return new Response(JSON.stringify(fallback), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in estimate-savings:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildPrompt(profile: CalculatorProfile): string {
  const logement = profile.logement === "maison" ? "une maison" : "un appartement";
  const surface = profile.surface === "moins_60" ? "moins de 60 m²" : 
                  profile.surface === "60_100" ? "60 à 100 m²" : "plus de 100 m²";
  const chauffage = profile.chauffage === "electrique" ? "électrique" :
                    profile.chauffage === "gaz" ? "au gaz" : "autre type de chauffage";
  const facture = profile.facture === "moins_80" ? "moins de 80€/mois" :
                  profile.facture === "80_120" ? "80 à 120€/mois" :
                  profile.facture === "plus_120" ? "plus de 120€/mois" : "montant inconnu";
  const internet = profile.internet ? "Inclure également les économies Internet potentielles." : "";

  return `Estime les économies annuelles potentielles pour ce profil:
- Logement: ${logement}
- Surface: ${surface}
- Chauffage: ${chauffage}
- Facture électricité: ${facture}
${internet}

Donne une estimation réaliste sous forme de fourchette.`;
}

function calculateFallbackEstimation(profile: CalculatorProfile) {
  let min = 150;
  let max = 280;

  if (profile.logement === "maison") {
    min += 50;
    max += 100;
  }

  if (profile.surface === "60_100") {
    min += 40;
    max += 60;
  } else if (profile.surface === "plus_100") {
    min += 100;
    max += 150;
  }

  if (profile.chauffage === "electrique") {
    min += 30;
    max += 50;
  } else if (profile.chauffage === "gaz") {
    min -= 20;
    max -= 30;
  }

  if (profile.facture === "80_120") {
    min += 30;
    max += 40;
  } else if (profile.facture === "plus_120") {
    min += 60;
    max += 80;
  }

  if (profile.internet) {
    min += 60;
    max += 120;
  }

  const logementLabel = profile.logement === "maison" ? "une maison" : "un appartement";

  return {
    minEconomie: Math.round(min / 10) * 10,
    maxEconomie: Math.round(max / 10) * 10,
    explication: `Pour ${logementLabel} avec votre profil, les foyers similaires économisent généralement cette fourchette grâce à l'achat groupé. L'estimation prend en compte le type de logement, la surface et le mode de chauffage.`
  };
}
