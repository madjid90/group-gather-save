import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pages Switchly à analyser
const SWITCHLY_PAGES: Record<string, { url: string; label: string; priority: 'high' | 'medium' | 'low' }> = {
  home: { url: '/', label: 'Accueil', priority: 'high' },
  inscription: { url: '/inscription', label: 'Inscription', priority: 'high' },
  faq: { url: '/faq', label: 'FAQ', priority: 'medium' },
  contact: { url: '/contact', label: 'Contact', priority: 'medium' },
  organiser: { url: '/organiser-achat-groupe', label: 'Organiser un achat groupé', priority: 'high' },
  invitation: { url: '/invitation', label: 'Invitation', priority: 'low' },
};

// Concurrents pour comparaison (limité à 2 pour réduire le temps)
const COMPETITORS: Record<string, { name: string; url: string; focus: string }> = {
  selectra: { name: 'Selectra', url: 'https://selectra.info/achat-groupe/energie', focus: 'comparateur principal' },
  hellowatt: { name: 'HelloWatt', url: 'https://www.hellowatt.fr/achats-groupes/energie-classique/', focus: 'achat groupé' },
};

// Extraction JSON robuste
function extractJSON(response: string): any {
  const patterns = [
    /```json\s*([\s\S]*?)```/,
    /```\s*([\s\S]*?)```/,
    /(\{[\s\S]*\})/
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch { continue; }
    }
  }

  try {
    return JSON.parse(response.trim());
  } catch {
    return { raw: response, parseError: true };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { pageKey, siteUrl, analyzeType } = await req.json();
    
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!FIRECRAWL_API_KEY) {
      console.error('[Analyze-SEO] Firecrawl API key missing');
      return new Response(
        JSON.stringify({ success: false, error: 'Connecteur Firecrawl non configuré. Configurez-le dans les settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('[Analyze-SEO] Lovable API key missing');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration IA manquante' }),
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
    const page = SWITCHLY_PAGES[pageKey];
    
    if (!page) {
      return new Response(
        JSON.stringify({ success: false, error: `Page "${pageKey}" non trouvée` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageUrl = `${baseUrl}${page.url}`;
    console.log(`[Analyze-SEO] Starting analysis: ${pageUrl}`);

    // Scraper la page Switchly (prioritaire)
    const switchlyScrape = await scrapePage(pageUrl, FIRECRAWL_API_KEY);
    
    if (!switchlyScrape.success) {
      console.error(`[Analyze-SEO] Scrape failed for ${pageUrl}:`, switchlyScrape.error);
      return new Response(
        JSON.stringify({ success: false, error: `Impossible de récupérer ${page.label}: ${switchlyScrape.error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scraper les concurrents en parallèle (max 2 pour la vitesse)
    const competitorEntries = Object.entries(COMPETITORS);
    const competitorPromises = competitorEntries.map(async ([key, comp]) => {
      const scrape = await scrapePage(comp.url, FIRECRAWL_API_KEY);
      if (scrape.success) {
        return { key, name: comp.name, url: comp.url, focus: comp.focus, ...scrape };
      }
      return null;
    });

    const competitorResults = await Promise.all(competitorPromises);
    const competitorScrapes = competitorResults.filter(Boolean);

    console.log(`[Analyze-SEO] Scraped Switchly + ${competitorScrapes.length} competitors in ${Date.now() - startTime}ms`);

    // Construire le prompt optimisé
    const analysisPrompt = buildPageAnalysisPrompt(page.label, page.url, switchlyScrape, competitorScrapes);

    // Appeler l'IA avec retry
    let aiContent: string | null = null;
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
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
                content: `Tu es un expert SEO et CRO français senior avec 15 ans d'expérience.
Tu analyses les pages web section par section et fournis des recommandations ULTRA-PRÉCISES et ACTIONNABLES.
Tu dois TOUJOURS répondre en JSON valide uniquement, sans texte avant ou après.
Sois concis mais précis. Chaque recommandation doit avoir un impact mesurable.` 
              },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.2, // Très déterministe pour des analyses cohérentes
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`[Analyze-SEO] AI error (attempt ${attempt + 1}):`, aiResponse.status);
          
          if (aiResponse.status === 429) {
            return new Response(
              JSON.stringify({ success: false, error: 'Limite IA atteinte. Réessayez dans 1 minute.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          if (aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ success: false, error: 'Crédits IA insuffisants.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          continue;
        }

        const aiData = await aiResponse.json();
        aiContent = aiData.choices?.[0]?.message?.content;
        if (aiContent) break;
        
      } catch (err) {
        console.error(`[Analyze-SEO] Fetch error (attempt ${attempt + 1}):`, err);
      }
    }

    if (!aiContent) {
      throw new Error('Impossible d\'obtenir une analyse IA');
    }

    // Parser le JSON avec la fonction robuste
    const analysis = extractJSON(aiContent);
    
    const totalDuration = Date.now() - startTime;
    console.log(`[Analyze-SEO] Completed in ${totalDuration}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        page: {
          key: pageKey,
          label: page.label,
          url: page.url,
          fullUrl: pageUrl,
          priority: page.priority
        },
        scrapeData: {
          title: switchlyScrape.metadata?.title || 'N/A',
          description: switchlyScrape.metadata?.description || 'N/A',
          contentLength: switchlyScrape.content?.length || 0
        },
        competitorsAnalyzed: competitorScrapes.length,
        analysis,
        duration: totalDuration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Analyze-SEO] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erreur inattendue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scrapePage(url: string, apiKey: string, timeout = 15000): Promise<{
  success: boolean;
  content?: string;
  html?: string;
  metadata?: Record<string, any>;
  error?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000, // Attendre que la page soit chargée
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (response.ok && data.success) {
      const content = data.data?.markdown || data.markdown || '';
      return {
        success: true,
        content: content.substring(0, 8000), // Limiter pour réduire les tokens
        metadata: data.data?.metadata || data.metadata || {},
      };
    }
    
    return { success: false, error: data.error || 'Scrape échoué' };
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      return { success: false, error: 'Timeout: la page met trop de temps à répondre' };
    }
    return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}

function buildPageAnalysisPrompt(
  pageLabel: string,
  pageUrl: string,
  switchlyData: any,
  competitors: any[]
): string {
  const competitorsText = competitors.map(c => `
[${c.name}] ${c.focus || ''}
Titre: ${c.metadata?.title || 'N/A'}
Description: ${c.metadata?.description || 'N/A'}
Extrait: ${c.content?.substring(0, 1200) || 'N/A'}
`).join('\n---\n');

  return `ANALYSE SEO + CRO: "${pageLabel}" (${pageUrl})

## PAGE SWITCHLY
Titre: ${switchlyData.metadata?.title || 'Non défini'}
Description: ${switchlyData.metadata?.description || 'Non définie'}
Contenu:
${switchlyData.content?.substring(0, 5000) || 'N/A'}

## CONCURRENTS
${competitorsText}

## CONTEXTE
- USP: Seul combo électricité + internet
- Stats: 2547 membres, 287€/an économisés, inscription 30 sec
- Objectif: 8-12% conversion

## CONSIGNES
Analyse section par section. Recommandations ACTIONNABLES uniquement.
Réponds en JSON valide:

{
  "pageScore": { "global": 75, "seo": 70, "conversion": 80, "ux": 75 },
  "currentState": {
    "title": "titre analysé",
    "titleScore": 60,
    "titleIssues": ["problème"],
    "description": "description",
    "descriptionScore": 55,
    "descriptionIssues": ["problème"]
  },
  "sections": [{
    "name": "Hero",
    "currentContent": "résumé",
    "score": 65,
    "issues": ["problème"],
    "recommendations": [{
      "type": "headline|cta|paragraph",
      "priority": "haute|moyenne|basse",
      "current": "texte actuel",
      "suggested": "texte amélioré",
      "reason": "pourquoi",
      "impact": "+X% métrique"
    }],
    "competitorInsight": "ce que font les concurrents"
  }],
  "seoRecommendations": {
    "title": { "current": "", "suggested": "", "keywords": [] },
    "description": { "current": "", "suggested": "", "keywords": [] },
    "h1": { "current": "", "suggested": "", "reason": "" },
    "keywords": { "primary": "", "secondary": [], "longTail": [] },
    "internalLinks": [],
    "structuredData": "Organization ou FAQ"
  },
  "conversionRecommendations": {
    "cta": { "current": "", "suggested": "", "placement": "", "design": "" },
    "socialProof": { "current": "", "suggested": "", "examples": [] },
    "urgency": { "tactics": [], "implementation": "" },
    "trustSignals": []
  },
  "copywritingFixes": [{ "location": "", "current": "", "suggested": "", "technique": "" }],
  "technicalIssues": [{ "issue": "", "severity": "haute|moyenne|basse", "fix": "" }],
  "priorityActions": [{ "action": "", "timeEstimate": "", "impact": "", "difficulty": "facile|moyen|difficile" }],
  "competitorComparison": {
    "switchlyStrengths": [],
    "switchlyWeaknesses": [],
    "opportunities": []
  }
}`;
}
