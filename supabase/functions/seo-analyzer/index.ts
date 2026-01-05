import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration Switchly - Contexte projet optimisé
const SWITCHLY_CONTEXT = `
=== SWITCHLY - CONTEXTE PROJET ===
Industrie: Achat groupé électricité + internet (Energy Tech B2C)
USP: SEULE plateforme combinant électricité ET internet en France

DONNÉES CLÉS:
• 2 547 membres inscrits
• 287€ économisés/an en moyenne (max 400€)
• 30 secondes pour s'inscrire via SMS
• 20+ fournisseurs comparés
• 48-72h pour recevoir une offre personnalisée
• IA 92% de précision

OBJECTIFS:
• Conversion cible: 8-12% visiteur → inscrit
• Dépasser Selectra et UFC-Que Choisir

DIFFÉRENCIATEURS VS SELECTRA:
• Rapidité: 30 sec vs 10 min
• Combo unique: électricité + internet
• Transparence: Selectra condamné 400K€

MOTS-CLÉS PRIORITAIRES:
• Primaires: achat groupé électricité, économies énergie, réduire facture électricité
• Secondaires: comparateur énergie France, fournisseur électricité pas cher
• Longue traîne: comment réduire sa facture électricité 2024

TON: Accessible, transparent, bienveillant, data-driven
CIBLE: Foyers français 25-55 ans, étudiants, jeunes actifs
`;

// Fonction utilitaire pour extraire le JSON d'une réponse IA
function extractJSON(response: string): any {
  // Essayer d'abord d'extraire du markdown code block
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch { /* continue */ }
  }

  // Essayer de parser directement
  try {
    return JSON.parse(response.trim());
  } catch { /* continue */ }

  // Chercher un objet JSON dans le texte
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch { /* continue */ }
  }

  return { raw: response, parseError: true };
}

