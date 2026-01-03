import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration Switchly - Contexte projet complet
const SWITCHLY_CONTEXT = `
INFORMATIONS PROJET SWITCHLY:
- Nom: Switchly
- Industrie: Achat groupé électricité + internet (Energy Tech)
- Modèle: Marketplace B2C, commission courtier
- USP unique: SEULE plateforme combinant électricité ET internet
- Cible: Foyers français cherchant à réduire factures
- Promesse: Économiser 287€/an en moyenne (400€ max)
- Processus: Inscription 30 sec SMS → Courtier compare 20+ fournisseurs → Offre personnalisée 48-72h
- Différenciation vs Selectra: Plus rapide (30 sec vs 10 min), combo unique, IA 92% précise, transparent (Selectra condamné 400K€)
- Tech stack: Lovable, Supabase, Claude AI, Twilio SMS
- Audience: Familles 25-55 ans, étudiants, jeunes actifs
- Tone of voice: Accessible, transparent, bienveillant, data-driven
- Membres actuels: 2 547
- Économie moyenne: 287€/an
- Courtier: Partenaire confirmé, 30€/lead

OBJECTIFS SITE:
1. Maximiser conversions (objectif: 8-12% visiteur → inscrit)
2. Générer confiance immédiate (preuves sociales, transparence)
3. Simplifier au maximum (friction zéro)
4. Différencier clairement vs Selectra/UFC

CONCURRENTS À DÉPASSER:
- Selectra: Comparateur énergie (condamné 400K€ pour pratiques trompeuses)
- UFC-Que Choisir: Achat groupé mais lent et complexe
- Comparateurs classiques: HelloWatt, LeLynx

MOTS-CLÉS PRIORITAIRES:
- Primaires: achat groupé électricité, économies énergie, réduire facture électricité, achat groupé internet
- Secondaires: comparateur énergie France, fournisseur électricité pas cher, fibre pas cher, économiser factures
- Longue traîne: comment réduire sa facture d'électricité, meilleur fournisseur énergie 2024, achat groupé énergie particuliers

DONNÉES À METTRE EN AVANT:
- 2 547 membres inscrits
- 287€ économisés en moyenne par an
- 30 secondes pour s'inscrire
- 20+ fournisseurs comparés
- 48-72h pour recevoir son offre
- 92% de précision IA
- 400€ d'économies max

DIFFÉRENCIATEURS CLÉS:
1. Combo unique: Électricité + Internet (aucun concurrent)
2. Rapidité: 30 sec inscription (Selectra = 10 min)
3. Transparence: Contrairement à Selectra condamné
4. Simplicité: SMS, pas de compte complexe
5. Personnalisation: IA 92% de précision
`;

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
