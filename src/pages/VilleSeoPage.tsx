import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Zap, Wifi, Check, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { JsonLdSchema } from '@/components/seo/JsonLdSchema';

interface LocalPage {
  id: string;
  ville: string;
  code_postal: string | null;
  slug: string;
  titre: string;
  meta_description: string | null;
  contenu_hero: string | null;
  contenu_principal: string | null;
  contenu_avantages: string | null;
  contenu_cta: string | null;
  mots_cles: string[] | null;
  updated_at: string | null;
}

const VilleSeoPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LocalPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('local_seo_pages')
          .select('*')
          .eq('slug', slug)
          .eq('publie', true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setPage(data);
        }
      } catch (err) {
        console.error('Erreur chargement page:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Page non trouvée</h1>
            <p className="text-muted-foreground mb-6">
              Cette page n'existe pas ou n'est plus disponible.
            </p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.titre} | Switchly</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
        {page.mots_cles && (
          <meta name="keywords" content={page.mots_cles.join(', ')} />
        )}
        <link rel="canonical" href={`https://switchly.fr/ville/${page.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${page.titre} | Switchly`} />
        {page.meta_description && <meta property="og:description" content={page.meta_description} />}
        <meta property="og:url" content={`https://switchly.fr/ville/${page.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://switchly.fr/og-image.png" />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${page.titre} | Switchly`} />
        {page.meta_description && <meta name="twitter:description" content={page.meta_description} />}

        {/* BreadcrumbList */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://switchly.fr" },
            { "@type": "ListItem", "position": 2, "name": "Énergie", "item": "https://switchly.fr/energie" },
            { "@type": "ListItem", "position": 3, "name": page.ville, "item": `https://switchly.fr/ville/${page.slug}` }
          ]
        })}</script>

        {/* LocalBusiness + Service */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": `Comparateur énergie ${page.ville}`,
          "description": page.meta_description || `Comparez les offres d'électricité et d'internet à ${page.ville} et économisez jusqu'à 400€/an.`,
          "provider": {
            "@type": "Organization",
            "name": "Switchly",
            "url": "https://switchly.fr",
            "logo": "https://switchly.fr/favicon.png"
          },
          "areaServed": {
            "@type": "City",
            "name": page.ville,
            ...(page.code_postal && { "postalCode": page.code_postal }),
            "addressCountry": "FR"
          },
          "serviceType": "Comparateur d'énergie",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "description": "Service de comparaison gratuit"
          }
        })}</script>

        {/* WebPage */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": page.titre,
          "description": page.meta_description || `Comparateur énergie à ${page.ville}`,
          "url": `https://switchly.fr/ville/${page.slug}`,
          "isPartOf": { "@type": "WebSite", "name": "Switchly", "url": "https://switchly.fr" },
          "inLanguage": "fr-FR",
          "dateModified": page.updated_at || new Date().toISOString()
        })}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-6">
                  {page.titre}
                </h1>
                {page.contenu_hero && (
                  <p className="text-lg md:text-xl text-muted-foreground mb-8">
                    {page.contenu_hero}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to={`/comparer?type=electricite`}>
                      Comparer les offres à {page.ville}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/energie">Voir toutes les villes</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-3xl mx-auto">
                <div><div className="text-3xl md:text-4xl font-bold text-primary">400€</div><div className="text-sm text-muted-foreground">max d'économies/an</div></div>
                <div><div className="text-3xl md:text-4xl font-bold text-primary">2 500+</div><div className="text-sm text-muted-foreground">foyers inscrits</div></div>
                <div><div className="text-3xl md:text-4xl font-bold text-primary">100%</div><div className="text-sm text-muted-foreground">gratuit</div></div>
                <div><div className="text-3xl md:text-4xl font-bold text-primary">0</div><div className="text-sm text-muted-foreground">coupure garantie</div></div>
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          {page.contenu_principal && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: page.contenu_principal }} />
                </div>
              </div>
            </section>
          )}

          {/* Avantages */}
          {page.contenu_avantages && (
            <section className="py-16 bg-muted/20">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                    Pourquoi comparer son énergie à {page.ville} avec Switchly ?
                  </h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-background p-6 rounded-xl shadow-sm">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Force collective</h3>
                      <p className="text-sm text-muted-foreground">
                        Plus nous sommes nombreux, plus notre pouvoir de négociation augmente.
                      </p>
                    </div>
                    <div className="bg-background p-6 rounded-xl shadow-sm">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Économies garanties</h3>
                      <p className="text-sm text-muted-foreground">
                        Des tarifs négociés bien en-dessous des offres grand public.
                      </p>
                    </div>
                    <div className="bg-background p-6 rounded-xl shadow-sm">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Wifi className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Multi-services</h3>
                      <p className="text-sm text-muted-foreground">
                        Énergie et internet : économisez sur tous vos contrats.
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: page.contenu_avantages }} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CTA Final */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Comparez les offres et économisez à {page.ville}
              </h2>
              {page.contenu_cta && (
                <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                  {page.contenu_cta}
                </p>
              )}
              <Button size="lg" variant="secondary" asChild>
                <Link to="/inscription">
                  S'inscrire gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VilleSeoPage;
