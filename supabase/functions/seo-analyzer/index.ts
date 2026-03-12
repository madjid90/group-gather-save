import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SWITCHLY_CONTEXT = `
=== SWITCHLY - CONTEXTE PROJET ===
Industrie: Comparateur d'électricité et de gaz (Energy Tech B2C)
USP: Comparateur gratuit, rapide (30 secondes) et transparent

DONNÉES CLÉS:
• 2 547 foyers accompagnés
• 300€ économisés/an en moyenne (max 400€)
• 30 secondes pour comparer
• 20+ fournisseurs comparés
• Partenaires : EDF, Engie, TotalEnergies, OHM Énergie, Octopus Energy

OBJECTIFS:
• Conversion cible: 8-12% visiteur → lead
• Dominer le SEO local sur "comparateur électricité [ville]" et "comparateur gaz [ville]"

DIFFÉRENCIATEURS:
• Rapidité: comparaison en 30 sec
• Transparence: rémunéré par commission fournisseur uniquement
• Gratuit et sans engagement pour le consommateur

MOTS-CLÉS PRIORITAIRES:
• Primaires: comparateur électricité, comparateur gaz, changer de fournisseur
• Secondaires: fournisseur électricité pas cher, réduire facture énergie
• Longue traîne: comparateur électricité [ville], meilleur fournisseur gaz 2026

TON: Accessible, transparent, bienveillant, data-driven
CIBLE: Foyers français 25-55 ans
`;

function extractJSON(response: string): any {
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch { /* continue */ }
  }
  try { return JSON.parse(response.trim()); } catch { /* continue */ }
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch { /* continue */ }
  }
  return { raw: response, parseError: true };
}

