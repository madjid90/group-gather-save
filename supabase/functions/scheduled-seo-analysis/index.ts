import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pages à analyser quotidiennement
const PAGES_TO_ANALYZE = [
  { url: '/', title: 'Accueil' },
  { url: '/inscription', title: 'Inscription' },
  { url: '/faq', title: 'FAQ' },
  { url: '/contact', title: 'Contact' },
  { url: '/organiser-achat-groupe', title: 'Organiser achat groupe' },
];

const SITE_URL = 'https://switchly.fr';

interface SEOAnalysisResult {
  overallScore: number;
  categories: {
    technique: { score: number; issues: string[]; recommendations: string[] };
    contenu: { score: number; issues: string[]; recommendations: string[] };
    performance: { score: number; issues: string[]; recommendations: string[] };
    mobile: { score: number; issues: string[]; recommendations: string[] };
  };
  priorityActions: string[];
}

async function analyzePageWithAI(pageUrl: string, pageTitle: string): Promise<SEOAnalysisResult | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return null;
  }

  const prompt = `Analyse SEO de la page "${pageTitle}" (${SITE_URL}${pageUrl}).
  
Effectue une analyse SEO complète et retourne un JSON avec cette structure exacte:
{
  "overallScore": <nombre entre 0 et 100>,
  "categories": {
    "technique": { "score": <0-100>, "issues": ["..."], "recommendations": ["..."] },
    "contenu": { "score": <0-100>, "issues": ["..."], "recommendations": ["..."] },
    "performance": { "score": <0-100>, "issues": ["..."], "recommendations": ["..."] },
    "mobile": { "score": <0-100>, "issues": ["..."], "recommendations": ["..."] }
  },
  "priorityActions": ["action prioritaire 1", "action prioritaire 2", "action prioritaire 3"]
}

Critères d'évaluation:
- Technique: structure HTML, balises meta, URLs, liens internes
- Contenu: qualité du titre, description, mots-clés, densité
- Performance: optimisation images, scripts, CSS
- Mobile: responsive, touch-friendly, viewport

Retourne UNIQUEMENT le JSON, sans texte autour.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Tu es un expert SEO. Tu analyses les pages web et retournes des scores et recommandations précises en JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return null;
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return null;
    }

    return JSON.parse(jsonMatch[0]) as SEOAnalysisResult;
  } catch (error) {
    console.error('Error analyzing page:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting scheduled SEO analysis...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { page: string; success: boolean; score?: number }[] = [];

    // Analyze each page
    for (const page of PAGES_TO_ANALYZE) {
      console.log(`Analyzing page: ${page.url}`);
      
      const analysis = await analyzePageWithAI(page.url, page.title);

      if (analysis) {
        // Save metrics to database
        const { error } = await supabase.from('seo_metrics').insert({
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
            ...analysis.categories.performance.recommendations,
            ...analysis.categories.mobile.recommendations,
          ].slice(0, 10),
        });

        if (error) {
          console.error(`Error saving metrics for ${page.url}:`, error);
          results.push({ page: page.url, success: false });
        } else {
          console.log(`Saved metrics for ${page.url}: score ${analysis.overallScore}`);
          results.push({ page: page.url, success: true, score: analysis.overallScore });
        }
      } else {
        results.push({ page: page.url, success: false });
      }

      // Small delay between analyses to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Also analyze published local SEO pages
    const { data: localPages } = await supabase
      .from('local_seo_pages')
      .select('slug, titre')
      .eq('publie', true)
      .limit(10);

    if (localPages && localPages.length > 0) {
      console.log(`Analyzing ${localPages.length} local SEO pages...`);
      
      for (const localPage of localPages) {
        const pageUrl = `/ville/${localPage.slug}`;
        console.log(`Analyzing local page: ${pageUrl}`);
        
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
            recommendations: [
              ...analysis.categories.technique.recommendations,
              ...analysis.categories.contenu.recommendations,
            ].slice(0, 5),
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
      failed: results.filter(r => !r.success).length,
      averageScore: Math.round(
        results.filter(r => r.score).reduce((sum, r) => sum + (r.score || 0), 0) / 
        results.filter(r => r.score).length
      ) || 0,
      results,
    };

    console.log('SEO analysis complete:', JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scheduled SEO analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
