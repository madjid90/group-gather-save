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
    const { type, content, url, pageTitle, pageDescription, contentItems, metrics, existingSettings, siteData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "meta_tags":
        systemPrompt = `Tu es un expert SEO français senior avec 15 ans d'expérience. Tu optimises les meta tags pour maximiser le CTR et le positionnement Google.

CONTEXTE SWITCHLY:
- Site d'achat groupé d'énergie (électricité, gaz) et internet en France
- Proposition de valeur: économies jusqu'à 30% sur les factures
- Cible: particuliers français souhaitant réduire leurs factures
- Concurrents: UFC-Que Choisir, Selectra, comparateurs énergie

RÈGLES STRICTES:
- Title: 50-60 caractères max, mot-clé principal au début, marque à la fin
- Description: 150-160 caractères, bénéfice chiffré, call-to-action implicite
- Keywords: 5-9 mots-clés pertinents, longue traîne incluse
- OG: adapté au partage social, émoji autorisé, plus accrocheur

Retourne UNIQUEMENT un JSON valide:
{
  "title": "titre SEO optimisé",
  "description": "meta description optimisée",
  "keywords": ["mot-clé1", "mot-clé2", ...],
  "ogTitle": "titre Open Graph",
  "ogDescription": "description Open Graph",
  "canonical": "URL canonique suggérée",
  "reasoning": "explication courte des choix SEO"
}`;
        
        const metricsContext = metrics ? `
MÉTRIQUES ACTUELLES:
- Score global: ${metrics.overall_score}/100
- Score titre: ${metrics.title_score}/100
- Score meta: ${metrics.meta_score}/100
- Problèmes identifiés: ${metrics.issues?.join(', ') || 'Aucun'}
- Recommandations existantes: ${metrics.recommendations?.join(', ') || 'Aucune'}` : '';

        const existingContext = existingSettings ? `
PARAMÈTRES ACTUELS:
- Titre actuel: ${existingSettings.meta_title || 'Non défini'}
- Description actuelle: ${existingSettings.meta_description || 'Non définie'}
- Mots-clés actuels: ${existingSettings.keywords?.join(', ') || 'Aucun'}` : '';

        const siteContext = siteData ? `
DONNÉES DU SITE:
- Nombre de participants: ${siteData.participants || '2500+'}
- Économie moyenne: ${siteData.savings || '30%'}
- Fournisseurs partenaires: ${siteData.partners || 'EDF, Engie, TotalEnergies, Orange, Free, SFR'}` : '';

        userPrompt = `Génère des meta tags SEO optimisés pour cette page Switchly:

URL: ${url || "/"}
Titre page: ${pageTitle || "Switchly"}
${metricsContext}
${existingContext}
${siteContext}

CONTENU DE LA PAGE:
${content?.substring(0, 3000) || "Site d'achat groupé d'énergie et internet. Économisez sur vos factures."}

Optimise pour les mots-clés: achat groupé énergie, économies électricité, réduire facture internet, comparateur énergie, fournisseur pas cher`;
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

      case "optimize_content":
        systemPrompt = `Tu es un expert SEO et copywriter français. Tu optimises le contenu web pour le référencement naturel tout en gardant un ton engageant et humain.

RÈGLES D'OPTIMISATION:
- Garde le sens original du texte
- Intègre naturellement les mots-clés (énergie, économies, achat groupé, factures, électricité, internet, fibre)
- Améliore la lisibilité et l'impact
- Pour les titres: max 60 caractères, accrocheur, avec mot-clé principal
- Pour les CTA: verbe d'action, bénéfice clair, urgence subtile
- Pour les descriptions: bénéfices concrets, chiffres si possible

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "optimizedItems": [
    {
      "id": "id_original",
      "type": "heading|paragraph|cta|meta",
      "original": "texte original",
      "optimized": "texte optimisé SEO",
      "changes": ["liste des changements appliqués"],
      "seoScore": 0-100
    }
  ],
  "globalRecommendations": ["recommandation 1", "recommandation 2"],
  "keywordsUsed": ["mot-clé1", "mot-clé2"]
}`;
        userPrompt = `Optimise ces éléments de contenu pour le SEO. Contexte: site d'achat groupé d'énergie et internet en France.

Éléments à optimiser:
${JSON.stringify(contentItems, null, 2)}`;
        break;

      case "optimize_single":
        systemPrompt = `Tu es un expert SEO français. Optimise ce texte pour le référencement naturel.
Garde le sens original mais améliore:
- Les mots-clés pertinents (énergie, économies, achat groupé, factures)
- La lisibilité et l'impact
- L'engagement utilisateur

Retourne UNIQUEMENT un JSON valide:
{
  "original": "texte original",
  "optimized": "texte optimisé",
  "changes": ["changement 1", "changement 2"],
  "seoScore": 0-100,
  "keywords": ["mot-clé trouvé 1", "mot-clé trouvé 2"]
}`;
        userPrompt = `Optimise ce ${contentItems?.type || 'texte'} pour le SEO:
"${content}"`;
        break;

      case "bulk_optimize":
        systemPrompt = `Tu es un expert SEO français spécialisé dans l'optimisation de contenu web.
Tu vas optimiser tout le contenu d'une page pour améliorer son référencement naturel.

OBJECTIFS:
- Améliorer le positionnement sur les mots-clés: énergie, économies, achat groupé, électricité, internet, fibre, factures
- Augmenter le taux de conversion avec des CTA impactants
- Améliorer la structure sémantique (H1, H2, H3)
- Rendre le contenu plus engageant et lisible

Retourne UNIQUEMENT un JSON valide:
{
  "pageTitle": "titre de page optimisé (max 60 car)",
  "metaDescription": "meta description optimisée (max 160 car)",
  "sections": [
    {
      "sectionId": "hero|features|cta|testimonials|faq",
      "headings": [
        { "original": "H1 original", "optimized": "H1 optimisé", "level": 1 }
      ],
      "paragraphs": [
        { "original": "texte original", "optimized": "texte optimisé" }
      ],
      "ctas": [
        { "original": "CTA original", "optimized": "CTA optimisé" }
      ]
    }
  ],
  "overallScore": 0-100,
  "improvements": ["amélioration 1", "amélioration 2", "amélioration 3"]
}`;
        userPrompt = `Optimise tout le contenu de cette page pour le SEO.
URL: ${url || "Page d'accueil Switchly"}
Contenu actuel de la page:
${content?.substring(0, 6000)}`;
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