function validateSEOResult(result: any, type: string): any {
  if (result.parseError) return result;
  switch (type) {
    case "meta_tags":
      return {
        title: result.title?.substring(0, 60) || "",
        description: result.description?.substring(0, 160) || "",
        keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 10) : [],
        ogTitle: result.ogTitle?.substring(0, 60) || result.title?.substring(0, 60) || "",
        ogDescription: result.ogDescription?.substring(0, 160) || result.description?.substring(0, 160) || "",
        canonical: result.canonical || "",
        reasoning: result.reasoning || ""
      };
    case "content_analysis":
      return {
        score: Math.min(100, Math.max(0, result.score || 0)),
        keywordDensity: result.keywordDensity || "",
        readability: result.readability || "",
        conversionOptimization: result.conversionOptimization || "",
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        missingElements: Array.isArray(result.missingElements) ? result.missingElements : [],
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        competitorComparison: result.competitorComparison || ""
      };
    default:
      return result;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, content, url, pageTitle, pageDescription, contentItems, metrics, existingSettings, siteData } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Configuration IA manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startTime = Date.now();
    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "meta_tags":
        systemPrompt = `Tu es un expert SEO français senior. Tu optimises les meta tags pour maximiser le CTR et le positionnement Google.

${SWITCHLY_CONTEXT}

RÈGLES STRICTES META TAGS:
- Title: 50-60 caractères max, mot-clé principal au début, marque "Switchly" à la fin
- Description: 150-160 caractères, bénéfice CHIFFRÉ (300€/an, 30 sec), call-to-action implicite
- Keywords: 5-9 mots-clés pertinents, longue traîne incluse
- OG: adapté au partage social, accrocheur

Retourne UNIQUEMENT un JSON valide:
{
  "title": "titre SEO optimisé",
  "description": "meta description optimisée avec chiffres",
  "keywords": ["mot-clé1", "mot-clé2"],
  "ogTitle": "titre Open Graph accrocheur",
  "ogDescription": "description Open Graph avec bénéfices",
  "canonical": "URL canonique suggérée",
  "reasoning": "explication courte des choix SEO"
}`;
        
        const metricsContext = metrics ? `
MÉTRIQUES ACTUELLES:
- Score global: ${metrics.overall_score}/100
- Score titre: ${metrics.title_score}/100
- Problèmes: ${metrics.issues?.join(', ') || 'Aucun'}` : '';
        const existingContext = existingSettings ? `
PARAMÈTRES ACTUELS:
- Titre: ${existingSettings.meta_title || 'Non défini'}
- Description: ${existingSettings.meta_description || 'Non définie'}` : '';

        userPrompt = `Génère des meta tags SEO optimisés pour cette page Switchly:
URL: ${url || "/" }
Titre page: ${pageTitle || "Switchly" }
${metricsContext}${existingContext}
CONTENU: ${content?.substring(0, 3000) || "Comparateur gratuit d'électricité et de gaz. Économisez sur vos factures avec Switchly."}`;
        break;

      case "content_analysis":
        systemPrompt = `Tu es un expert SEO français et conversion specialist.

${SWITCHLY_CONTEXT}

Retourne UNIQUEMENT un JSON valide:
{
  "score": 0-100,
  "keywordDensity": "analyse densité mots-clés",
  "readability": "analyse lisibilité",
  "conversionOptimization": "analyse conversion",
  "recommendations": ["reco 1", "reco 2"],
  "missingElements": ["élément manquant"],
  "strengths": ["point fort"],
  "competitorComparison": "différenciation"
}`;
        userPrompt = `Analyse ce contenu Switchly pour SEO + conversion:\\
${content?.substring(0, 4000) || "Contenu non fourni"}`;
        break;

      case "full_audit":
        systemPrompt = `Tu es un expert SEO français spécialisé en conversion.

${SWITCHLY_CONTEXT}

Retourne UNIQUEMENT un JSON valide:
{
  "overallScore": 0-100,
  "categories": {
    "technique": { "score": 0-100, "issues": [], "recommendations": [] },
    "contenu": { "score": 0-100, "issues": [], "recommendations": [] },
    "conversion": { "score": 0-100, "issues": [], "recommendations": [] },
    "mobile": { "score": 0-100, "issues": [], "recommendations": [] }
  },
  "priorityActions": ["action 1", "action 2"],
  "summary": "résumé"
}`;
        userPrompt = `Audit SEO + conversion pour Switchly:
URL: ${url || "https://switchly.fr" }
Titre: ${pageTitle || "Switchly — Comparateur électricité et gaz" }
Contenu: ${content?.substring(0, 3000) || "Comparateur gratuit d'électricité et de gaz"}`;
        break;

      case "optimize_content":
        systemPrompt = `Tu es un expert SEO et copywriter conversion français.

${SWITCHLY_CONTEXT}

Retourne UNIQUEMENT un JSON valide:
{
  "optimizedItems": [{ "id": "id", "type": "heading|paragraph|cta", "original": "", "optimized": "", "changes": [], "seoScore": 0-100, "conversionScore": 0-100 }],
  "globalRecommendations": [],
  "keywordsUsed": []
}`;
        userPrompt = `Optimise ces éléments pour SEO + conversion Switchly:\\
${JSON.stringify(contentItems, null, 2)}`;
        break;

      case "optimize_single":
        systemPrompt = `Tu es un expert SEO et conversion français pour Switchly.

${SWITCHLY_CONTEXT}

Optimise ce texte pour:
- SEO: mots-clés énergie, économies, comparateur
- Conversion: chiffres, preuves sociales
- Ton: accessible, transparent

Retourne UNIQUEMENT un JSON valide:
{
  "original": "texte original",
  "optimized": "texte optimisé",
  "changes": ["changement 1"],
  "seoScore": 0-100,
  "conversionScore": 0-100,
  "keywords": ["mot-clé"]
}`;
        userPrompt = `Optimise ce ${contentItems?.type || 'texte'} pour Switchly:\\
"${content}"`;
        break;

      case "bulk_optimize":
        systemPrompt = `Tu es un expert SEO et conversion français.

${SWITCHLY_CONTEXT}

Retourne UNIQUEMENT un JSON valide:
{
  "pageTitle": "titre optimisé (max 60 car)",
  "metaDescription": "meta description (max 160 car)",
  "sections": [{ "sectionId": "hero|features|cta", "headings": [{ "original": "", "optimized": "", "level": 1 }], "paragraphs": [{ "original": "", "optimized": "" }], "ctas": [{ "original": "", "optimized": "" }] }],
  "overallScore": 0-100,
  "conversionScore": 0-100,
  "improvements": []
}`;
        userPrompt = `Optimise tout le contenu de cette page Switchly:\\
URL: ${url || "Page d'accueil" }\\
Contenu:\\
${content?.substring(0, 6000)}`;
        break;

      default:
        throw new Error("Type d'analyse non reconnu");
    }

    let aiResponse: string | null = null;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) return new Response(JSON.stringify({ success: false, error: "Limite de requêtes atteinte." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (response.status === 402) return new Response(JSON.stringify({ success: false, error: "Crédits IA insuffisants." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          lastError = new Error(`AI request failed: ${response.status}`);
          continue;
        }
        const data = await response.json();
        aiResponse = data.choices?.[0]?.message?.content;
        if (aiResponse) break;
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError : new Error("Fetch error");
      }
    }

    if (!aiResponse) throw lastError || new Error("Impossible d'obtenir une réponse IA");

    const parsedResult = extractJSON(aiResponse);
    const validatedResult = validateSEOResult(parsedResult, type);
    
    return new Response(
      JSON.stringify({ success: true, result: validatedResult, type, duration: Date.now() - startTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
