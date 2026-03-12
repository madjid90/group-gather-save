import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SWITCHLY_PAGES: Record<string, { url: string; label: string; priority: 'high' | 'medium' | 'low' }> = {
  home: { url: '/', label: 'Accueil', priority: 'high' },
  comparer: { url: '/comparer', label: 'Comparer', priority: 'high' },
  faq: { url: '/faq', label: 'FAQ', priority: 'medium' },
  contact: { url: '/contact', label: 'Contact', priority: 'medium' },
  electricite: { url: '/electricite/', label: 'Index Électricité', priority: 'high' },
  gaz: { url: '/gaz/', label: 'Index Gaz', priority: 'high' },
};

const COMPETITORS: Record<string, { name: string; url: string; focus: string }> = {
  selectra: { name: 'Selectra', url: 'https://selectra.info/', focus: 'comparateur énergie principal' },
  hellowatt: { name: 'HelloWatt', url: 'https://www.hellowatt.fr/', focus: 'comparateur énergie' },
};

function extractJSON(response: string): any {
  const patterns = [/```json\s*([\s\S]*?)```/, /```\s*([\s\S]*?)```/, /(\{[\s\S]*\})/];
  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) { try { return JSON.parse(match[1].trim()); } catch { continue; } }
  }
  try { return JSON.parse(response.trim()); } catch { return { raw: response, parseError: true }; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const { pageKey, siteUrl, analyzeType } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!FIRECRAWL_API_KEY) return new Response(JSON.stringify({ success: false, error: 'Connecteur Firecrawl non configuré.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ success: false, error: 'Configuration IA manquante' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (analyzeType === 'list') return new Response(JSON.stringify({ success: true, pages: SWITCHLY_PAGES }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const baseUrl = siteUrl || 'https://switchly.fr';
    const page = SWITCHLY_PAGES[pageKey];
    if (!page) return new Response(JSON.stringify({ success: false, error: `Page "${pageKey}" non trouvée` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const pageUrl = `${baseUrl}${page.url}`;
    const switchlyScrape = await scrapePage(pageUrl, FIRECRAWL_API_KEY);
    if (!switchlyScrape.success) return new Response(JSON.stringify({ success: false, error: `Impossible de récupérer ${page.label}: ${switchlyScrape.error}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const competitorResults = await Promise.all(
      Object.entries(COMPETITORS).map(async ([key, comp]) => {
        const scrape = await scrapePage(comp.url, FIRECRAWL_API_KEY);
        return scrape.success ? { key, name: comp.name, url: comp.url, focus: comp.focus, ...scrape } : null;
      })
    );
    const competitorScrapes = competitorResults.filter(Boolean);

    const analysisPrompt = buildPageAnalysisPrompt(page.label, page.url, switchlyScrape, competitorScrapes);

    let aiContent: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Tu es un expert SEO et CRO français senior. Tu analyses les pages web section par section. Réponds en JSON valide uniquement.' },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.2,
          }),
        });
        if (!aiResponse.ok) {
          if (aiResponse.status === 429) return new Response(JSON.stringify({ success: false, error: 'Limite IA atteinte.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          if (aiResponse.status === 402) return new Response(JSON.stringify({ success: false, error: 'Crédits IA insuffisants.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          continue;
        }
        const aiData = await aiResponse.json();
        aiContent = aiData.choices?.[0]?.message?.content;
        if (aiContent) break;
      } catch { continue; }
    }

    if (!aiContent) throw new Error('Impossible d\'obtenir une analyse IA');

    return new Response(JSON.stringify({
      success: true,
      page: { key: pageKey, label: page.label, url: page.url, fullUrl: pageUrl, priority: page.priority },
      scrapeData: { title: switchlyScrape.metadata?.title || 'N/A', description: switchlyScrape.metadata?.description || 'N/A', contentLength: switchlyScrape.content?.length || 0 },
      competitorsAnalyzed: competitorScrapes.length,
      analysis: extractJSON(aiContent),
      duration: Date.now() - startTime
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erreur inattendue' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function scrapePage(url: string, apiKey: string, timeout = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, waitFor: 2000 }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    if (response.ok && data.success) {
      return { success: true, content: (data.data?.markdown || '').substring(0, 8000), metadata: data.data?.metadata || {} };
    }
    return { success: false, error: data.error || 'Scrape échoué' };
  } catch (e: any) {
    clearTimeout(timeoutId);
    return { success: false, error: e.name === 'AbortError' ? 'Timeout' : (e.message || 'Erreur réseau') };
  }
}

function buildPageAnalysisPrompt(pageLabel: string, pageUrl: string, switchlyData: any, competitors: any[]): string {
  const competitorsText = competitors.map((c: any) => `[${c.name}] ${c.focus || ''}\nTitre: ${c.metadata?.title || 'N/A'}\nExtrait: ${c.content?.substring(0, 1200) || 'N/A'}`).join('\n---\n');

  return `ANALYSE SEO + CRO: "${pageLabel}" (${pageUrl})

## PAGE SWITCHLY
Titre: ${switchlyData.metadata?.title || 'Non défini'}
Description: ${switchlyData.metadata?.description || 'Non définie'}
Contenu: ${switchlyData.content?.substring(0, 5000) || 'N/A'}

## CONCURRENTS
${competitorsText}

## CONTEXTE
- Switchly = comparateur gratuit d'électricité et de gaz
- Stats: 2547 foyers, 300€/an économisés, comparaison en 30 sec
- Objectif: 8-12% conversion

Réponds en JSON valide:
{
  "pageScore": { "global": 75, "seo": 70, "conversion": 80, "ux": 75 },
  "sections": [{ "name": "Hero", "score": 65, "issues": [], "recommendations": [{ "type": "headline", "priority": "haute", "current": "", "suggested": "", "reason": "", "impact": "" }] }],
  "seoRecommendations": { "title": { "current": "", "suggested": "", "keywords": [] }, "description": { "current": "", "suggested": "" }, "keywords": { "primary": "", "secondary": [], "longTail": [] } },
  "conversionRecommendations": { "cta": { "current": "", "suggested": "" }, "socialProof": { "suggested": "" }, "trustSignals": [] },
  "priorityActions": [{ "action": "", "timeEstimate": "", "impact": "", "difficulty": "facile" }]
}`;
}
