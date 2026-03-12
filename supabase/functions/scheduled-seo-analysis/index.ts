import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAGES_TO_ANALYZE = [
  { url: '/', title: 'Accueil' },
  { url: '/comparer', title: 'Comparer' },
  { url: '/faq', title: 'FAQ' },
  { url: '/contact', title: 'Contact' },
];

const SITE_URL = 'https://switchly.fr';

async function analyzePageWithAI(pageUrl: string, pageTitle: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return null;

  const prompt = `Analyse SEO de la page "${pageTitle}" (${SITE_URL}${pageUrl}).
Switchly est un comparateur gratuit d'électricité et de gaz.
  
Retourne un JSON:
{
  "overallScore": <0-100>,
  "categories": {
    "technique": { "score": <0-100>, "issues": [], "recommendations": [] },
    "contenu": { "score": <0-100>, "issues": [], "recommendations": [] },
    "performance": { "score": <0-100>, "issues": [], "recommendations": [] },
    "mobile": { "score": <0-100>, "issues": [], "recommendations": [] }
  },
  "priorityActions": ["action 1", "action 2", "action 3"]
}

Retourne UNIQUEMENT le JSON.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un expert SEO. Tu analyses les pages web et retournes des scores en JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const results: any[] = [];

    for (const page of PAGES_TO_ANALYZE) {
      const analysis = await analyzePageWithAI(page.url, page.title);
      if (analysis) {
        await supabase.from('seo_metrics').insert({
          page_url: page.url,
          page_title: page.title,
          overall_score: analysis.overallScore,
          title_score: analysis.categories.contenu.score,
          meta_score: analysis.categories.technique.score,
          content_score: analysis.categories.contenu.score,
          performance_score: analysis.categories.performance.score,
          mobile_score: analysis.categories.mobile.score,
          issues: analysis.priorityActions,
          recommendations: [
            ...analysis.categories.technique.recommendations,
            ...analysis.categories.contenu.recommendations,
          ].slice(0, 10),
        });
        results.push({ page: page.url, success: true, score: analysis.overallScore });
      } else {
        results.push({ page: page.url, success: false });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Analyze local SEO pages
    const { data: localPages } = await supabase
      .from('local_seo_pages')
      .select('slug, titre')
      .eq('publie', true)
      .limit(10);

    if (localPages?.length) {
      for (const localPage of localPages) {
        const pageUrl = `/electricite/${localPage.slug}`;
        const analysis = await analyzePageWithAI(pageUrl, localPage.titre);
        if (analysis) {
          await supabase.from('seo_metrics').insert({
            page_url: pageUrl,
            page_title: localPage.titre,
            overall_score: analysis.overallScore,
            title_score: analysis.categories.contenu.score,
            meta_score: analysis.categories.technique.score,
            content_score: analysis.categories.contenu.score,
            performance_score: analysis.categories.performance.score,
            mobile_score: analysis.categories.mobile.score,
            issues: analysis.priorityActions,
            recommendations: [...analysis.categories.technique.recommendations, ...analysis.categories.contenu.recommendations].slice(0, 5),
          });
          results.push({ page: pageUrl, success: true, score: analysis.overallScore });
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalPages: results.length,
      successful: results.filter(r => r.success).length,
      averageScore: Math.round(results.filter(r => r.score).reduce((sum: number, r: any) => sum + r.score, 0) / (results.filter(r => r.score).length || 1)),
      results,
    };

    return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
