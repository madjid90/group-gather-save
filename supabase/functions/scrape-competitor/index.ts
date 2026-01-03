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

    const competitorAnalysisPrompt = `Tu es un expert SEO senior spécialisé en acquisition digitale et achat groupé énergie. Tu dois générer des recommandations ULTRA CONCRÈTES et IMMÉDIATEMENT APPLICABLES pour Switchly.

PROFIL SWITCHLY (à garder en tête):
- Proposition unique: SEUL acteur combinant électricité + internet en achat groupé
- Métriques actuelles: 2 547 membres, 287€/an économisés en moyenne
- UX différenciante: inscription 30 sec par SMS (vs 10 min chez concurrents)
- Objectif: conversion 8-12%, dépasser Selectra en trafic SEO
- Tonalité: simple, transparent, zéro jargon

CONCURRENTS ANALYSÉS (données scrapées):
${successfulScrapes.map(s => `
=== ${s.name} (${s.type}) ===
Faiblesse identifiée: ${s.weakness}
URL: ${s.url}
Titre page: ${s.metadata?.title || 'N/A'}
Meta description: ${s.metadata?.description || 'N/A'}
Contenu principal:
${s.content?.substring(0, 3000) || 'N/A'}
---
`).join('\n')}

MISSION: Analyse comparative approfondie et recommandations SEO pour BATTRE ces concurrents.

RÈGLES CRITIQUES:
1. Chaque recommandation doit être SPÉCIFIQUE à Switchly (pas de conseils génériques)
2. Les mots-clés suggérés doivent être des termes que les concurrents ciblent OU des opportunités qu'ils ratent
3. Les actions urgentes doivent être réalisables en moins de 2h
4. Les meta tags suggérés doivent intégrer les différenciateurs Switchly
5. Analyse les VRAIS contenus des concurrents, pas des suppositions

Génère un JSON avec cette structure EXACTE:
{
  "competitorAnalysis": [
    {
      "name": "Nom du concurrent",
      "seoStrengths": ["Ce qu'ils font BIEN en SEO - sois précis"],
      "seoWeaknesses": ["Leurs failles SEO exploitables"],
      "keywordsTheyRank": ["vrais mots-clés de leur contenu"],
      "contentStrategy": "Leur approche contenu (longueur, ton, sujets)",
      "howToBeat": "Stratégie PRÉCISE pour les dépasser sur Google"
    }
  ],
  "switchlyRecommendations": {
    "keywordsToTarget": ["5-10 mots-clés PRIORITAIRES à cibler immédiatement"],
    "contentGaps": ["Contenus que Switchly DOIT créer pour combler les lacunes"],
    "differentiators": ["Arguments différenciants à mettre en avant dans le contenu"],
    "metaTagsOptimizations": {
      "title": "Titre optimisé pour la homepage (max 60 car, inclure différenciateur)",
      "description": "Meta description percutante (max 155 car, CTA inclus)"
    },
    "urgentActions": ["3-5 actions SEO faisables CETTE SEMAINE"]
  },
  "competitiveAdvantages": [
    "Avantage #1 de Switchly vs TOUS les concurrents analysés",
    "Avantage #2...",
    "Avantage #3..."
  ],
  "summary": "Résumé stratégique en 2 phrases: situation concurrentielle + opportunité principale"
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