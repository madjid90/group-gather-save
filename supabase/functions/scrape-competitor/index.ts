import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Concurrents Switchly à analyser
const COMPETITORS = {
  selectra: {
    name: 'Selectra',
    url: 'https://selectra.info/',
    type: 'Comparateur énergie',
    weakness: 'Condamné 400K€ pratiques trompeuses, processus long (10 min)'
  },
  hellowatt: {
    name: 'HelloWatt',
    url: 'https://www.hellowatt.fr/',
    type: 'Comparateur énergie',
    weakness: 'Pas de combo électricité + internet'
  },
  ufcquechoisir: {
    name: 'UFC-Que Choisir',
    url: 'https://www.quechoisir.org/nos-actions-groupe-energie/',
    type: 'Achat groupé',
    weakness: 'Processus lent et complexe'
  },
  lelynx: {
    name: 'LeLynx',
    url: 'https://www.lelynx.fr/energie/',
    type: 'Comparateur multi-assurance',
    weakness: 'Focus assurance, énergie secondaire'
  },
  jechange: {
    name: 'JeChange',
    url: 'https://www.jechange.fr/',
    type: 'Comparateur énergie',
    weakness: 'Pas de combo unique'
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

    const competitorAnalysisPrompt = `Tu es un expert SEO et stratégie digitale. Analyse ces sites concurrents de Switchly et génère des recommandations SEO actionables.

CONTEXTE SWITCHLY:
- Achat groupé électricité + internet (combo UNIQUE sur le marché)
- 2 547 membres, 287€/an économisés en moyenne
- Inscription 30 sec par SMS
- Objectif: 8-12% conversion, dépasser Selectra

SITES CONCURRENTS ANALYSÉS:
${successfulScrapes.map(s => `
=== ${s.name} (${s.type}) ===
Faiblesse connue: ${s.weakness}
URL: ${s.url}
Titre: ${s.metadata?.title || 'N/A'}
Description: ${s.metadata?.description || 'N/A'}
Contenu (extrait):
${s.content?.substring(0, 2000) || 'N/A'}
`).join('\n')}

Génère une analyse comparative et des recommandations SEO pour battre ces concurrents.

Retourne UNIQUEMENT un JSON valide:
{
  "competitorAnalysis": [
    {
      "name": "Nom concurrent",
      "seoStrengths": ["force SEO 1", "force SEO 2"],
      "seoWeaknesses": ["faiblesse SEO 1", "faiblesse SEO 2"],
      "keywordsTheyRank": ["mot-clé 1", "mot-clé 2"],
      "contentStrategy": "description de leur stratégie contenu",
      "howToBeat": "stratégie spécifique pour les dépasser"
    }
  ],
  "switchlyRecommendations": {
    "keywordsToTarget": ["mot-clé prioritaire 1", "mot-clé 2", "mot-clé 3"],
    "contentGaps": ["contenu manquant 1", "contenu à créer 2"],
    "differentiators": ["différenciateur 1 à mettre en avant", "différenciateur 2"],
    "metaTagsOptimizations": {
      "title": "Titre optimisé suggéré",
      "description": "Meta description suggérée"
    },
    "urgentActions": ["action urgente 1", "action urgente 2", "action urgente 3"]
  },
  "competitiveAdvantages": [
    "Avantage Switchly #1 à exploiter",
    "Avantage Switchly #2",
    "Avantage Switchly #3"
  ],
  "summary": "Résumé exécutif de l'analyse en 2-3 phrases"
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