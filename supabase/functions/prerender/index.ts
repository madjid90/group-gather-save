import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Route /ville/:slug
    if (path.startsWith('/ville/')) {
      const slug = path.replace('/ville/', '').replace(/\/$/, '');

      const { data: page, error } = await supabase
        .from('local_seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('publie', true)
        .single();

      if (error || !page) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
      }

      const html = renderVillePage(page);
      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'X-Prerendered': 'true',
          'X-Switchly-Page': 'ville',
        }
      });
    }

    // Route /energie
    if (path === '/energie') {
      const { data: pages } = await supabase
        .from('local_seo_pages')
        .select('ville, slug')
        .eq('publie', true)
        .order('ville')
        .limit(500);

      const html = renderEnergiePage(pages || []);
      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Prerendered': 'true',
        }
      });
    }

    // Route / (homepage)
    if (path === '/') {
      const html = renderHomePage();
      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=1800',
          'X-Prerendered': 'true',
        }
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Prerender error:', message);
    return new Response(`Error: ${message}`, { status: 500, headers: corsHeaders });
  }
});

// ─────────────────────────────────────────────
// TEMPLATES HTML
// ─────────────────────────────────────────────

function renderVillePage(page: any): string {
  const title = `${page.titre} | Switchly`;
  const meta = page.meta_description || `Comparez les offres énergie et internet à ${page.ville}. Gratuit, sans engagement.`;
  const canonical = `https://switchly.fr/ville/${page.slug}`;
  const cp = page.code_postal || '';

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://switchly.fr" },
        { "@type": "ListItem", "position": 2, "name": "Énergie par ville", "item": "https://switchly.fr/energie" },
        { "@type": "ListItem", "position": 3, "name": page.ville, "item": canonical }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": `Comparateur énergie à ${page.ville}`,
      "description": meta,
      "provider": { "@type": "Organization", "name": "Switchly", "url": "https://switchly.fr" },
      "areaServed": { "@type": "City", "name": page.ville, "postalCode": cp },
      "serviceType": "Comparateur énergie et internet",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "description": "Gratuit" }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `Y a-t-il une coupure quand on change de fournisseur à ${page.ville} ?`,
          "acceptedAnswer": { "@type": "Answer", "text": "Non. Le réseau de distribution (Enedis, GRDF) ne change pas. La transition se fait sans aucune coupure." }
        },
        {
          "@type": "Question",
          "name": `Switchly est-il gratuit pour les habitants de ${page.ville} ?`,
          "acceptedAnswer": { "@type": "Answer", "text": "Oui, 100% gratuit. Switchly est rémunéré par commission versée par le fournisseur uniquement en cas de souscription." }
        },
        {
          "@type": "Question",
          "name": `Combien peut-on économiser sur sa facture à ${page.ville} ?`,
          "acceptedAnswer": { "@type": "Answer", "text": "En moyenne entre 100€ et 400€ par an selon la consommation et la taille du logement." }
        }
      ]
    }
  ];

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${meta}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${meta}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="Switchly — Comparateur énergie" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${meta}" />
  ${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ')}
</head>
<body>
  <nav aria-label="Navigation principale">
    <a href="https://switchly.fr">Switchly</a> |
    <a href="https://switchly.fr/comparer?type=electricite">Électricité</a> |
    <a href="https://switchly.fr/comparer?type=gaz">Gaz</a> |
    <a href="https://switchly.fr/comparer?type=internet">Internet</a> |
    <a href="https://switchly.fr/energie">Toutes les villes</a>
  </nav>

  <nav aria-label="Fil d'Ariane">
    <a href="https://switchly.fr">Accueil</a> &rsaquo;
    <a href="https://switchly.fr/energie">Énergie par ville</a> &rsaquo;
    <span>${page.ville}</span>
  </nav>

  <main>
    <h1>${page.titre}</h1>
    ${page.contenu_hero ? `<p>${page.contenu_hero}</p>` : ''}

    <a href="https://switchly.fr/comparer?cp=${cp}&amp;type=electricite">
      Comparer les offres à ${page.ville} — Gratuit →
    </a>

    <section>
      <h2>Économies estimées pour les habitants de ${page.ville}</h2>
      <table>
        <thead>
          <tr><th>Logement</th><th>Tarif EDF</th><th>Meilleure offre</th><th>Économie/an</th></tr>
        </thead>
        <tbody>
          <tr><td>Studio 30m²</td><td>720€</td><td>500€</td><td><strong>-220€</strong></td></tr>
          <tr><td>Appartement 50m²</td><td>960€</td><td>672€</td><td><strong>-288€</strong></td></tr>
          <tr><td>Appartement 75m²</td><td>1 320€</td><td>924€</td><td><strong>-396€</strong></td></tr>
          <tr><td>Maison 100m²</td><td>1 680€</td><td>1 176€</td><td><strong>-504€</strong></td></tr>
          <tr><td>Maison 150m²+</td><td>2 280€</td><td>1 596€</td><td><strong>-684€</strong></td></tr>
        </tbody>
      </table>
    </section>

    ${page.contenu_principal ? `<section>${page.contenu_principal}</section>` : ''}

    ${page.contenu_avantages ? `
    <section>
      <h2>Pourquoi comparer son énergie à ${page.ville} avec Switchly ?</h2>
      ${page.contenu_avantages}
    </section>` : ''}

    <section>
      <h2>Questions fréquentes — Changer de fournisseur à ${page.ville}</h2>
      <h3>Y a-t-il une coupure lors du changement de fournisseur à ${page.ville} ?</h3>
      <p>Non. Le réseau de distribution (Enedis pour l'électricité, GRDF pour le gaz) ne change pas. La transition se fait sans aucune coupure.</p>
      <h3>Combien de temps prend le changement de fournisseur ?</h3>
      <p>Entre 1 et 5 jours ouvrés. Vous choisissez la date de bascule lors de la souscription.</p>
      <h3>Puis-je changer si je suis locataire à ${page.ville} ?</h3>
      <p>Oui. Tout consommateur — propriétaire ou locataire — peut librement choisir son fournisseur d'énergie.</p>
    </section>

    <section>
      <h2>Comparer l'énergie à ${page.ville}</h2>
      <ul>
        <li><a href="https://switchly.fr/comparer?cp=${cp}&amp;type=electricite">Comparer l'électricité à ${page.ville}</a></li>
        <li><a href="https://switchly.fr/comparer?cp=${cp}&amp;type=gaz">Comparer le gaz à ${page.ville}</a></li>
        <li><a href="https://switchly.fr/comparer?cp=${cp}&amp;type=internet">Comparer internet à ${page.ville}</a></li>
        <li><a href="https://switchly.fr/energie">Voir toutes les villes de France</a></li>
      </ul>
    </section>

    <section>
      <h2>Prêt à économiser sur vos factures à ${page.ville} ?</h2>
      ${page.contenu_cta ? `<p>${page.contenu_cta}</p>` : ''}
      <a href="https://switchly.fr/comparer?cp=${cp}">Comparer gratuitement →</a>
      <p>30 secondes · Sans engagement · 100% gratuit · Aucune coupure</p>
    </section>
  </main>

  <footer>
    <p>© 2025 Switchly — Comparateur énergie et internet gratuit</p>
    <a href="https://switchly.fr/energie">Toutes les villes</a> |
    <a href="https://switchly.fr/faq">FAQ</a> |
    <a href="https://switchly.fr/mentions-legales">Mentions légales</a> |
    <a href="https://switchly.fr/politique-confidentialite">Confidentialité</a>
    <p>Switchly est rémunéré par commission sur les souscriptions. Service 100% gratuit pour le consommateur. Données mises à jour en 2025.</p>
  </footer>
</body>
</html>`;
}

function renderEnergiePage(pages: Array<{ville: string, slug: string}>): string {
  const villesLinks = pages.map(p =>
    `<li><a href="https://switchly.fr/ville/${p.slug}">${p.ville}</a></li>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Comparer énergie et internet partout en France — Économisez jusqu'à 400€/an | Switchly</title>
  <meta name="description" content="Comparateur énergie et internet gratuit disponible dans toutes les villes de France. Électricité, gaz, fibre — comparez en 30 secondes, sans engagement." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://switchly.fr/energie" />
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://switchly.fr" },
      { "@type": "ListItem", "position": 2, "name": "Énergie par ville", "item": "https://switchly.fr/energie" }
    ]
  })}</script>