// Validation et nettoyage des résultats
function validateSEOResult(result: any, type: string): any {
  if (result.parseError) return result;

  // Validation par type
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
      console.error("LOVABLE_API_KEY missing");
      return new Response(
        JSON.stringify({ success: false, error: "Configuration IA manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SEO-Analyzer] Request type: ${type}, URL: ${url || 'N/A'}`);

    const startTime = Date.now();

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "meta_tags":
        systemPrompt = `Tu es un expert SEO français senior avec 15 ans d'expérience, spécialisé en conversion et SaaS/marketplace. Tu optimises les meta tags pour maximiser le CTR et le positionnement Google.

${SWITCHLY_CONTEXT}

RÈGLES STRICTES META TAGS:
- Title: 50-60 caractères max, mot-clé principal au début, marque "Switchly" à la fin
- Description: 150-160 caractères, bénéfice CHIFFRÉ (287€/an, 30 sec, 2547 membres), call-to-action implicite
- Keywords: 5-9 mots-clés pertinents, longue traîne incluse
- OG: adapté au partage social, peut inclure emoji, plus accrocheur et émotionnel
- Intégrer les preuves sociales (2547 membres) et l'urgence subtile
- Différencier de Selectra en mettant en avant transparence et rapidité

Retourne UNIQUEMENT un JSON valide:
{
  "title": "titre SEO optimisé",
  "description": "meta description optimisée avec chiffres",
  "keywords": ["mot-clé1", "mot-clé2", ...],
  "ogTitle": "titre Open Graph accrocheur",
  "ogDescription": "description Open Graph avec emoji et bénéfices",
  "canonical": "URL canonique suggérée",
  "reasoning": "explication courte des choix SEO et différenciation"
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
DONNÉES LIVE DU SITE:
- Nombre de participants: ${siteData.participants || '2547'}
- Économie moyenne: ${siteData.savings || '287€/an'}
- Fournisseurs partenaires: ${siteData.partners || 'EDF, Engie, TotalEnergies, Orange, Free, SFR, Bouygues'}` : '';

        userPrompt = `Génère des meta tags SEO ultra-optimisés pour cette page Switchly:

URL: ${url || "/"}
Titre page: ${pageTitle || "Switchly"}
${metricsContext}
${existingContext}
${siteContext}

CONTENU DE LA PAGE:
${content?.substring(0, 3000) || "Site d'achat groupé d'énergie et internet. Économisez sur vos factures avec 2547 membres."}

OBJECTIF: Dépasser Selectra et UFC-Que Choisir sur ces mots-clés. Maximiser le CTR avec des chiffres concrets.`;
        break;

      case "content_analysis":
        systemPrompt = `Tu es un expert SEO français et conversion specialist. Analyse le contenu pour maximiser le positionnement ET les conversions.

${SWITCHLY_CONTEXT}

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "score": 0-100,
  "keywordDensity": "analyse de la densité des mots-clés Switchly",
  "readability": "analyse de lisibilité pour la cible 25-55 ans",
  "conversionOptimization": "analyse de l'optimisation conversion",
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3"],
  "missingElements": ["élément manquant pour conversion", "élément SEO manquant"],
  "strengths": ["point fort 1", "point fort 2"],
  "competitorComparison": "comment se différencier de Selectra/UFC"
}`;
        userPrompt = `Analyse ce contenu Switchly pour SEO + conversion:
${content?.substring(0, 4000) || "Contenu non fourni"}

Focus: maximiser conversions 8-12% et se différencier de Selectra.`;
        break;

      case "full_audit":
        systemPrompt = `Tu es un expert SEO français spécialisé en conversion SaaS. Réalise un audit SEO complet orienté conversion.

${SWITCHLY_CONTEXT}

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "overallScore": 0-100,
  "categories": {
    "technique": { "score": 0-100, "issues": [], "recommendations": [] },
    "contenu": { "score": 0-100, "issues": [], "recommendations": [] },
    "conversion": { "score": 0-100, "issues": [], "recommendations": [] },
    "differentiationSelectra": { "score": 0-100, "issues": [], "recommendations": [] },
    "mobile": { "score": 0-100, "issues": [], "recommendations": [] }
  },
  "priorityActions": ["action prioritaire conversion", "action SEO", "action différenciation"],
  "summary": "résumé orienté objectif 8-12% conversion"
}`;
        userPrompt = `Réalise un audit SEO + conversion complet pour Switchly:
URL: ${url || "https://switchly.fr"}
Titre: ${pageTitle || "Switchly - Achat groupé énergie et internet"}
Description: ${pageDescription || "2547 membres économisent 287€/an. Rejoignez l'achat groupé."}
Contenu analysé: ${content?.substring(0, 3000) || "Site d'achat groupé d'énergie"}

OBJECTIF: Atteindre 8-12% de taux de conversion, dépasser Selectra.`;
        break;

      case "optimize_content":
        systemPrompt = `Tu es un expert SEO et copywriter conversion français. Tu optimises le contenu pour le référencement ET la conversion.

${SWITCHLY_CONTEXT}

RÈGLES D'OPTIMISATION SWITCHLY:
- Intègre les chiffres: 287€/an, 2547 membres, 30 sec, 20+ fournisseurs
- Crée l'urgence subtile sans être agressif
- Ton: accessible, transparent, bienveillant, data-driven
- Différencie de Selectra (transparence, rapidité)
- Pour les titres: max 60 car, accrocheur, avec bénéfice chiffré
- Pour les CTA: verbe d'action, bénéfice clair, réassurance (gratuit, sans engagement)
- Pour les descriptions: bénéfices concrets avec preuves sociales

Retourne UNIQUEMENT un JSON valide:
{
  "optimizedItems": [
    {
      "id": "id_original",
      "type": "heading|paragraph|cta|meta",
      "original": "texte original",
      "optimized": "texte optimisé SEO + conversion",
      "changes": ["liste des changements appliqués"],
      "seoScore": 0-100,
      "conversionScore": 0-100
    }
  ],
  "globalRecommendations": ["reco conversion", "reco SEO"],
  "keywordsUsed": ["mot-clé1", "mot-clé2"]
}`;
        userPrompt = `Optimise ces éléments pour SEO + conversion Switchly:

Éléments à optimiser:
${JSON.stringify(contentItems, null, 2)}

OBJECTIF: Maximiser conversions (8-12%) et différenciation vs Selectra.`;
        break;

      case "optimize_single":
        systemPrompt = `Tu es un expert SEO et conversion français pour Switchly.

${SWITCHLY_CONTEXT}

Optimise ce texte pour:
- SEO: mots-clés énergie, économies, achat groupé
- Conversion: chiffres, preuves sociales, urgence subtile
- Ton: accessible, transparent, bienveillant

Retourne UNIQUEMENT un JSON valide:
{
  "original": "texte original",
  "optimized": "texte optimisé SEO + conversion",
  "changes": ["changement 1", "changement 2"],
  "seoScore": 0-100,
  "conversionScore": 0-100,
  "keywords": ["mot-clé trouvé 1", "mot-clé trouvé 2"]
}`;
        userPrompt = `Optimise ce ${contentItems?.type || 'texte'} pour Switchly:
"${content}"`;
        break;

      case "bulk_optimize":
        systemPrompt = `Tu es un expert SEO et conversion français spécialisé en SaaS/marketplace.

${SWITCHLY_CONTEXT}

OBJECTIFS BULK OPTIMIZATION:
- Positionner sur: achat groupé électricité, économies énergie, réduire facture, achat groupé internet
- Intégrer les preuves: 2547 membres, 287€/an, 30 sec, 20+ fournisseurs
- Maximiser conversion avec CTA impactants
- Différencier de Selectra (transparence, rapidité, combo unique)
- Ton: accessible, transparent, bienveillant, data-driven

Retourne UNIQUEMENT un JSON valide:
{
  "pageTitle": "titre optimisé (max 60 car) avec bénéfice",
  "metaDescription": "meta description avec chiffres (max 160 car)",
  "sections": [
    {
      "sectionId": "hero|features|cta|testimonials|faq",
      "headings": [
        { "original": "H1 original", "optimized": "H1 avec bénéfice chiffré", "level": 1 }
      ],
      "paragraphs": [
        { "original": "texte original", "optimized": "texte avec preuves sociales" }
      ],
      "ctas": [
        { "original": "CTA original", "optimized": "CTA conversion-oriented" }
      ]
    }
  ],
  "overallScore": 0-100,
  "conversionScore": 0-100,
  "improvements": ["amélioration SEO", "amélioration conversion", "différenciation Selectra"]
}`;
        userPrompt = `Optimise tout le contenu de cette page Switchly pour SEO + conversion:
URL: ${url || "Page d'accueil Switchly"}
Objectif: 8-12% conversion, dépasser Selectra.
Contenu actuel:
${content?.substring(0, 6000)}`;
        break;

      default:
        throw new Error("Type d'analyse non reconnu");
    }

    // Appel à l'IA avec retry
    let aiResponse: string | null = null;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
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
            temperature: 0.3, // Plus déterministe pour des résultats cohérents
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[SEO-Analyzer] AI error (attempt ${attempt + 1}):`, response.status, errorText);
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ success: false, error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ success: false, error: "Crédits IA insuffisants. Rechargez votre compte Lovable." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          lastError = new Error(`AI request failed: ${response.status}`);
          continue;
        }

        const data = await response.json();
        aiResponse = data.choices?.[0]?.message?.content;
        
        if (aiResponse) break;
        
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError : new Error("Fetch error");
        console.error(`[SEO-Analyzer] Fetch error (attempt ${attempt + 1}):`, fetchError);
      }
    }

    if (!aiResponse) {
      throw lastError || new Error("Impossible d'obtenir une réponse IA");
    }

    // Parser et valider le résultat
    const parsedResult = extractJSON(aiResponse);
    const validatedResult = validateSEOResult(parsedResult, type);
    
    const duration = Date.now() - startTime;
    console.log(`[SEO-Analyzer] Completed in ${duration}ms - Type: ${type}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: validatedResult, 
        type,
        duration
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[SEO-Analyzer] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
