import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration du site
const SITE_URL = "https://switchly.fr";

// Pages statiques avec leurs priorités et fréquences de mise à jour
const STATIC_PAGES = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/inscription", priority: 0.9, changefreq: "weekly" },
  { path: "/faq", priority: 0.8, changefreq: "weekly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/organiser-achat-groupe", priority: 0.8, changefreq: "weekly" },
  { path: "/demande-partenaire", priority: 0.7, changefreq: "monthly" },
  { path: "/mentions-legales", priority: 0.3, changefreq: "yearly" },
  { path: "/politique-rgpd", priority: 0.3, changefreq: "yearly" },
  { path: "/cgu", priority: 0.3, changefreq: "yearly" },
  { path: "/politique-confidentialite", priority: 0.3, changefreq: "yearly" },
];

// Pages exclues du sitemap (pages admin, auth, etc.)
const EXCLUDED_PATHS = [
  "/admin",
  "/connexion",
  "/mot-de-passe-oublie",
  "/dashboard-client",
  "/mon-offre",
  "/formulaire-logement",
  "/offre-confirmation",
  "/partage-invitation",
  "/partage-accueil",
  "/invitation",
];

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority.toFixed(1)}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

function generateSitemapJson(urls: SitemapUrl[]): object {
  return {
    generated_at: new Date().toISOString(),
    total_urls: urls.length,
    site_url: SITE_URL,
    urls: urls.map(url => ({
      ...url,
      loc: url.loc.replace(SITE_URL, '')
    }))
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'xml';
    const today = new Date().toISOString().split('T')[0];

    console.log(`Generating sitemap - Format: ${format}`);

    // Générer les URLs du sitemap
    const sitemapUrls: SitemapUrl[] = STATIC_PAGES.map(page => ({
      loc: `${SITE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority
    }));

    // Retourner selon le format demandé
    if (format === 'json') {
      return new Response(JSON.stringify(generateSitemapJson(sitemapUrls), null, 2), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        },
      });
    }

    // Format XML par défaut
    const sitemapXml = generateSitemapXml(sitemapUrls);
    
    return new Response(sitemapXml, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
    });

  } catch (error: unknown) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