</head>
<body>
  <nav>
    <a href="https://switchly.fr">Switchly</a> |
    <a href="https://switchly.fr/comparer">Comparer</a> |
    <a href="https://switchly.fr/faq">FAQ</a>
  </nav>
  <main>
    <h1>Comparer énergie et internet partout en France</h1>
    <p>Switchly compare gratuitement les offres électricité, gaz et internet dans toutes les villes françaises. Économisez jusqu'à 400€/an en changeant de fournisseur.</p>
    <a href="https://switchly.fr/comparer">Comparer dans ma ville →</a>
    <h2>Toutes les villes disponibles</h2>
    <ul>${villesLinks}</ul>
  </main>
  <footer>
    <p>© 2025 Switchly — Comparateur énergie et internet</p>
  </footer>
</body>
</html>`;
}

function renderHomePage(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Switchly — Comparer énergie et internet | Économisez jusqu'à 400€/an</title>
  <meta name="description" content="Comparateur d'électricité, gaz et internet gratuit. Trouvez les meilleures offres en 30 secondes. Sans engagement, sans coupure. 100% gratuit." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://switchly.fr" />
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Switchly",
    "url": "https://switchly.fr",
    "description": "Comparateur énergie et internet gratuit",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://switchly.fr/comparer?cp={cp}",
      "query-input": "required name=cp"
    }
  })}</script>
</head>
<body>
  <main>
    <h1>Économisez jusqu'à 400€/an sur vos factures énergie et internet</h1>
    <p>Switchly compare gratuitement les offres électricité, gaz et internet disponibles chez vous. 30 secondes. Sans engagement. Sans coupure.</p>
    <a href="https://switchly.fr/comparer?type=electricite">Comparer l'électricité</a>
    <a href="https://switchly.fr/comparer?type=gaz">Comparer le gaz</a>
    <a href="https://switchly.fr/comparer?type=internet">Comparer internet</a>
    <a href="https://switchly.fr/energie">Voir toutes les villes</a>
  </main>
</body>
</html>`;
}
