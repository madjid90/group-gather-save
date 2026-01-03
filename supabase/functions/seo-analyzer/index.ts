import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, url, pageTitle, pageDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "meta_tags":
        systemPrompt = `Tu es un expert SEO français. Génère des meta tags optimisés pour le référencement.
Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
  "title": "titre optimisé (max 60 caractères)",
  "description": "meta description (max 160 caractères)",
  "keywords": ["mot-clé1", "mot-clé2", "mot-clé3"],
  "ogTitle": "titre pour réseaux sociaux",
  "ogDescription": "description pour réseaux sociaux"
}`;
        userPrompt = `Génère des meta tags SEO optimisés pour cette page:
URL: ${url || "Page d'accueil"}
Titre actuel: ${pageTitle || "Non défini"}
Description actuelle: ${pageDescription || "Non définie"}
Contenu principal: ${content?.substring(0, 2000) || "Switchly - Achat groupé d'énergie et internet"}`;
        break;

      case "content_analysis":
        systemPrompt = `Tu es un expert SEO français. Analyse le contenu et donne des recommandations précises.
Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "score": 0-100,
  "keywordDensity": "analyse de la densité de mots-clés",
  "readability": "analyse de lisibilité",
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3"],
  "missingElements": ["élément manquant 1", "élément manquant 2"],
  "strengths": ["point fort 1", "point fort 2"]
}`;
        userPrompt = `Analyse ce contenu pour le SEO:
${content?.substring(0, 4000) || "Contenu non fourni"}`;
        break;

      case "full_audit":
        systemPrompt = `Tu es un expert SEO français. Réalise un audit SEO complet.
Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "overallScore": 0-100,
  "categories": {
    "technique": { "score": 0-100, "issues": [], "recommendations": [] },
    "contenu": { "score": 0-100, "issues": [], "recommendations": [] },
    "performance": { "score": 0-100, "issues": [], "recommendations": [] },
    "mobile": { "score": 0-100, "issues": [], "recommendations": [] }
  },
  "priorityActions": ["action prioritaire 1", "action prioritaire 2", "action prioritaire 3"],
  "summary": "résumé de l'audit en 2-3 phrases"
}`;
        userPrompt = `Réalise un audit SEO complet pour ce site:
URL: ${url || "https://switchly.fr"}
Titre: ${pageTitle || "Switchly - Achat groupé énergie et internet"}
Description: ${pageDescription || "Économisez sur vos factures d'énergie et d'internet"}
Contenu analysé: ${content?.substring(0, 3000) || "Site d'achat groupé d'énergie"}`;
        break;

      default:
        throw new Error("Type d'analyse non reconnu");
    }

    console.log(`SEO Analysis request - Type: ${type}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants. Veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Réponse AI vide");
    }

    // Parse JSON from AI response
    let parsedResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiResponse];
      const jsonStr = jsonMatch[1]?.trim() || aiResponse.trim();
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Response:", aiResponse);
      parsedResult = { raw: aiResponse, parseError: true };
    }

    console.log(`SEO Analysis completed - Type: ${type}`);

    return new Response(
      JSON.stringify({ success: true, result: parsedResult, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("SEO Analyzer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
