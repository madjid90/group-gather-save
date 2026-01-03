import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Concurrents Switchly à analyser
const COMPETITORS = {
  ecodigo: {
    name: 'Ecodigo',
    url: 'https://www.ecodigo.fr/',
    type: 'Achat groupé énergie',
    weakness: 'Pas de combo électricité + internet'
  },
  hellowatt: {
    name: 'HelloWatt',
    url: 'https://www.hellowatt.fr/achats-groupes/energie-classique/',
    type: 'Achats groupés énergie classique',
    weakness: 'Pas de combo électricité + internet, processus plus long'
  },
  selectra: {
    name: 'Selectra',
    url: 'https://selectra.info/achat-groupe/energie',
    type: 'Achat groupe énergie',
    weakness: 'Condamné 400K€ pratiques trompeuses, processus long (10 min)'
  },
  quechoisirensemble: {
    name: 'Que Choisir Ensemble',
    url: 'https://www.quechoisirensemble.fr/energie-moins-chere-ensemble-bilan/',
    type: 'Achat groupé associatif',
    weakness: 'Processus lent, pas de combo internet'
  },
  alpiq: {
    name: 'Alpiq',
    url: 'https://particuliers.alpiq.fr/guide-energie/marche-energie/fonctionnement-achat-groupe-electricite',
    type: 'Fournisseur énergie',
    weakness: 'Fournisseur direct, pas de comparaison multi-fournisseurs'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { competitorKey, analyzeType } = await req.json();
    
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

    // Si on demande la liste des concurrents
    if (analyzeType === 'list') {
      return new Response(
        JSON.stringify({ success: true, competitors: COMPETITORS }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les infos du concurrent
    const competitor = competitorKey ? COMPETITORS[competitorKey as keyof typeof COMPETITORS] : null;
    
    if (!competitor && analyzeType !== 'all') {
      return new Response(
        JSON.stringify({ success: false, error: 'Concurrent non trouvé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scraper le ou les sites
    const urlsToScrape = analyzeType === 'all' 
      ? Object.values(COMPETITORS).map(c => c.url)
      : [competitor!.url];

    console.log(`Scraping ${urlsToScrape.length} competitor site(s)...`);

    const scrapedData: any[] = [];

    for (const url of urlsToScrape) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'html'],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        
        if (scrapeResponse.ok && scrapeData.success) {
          const competitorInfo = Object.values(COMPETITORS).find(c => c.url === url);
          scrapedData.push({
            url,
            name: competitorInfo?.name || 'Unknown',
            type: competitorInfo?.type || 'Unknown',
            weakness: competitorInfo?.weakness || '',
            content: scrapeData.data?.markdown || scrapeData.markdown || '',
            metadata: scrapeData.data?.metadata || scrapeData.metadata || {},
          });
          console.log(`Successfully scraped: ${url}`);
        } else {
          console.error(`Failed to scrape ${url}:`, scrapeData);
          scrapedData.push({
            url,
            name: Object.values(COMPETITORS).find(c => c.url === url)?.name || 'Unknown',
            error: scrapeData.error || 'Scraping failed',
          });
        }
      } catch (scrapeError) {
        console.error(`Error scraping ${url}:`, scrapeError);
        scrapedData.push({
          url,
          error: scrapeError instanceof Error ? scrapeError.message : 'Unknown error',
        });
      }
    }

    // Analyser avec l'IA pour générer des recommandations
    const successfulScrapes = scrapedData.filter(d => !d.error);
    
    if (successfulScrapes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Impossible de scraper les sites concurrents',
          details: scrapedData 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const competitorsText = successfulScrapes.map(s => `
=== ${s.name} (${s.type}) ===
Faiblesse identifiée: ${s.weakness}
URL: ${s.url}
Titre page: ${s.metadata?.title || 'N/A'}
Meta description: ${s.metadata?.description || 'N/A'}
Contenu principal:
${s.content?.substring(0, 3000) || 'N/A'}
---
`).join('\n');

    const competitorAnalysisPrompt = `Tu es un EXPERT SENIOR en SEO, acquisition digitale et optimisation de conversion (CRO). Tu analyses les meilleurs sites mondiaux d'acquisition pour appliquer leurs stratégies à Switchly.

PROFIL SWITCHLY:
- Proposition unique: SEUL acteur combinant électricité + internet en achat groupé
- Métriques: 2 547 membres, 287€/an économisés en moyenne
- UX différenciante: inscription 30 sec par SMS (vs 10 min chez concurrents)
- Objectif: conversion 8-12%, dépasser concurrents en trafic SEO
- Tonalité: simple, transparent, zéro jargon

CONCURRENTS ANALYSÉS (données scrapées):
${competitorsText}

MISSION: Analyse concurrentielle + Application des MEILLEURES PRATIQUES d'acquisition et conversion.

RÈGLES CRITIQUES:
1. Recommandations SPÉCIFIQUES à Switchly (pas de conseils génériques)
2. Mots-clés = termes des concurrents OU opportunités manquées
3. Actions urgentes réalisables en moins de 2h
4. Inclure les MEILLEURES PRATIQUES des leaders de l'acquisition web (Airbnb, Booking, Netflix, Amazon)
5. Focus sur CONVERSION: chaque recommandation doit améliorer le taux de conversion

STRUCTURE JSON EXACTE:
{
  "competitorAnalysis": [
    {
      "name": "Nom du concurrent",
      "seoStrengths": ["Forces SEO spécifiques"],
      "seoWeaknesses": ["Faiblesses exploitables"],
      "keywordsTheyRank": ["mots-clés ciblés"],
      "contentStrategy": "Leur approche contenu",
      "howToBeat": "Stratégie pour les dépasser"
    }
  ],
  "switchlyRecommendations": {
    "keywordsToTarget": ["5-10 mots-clés PRIORITAIRES"],
    "contentGaps": ["Contenus à créer"],
    "differentiators": ["Arguments différenciants à exploiter"],
    "metaTagsOptimizations": {
      "title": "Titre SEO optimisé (max 60 car)",
      "description": "Meta description (max 155 car)"
    },
    "urgentActions": ["3-5 actions SEO cette semaine"]
  },
  "acquisitionBestPractices": {
    "heroSection": {
      "headline": "Titre hero accrocheur basé sur les meilleures pratiques (douleur + solution)",
      "subheadline": "Sous-titre avec bénéfice concret et chiffre",
      "ctaText": "Texte CTA optimisé pour conversion",
      "socialProof": "Élément de preuve sociale à afficher"
    },
    "trustElements": [
      "Élément de confiance #1 à ajouter (format: conseil + exemple concret)",
      "Élément de confiance #2",
      "Élément de confiance #3"
    ],
    "urgencyTactics": [
      "Technique d'urgence #1 éthique et efficace",
      "Technique d'urgence #2"
    ],
    "copywritingTips": [
      "Amélioration copywriting #1 (avant → après)",
      "Amélioration copywriting #2",
      "Amélioration copywriting #3"
    ],
    "conversionOptimizations": [
      "Optimisation conversion #1 avec impact estimé",
      "Optimisation conversion #2",
      "Optimisation conversion #3"
    ]
  },
  "competitiveAdvantages": [
    "Avantage #1 vs tous concurrents",
    "Avantage #2",
    "Avantage #3"
  ],
  "summary": "Résumé stratégique en 2 phrases: situation + opportunité principale"
}`;

    console.log('Analyzing competitor data with AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un expert SEO français spécialisé en analyse concurrentielle.' },
          { role: 'user', content: competitorAnalysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte. Réessayez dans quelques instants.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants. Veuillez recharger votre compte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('Réponse AI vide');
    }

    // Parse JSON
    let analysis;
    try {
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      const jsonStr = jsonMatch[1]?.trim() || aiContent.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      analysis = { raw: aiContent, parseError: true };
    }

    console.log('Competitor analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        scrapedSites: scrapedData.length,
        successfulScrapes: successfulScrapes.length,
        analysis 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scrape competitor error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});