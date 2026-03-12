import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPETITORS = {
  hellowatt: {
    name: 'HelloWatt',
    url: 'https://www.hellowatt.fr/',
    type: 'Comparateur énergie',
    weakness: 'Processus plus long, pas de résultat en 30 sec'
  },
  selectra: {
    name: 'Selectra',
    url: 'https://selectra.info/',
    type: 'Comparateur énergie (partenaire)',
    weakness: 'Processus long (10 min), condamné 400K€ pratiques trompeuses'
  },
  quechoisir: {
    name: 'Que Choisir',
    url: 'https://www.quechoisir.org/comparateur-electricite-gaz-n92/',
    type: 'Comparateur associatif',
    weakness: 'Interface datée, processus lent'
  },
  alpiq: {
    name: 'Alpiq',
    url: 'https://particuliers.alpiq.fr/',
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
    
    if (!FIRECRAWL_API_KEY) return new Response(JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (analyzeType === 'list') {
      return new Response(JSON.stringify({ success: true, competitors: COMPETITORS }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const competitor = competitorKey ? COMPETITORS[competitorKey as keyof typeof COMPETITORS] : null;
    if (!competitor && analyzeType !== 'all') {
      return new Response(JSON.stringify({ success: false, error: 'Concurrent non trouvé' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const urlsToScrape = analyzeType === 'all' ? Object.values(COMPETITORS).map(c => c.url) : [competitor!.url];
    const scrapedData: any[] = [];

    for (const url of urlsToScrape) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, formats: ['markdown', 'html'], onlyMainContent: true }),
        });
        const scrapeData = await scrapeResponse.json();
        if (scrapeResponse.ok && scrapeData.success) {
          const competitorInfo = Object.values(COMPETITORS).find(c => c.url === url);
          scrapedData.push({ url, name: competitorInfo?.name || 'Unknown', type: competitorInfo?.type || 'Unknown', weakness: competitorInfo?.weakness || '', content: scrapeData.data?.markdown || '', metadata: scrapeData.data?.metadata || {} });
        } else {
          scrapedData.push({ url, name: Object.values(COMPETITORS).find(c => c.url === url)?.name || 'Unknown', error: scrapeData.error || 'Scraping failed' });
        }
      } catch (scrapeError) {
        scrapedData.push({ url, error: scrapeError instanceof Error ? scrapeError.message : 'Unknown error' });
      }
    }

    const successfulScrapes = scrapedData.filter(d => !d.error);
    if (successfulScrapes.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Impossible de scraper les sites concurrents', details: scrapedData }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const competitorsText = successfulScrapes.map(s => `=== ${s.name} (${s.type}) ===\nFaiblesse: ${s.weakness}\nURL: ${s.url}\nTitre: ${s.metadata?.title || 'N/A'}\nMeta: ${s.metadata?.description || 'N/A'}\nContenu:\n${s.content?.substring(0, 3000) || 'N/A'}\n---`).join('\n');

    const prompt = `Tu es un EXPERT SENIOR en SEO et acquisition digitale. Analyse concurrentielle pour Switchly.

PROFIL SWITCHLY:
- Comparateur gratuit d'électricité et de gaz, rapide (30 sec)
- 2 547 foyers accompagnés, 300€/an économisés en moyenne
- Rémunéré par commission fournisseur, 100% gratuit pour le consommateur
- Objectif: conversion 8-12%, dominer le SEO local

CONCURRENTS ANALYSÉS:
${competitorsText}

Réponds en JSON valide uniquement:
{
  "competitorAnalysis": [{ "name": "", "seoStrengths": [], "seoWeaknesses": [], "keywordsTheyRank": [], "contentStrategy": "", "howToBeat": "" }],
  "switchlyRecommendations": { "keywordsToTarget": [], "contentGaps": [], "differentiators": [], "metaTagsOptimizations": { "title": "", "description": "" }, "urgentActions": [] },
  "acquisitionBestPractices": { "heroSection": { "headline": "", "subheadline": "", "ctaText": "", "socialProof": "" }, "trustElements": [], "copywritingTips": [], "conversionOptimizations": [] },
  "competitiveAdvantages": [],
  "summary": ""
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: [{ role: 'system', content: 'Tu es un expert SEO français spécialisé en analyse concurrentielle pour les comparateurs d\'énergie.' }, { role: 'user', content: prompt }] }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: 'Limite atteinte.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: 'Crédits insuffisants.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    if (!aiContent) throw new Error('Réponse AI vide');

    let analysis;
    try {
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      analysis = JSON.parse((jsonMatch[1] || aiContent).trim());
    } catch { analysis = { raw: aiContent, parseError: true }; }

    return new Response(JSON.stringify({ success: true, scrapedSites: scrapedData.length, successfulScrapes: successfulScrapes.length, analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
