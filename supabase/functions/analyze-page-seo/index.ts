import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pages Switchly à analyser
const SWITCHLY_PAGES = {
  home: { url: '/', label: 'Accueil', fullUrl: '' },
  inscription: { url: '/inscription', label: 'Inscription', fullUrl: '' },
  faq: { url: '/faq', label: 'FAQ', fullUrl: '' },
  contact: { url: '/contact', label: 'Contact', fullUrl: '' },
  organiser: { url: '/organiser-achat-groupe', label: 'Organiser un achat groupé', fullUrl: '' },
  invitation: { url: '/invitation', label: 'Invitation', fullUrl: '' },
};

// Concurrents pour comparaison
const COMPETITORS = {
  ecodigo: { name: 'Ecodigo', url: 'https://www.ecodigo.fr/' },
  hellowatt: { name: 'HelloWatt', url: 'https://www.hellowatt.fr/achats-groupes/energie-classique/' },
  selectra: { name: 'Selectra', url: 'https://selectra.info/achat-groupe/energie' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageKey, siteUrl, analyzeType } = await req.json();
    
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retourner la liste des pages
    if (analyzeType === 'list') {
      return new Response(
        JSON.stringify({ success: true, pages: SWITCHLY_PAGES }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = siteUrl || 'https://switchly.fr';
    const page = SWITCHLY_PAGES[pageKey as keyof typeof SWITCHLY_PAGES];
    
    if (!page) {
      return new Response(
        JSON.stringify({ success: false, error: 'Page non trouvée' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageUrl = `${baseUrl}${page.url}`;
    console.log(`Analyzing page: ${pageUrl}`);

    // Scraper la page Switchly
    const switchlyScrape = await scrapePage(pageUrl, FIRECRAWL_API_KEY);
    
    if (!switchlyScrape.success) {
      return new Response(
        JSON.stringify({ success: false, error: `Impossible de scraper ${pageUrl}: ${switchlyScrape.error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scraper 1-2 pages concurrentes pour comparaison
    const competitorScrapes: any[] = [];
    const competitorUrls = Object.values(COMPETITORS).slice(0, 2);
    
    for (const comp of competitorUrls) {
      const scrape = await scrapePage(comp.url, FIRECRAWL_API_KEY);
      if (scrape.success) {
        competitorScrapes.push({
          name: comp.name,
          url: comp.url,
          ...scrape
        });
      }
    }

    console.log(`Scraped Switchly page + ${competitorScrapes.length} competitors`);

    // Construire le prompt d'analyse section par section
    const analysisPrompt = buildPageAnalysisPrompt(
      page.label,
      page.url,
      switchlyScrape,
      competitorScrapes
    );

    // Appeler l'IA pour analyse
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert SEO et CRO français. Tu analyses les pages web section par section et fournis des recommandations ultra-précises et actionnables. Format JSON uniquement.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit atteint. Réessayez.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('Réponse IA vide');
    }

    // Parser le JSON
    let analysis;
    try {
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      const jsonStr = jsonMatch[1]?.trim() || aiContent.trim();
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error('JSON parse error');
      analysis = { raw: aiContent, parseError: true };
    }

    console.log('Page analysis completed');

    return new Response(
      JSON.stringify({ 
        success: true,
        page: {
          key: pageKey,
          label: page.label,
          url: page.url,
          fullUrl: pageUrl
        },
        scrapeData: {
          title: switchlyScrape.metadata?.title,
          description: switchlyScrape.metadata?.description,
          contentLength: switchlyScrape.content?.length || 0
        },
        competitorsAnalyzed: competitorScrapes.length,
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Page analysis error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erreur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scrapePage(url: string, apiKey: string) {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        success: true,
        content: data.data?.markdown || data.markdown || '',
        html: data.data?.html || data.html || '',
        metadata: data.data?.metadata || data.metadata || {},
      };
    }
    
    return { success: false, error: data.error || 'Scrape failed' };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' };
  }
}

function buildPageAnalysisPrompt(
  pageLabel: string,
  pageUrl: string,
  switchlyData: any,
  competitors: any[]
) {
  const competitorsText = competitors.map(c => `
--- ${c.name} ---
URL: ${c.url}
Titre: ${c.metadata?.title || 'N/A'}
Description: ${c.metadata?.description || 'N/A'}
Contenu (extrait): ${c.content?.substring(0, 1500) || 'N/A'}
`).join('\n');

  return `ANALYSE DÉTAILLÉE PAGE PAR PAGE - "${pageLabel}" (${pageUrl})

=== DONNÉES SCRAPÉES DE LA PAGE SWITCHLY ===
Titre actuel: ${switchlyData.metadata?.title || 'Non défini'}
Meta description actuelle: ${switchlyData.metadata?.description || 'Non définie'}
Contenu de la page:
${switchlyData.content?.substring(0, 4000) || 'Contenu non disponible'}

=== CONCURRENTS POUR COMPARAISON ===
${competitorsText}

=== CONTEXTE SWITCHLY ===
- Proposition unique: SEUL à combiner électricité + internet en achat groupé
- Stats: 2547 membres, 287€/an économisés
- UX: inscription 30 sec par SMS
- Objectif: conversion 8-12%

=== MISSION ===
Analyse COMPLÈTE de cette page avec recommandations SECTION PAR SECTION.
Chaque recommandation doit être:
1. SPÉCIFIQUE à cette page
2. ACTIONNABLE immédiatement
3. Basée sur ce que font les concurrents ET les meilleures pratiques

FOURNIS UN JSON avec cette structure EXACTE:

{
  "pageScore": {
    "global": 75,
    "seo": 70,
    "conversion": 80,
    "ux": 75
  },
  "currentState": {
    "title": "Titre actuel analysé",
    "titleScore": 60,
    "titleIssues": ["Problème 1", "Problème 2"],
    "description": "Description actuelle",
    "descriptionScore": 55,
    "descriptionIssues": ["Problème 1"]
  },
  "sections": [
    {
      "name": "Hero Section",
      "currentContent": "Description du contenu actuel",
      "score": 65,
      "issues": ["Problème identifié 1", "Problème 2"],
      "recommendations": [
        {
          "type": "headline",
          "priority": "haute",
          "current": "Texte actuel si applicable",
          "suggested": "Nouveau texte recommandé",
          "reason": "Pourquoi ce changement améliore la conversion",
          "impact": "Impact estimé: +15% clics CTA"
        }
      ],
      "competitorInsight": "Ce que font les concurrents pour cette section"
    },
    {
      "name": "Section avantages/bénéfices",
      "currentContent": "...",
      "score": 70,
      "issues": [],
      "recommendations": [],
      "competitorInsight": "..."
    }
  ],
  "seoRecommendations": {
    "title": {
      "current": "Titre actuel",
      "suggested": "Nouveau titre optimisé (max 60 car)",
      "keywords": ["mot-clé 1", "mot-clé 2"]
    },
    "description": {
      "current": "Description actuelle",
      "suggested": "Nouvelle description (max 155 car)",
      "keywords": ["mot-clé inclus"]
    },
    "h1": {
      "current": "H1 actuel",
      "suggested": "H1 optimisé",
      "reason": "Explication"
    },
    "keywords": {
      "primary": "mot-clé principal",
      "secondary": ["mot-clé 2", "mot-clé 3"],
      "longTail": ["phrase longue traîne 1", "phrase 2"]
    },
    "internalLinks": ["Suggestion lien interne 1", "Lien 2"],
    "structuredData": "Type de schema.org recommandé"
  },
  "conversionRecommendations": {
    "cta": {
      "current": "Texte CTA actuel",
      "suggested": "Nouveau CTA optimisé",
      "placement": "Recommandation placement",
      "design": "Recommandation design"
    },
    "socialProof": {
      "current": "Élément actuel",
      "suggested": "Amélioration recommandée",
      "examples": ["Exemple 1", "Exemple 2"]
    },
    "urgency": {
      "tactics": ["Tactique 1", "Tactique 2"],
      "implementation": "Comment implémenter"
    },
    "trustSignals": ["Signal confiance à ajouter 1", "Signal 2"]
  },
  "copywritingFixes": [
    {
      "location": "Où dans la page",
      "current": "Texte actuel",
      "suggested": "Texte amélioré",
      "technique": "Technique utilisée (ex: pouvoir du 'vous', bénéfice client)"
    }
  ],
  "technicalIssues": [
    {
      "issue": "Problème technique",
      "severity": "haute|moyenne|basse",
      "fix": "Comment corriger"
    }
  ],
  "priorityActions": [
    {
      "action": "Action à faire",
      "timeEstimate": "15 min",
      "impact": "Impact élevé sur conversion",
      "difficulty": "facile|moyen|difficile"
    }
  ],
  "competitorComparison": {
    "switchlyStrengths": ["Force 1 vs concurrents", "Force 2"],
    "switchlyWeaknesses": ["Point à améliorer 1"],
    "opportunities": ["Opportunité 1 identifiée chez concurrents"]
  }
}`;
}
