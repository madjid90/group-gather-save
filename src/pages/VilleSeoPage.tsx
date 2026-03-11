import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Zap, Wifi, MapPin, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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

  const compareUrl = `/comparer?cp=${page.code_postal || ''}&ville=${encodeURIComponent(page.ville)}`;

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
        
        <meta property="og:title" content={`${page.titre} | Switchly`} />
        {page.meta_description && <meta property="og:description" content={page.meta_description} />}
        <meta property="og:url" content={`https://switchly.fr/ville/${page.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://switchly.fr/og-image.png" />
        <meta property="og:locale" content="fr_FR" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${page.titre} | Switchly`} />
        {page.meta_description && <meta name="twitter:description" content={page.meta_description} />}

        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://switchly.fr" },
            { "@type": "ListItem", "position": 2, "name": "Énergie", "item": "https://switchly.fr/energie" },
            { "@type": "ListItem", "position": 3, "name": page.ville, "item": `https://switchly.fr/ville/${page.slug}` }
          ]
        })}</script>

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
                {/* Widget CP pré-rempli */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 max-w-md mx-auto">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={page.code_postal || ''}
                      readOnly
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm font-medium"
                    />
                  </div>
                  <Link
                    to={compareUrl}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Comparer gratuitement <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-4">
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
                <div><div className="text-3xl md:text-4xl font-bold text-primary">30s</div><div className="text-sm text-muted-foreground">pour comparer</div></div>
                <div><div className="text-3xl md:text-4xl font-bold text-primary">100%</div><div className="text-sm text-muted-foreground">gratuit</div></div>
                <div><div className="text-3xl md:text-4xl font-bold text-primary">0</div><div className="text-sm text-muted-foreground">coupure garantie</div></div>
              </div>
            </div>
          </section>

          {/* Comment ça marche */}
          <section className="py-12 bg-background border-t border-border">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-xl font-bold text-center mb-8 text-foreground">
                Comparer à {page.ville} en 3 étapes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    num: "1",
                    title: "Entrez votre code postal",
                    desc: `Indiquez le ${page.code_postal || 'code postal'} et votre type de contrat en 30 secondes.`,
                    icon: "📍"
                  },
                  {
                    num: "2",
                    title: "Comparez les offres",
                    desc: `Toutes les offres disponibles à ${page.ville} s'affichent instantanément, triées par économies.`,
                    icon: "⚡"
                  },
                  {
                    num: "3",
                    title: "Souscrivez en ligne",
                    desc: "Choisissez votre offre et souscrivez directement. Sans coupure, sans déplacement.",
                    icon: "✅"
                  }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-muted/30 rounded-xl border border-border">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          {page.contenu_principal && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none 
                      prose-headings:font-bold prose-headings:text-foreground 
                      prose-h2:text-xl prose-h3:text-base
                      prose-p:text-muted-foreground prose-p:leading-relaxed
                      prose-li:text-muted-foreground
                      prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: page.contenu_principal }} 
                  />
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
                        <Search className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Toutes les offres du marché</h3>
                      <p className="text-sm text-muted-foreground">
                        Switchly compare toutes les offres disponibles chez vous en 30 secondes.
                      </p>
                    </div>
                    <div className="bg-background p-6 rounded-xl shadow-sm">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Économies réelles</h3>
                      <p className="text-sm text-muted-foreground">
                        Les foyers qui changent de fournisseur économisent en moyenne 200 à 400€/an.
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

          {/* Témoignages */}
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-xl font-bold text-center mb-8">
                Ce que disent nos utilisateurs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    nom: "Camille P.",
                    ville: "Nantes (44)",
                    texte: "30 secondes de comparaison, 23% moins cher avec EDF. Je recommande.",
                    economie: "276€/an",
                    type: "Électricité"
                  },
                  {
                    nom: "Nadia K.",
                    ville: "Bordeaux (33)",
                    texte: "Ma box internet est passée de 45€ à 29€/mois. Démarche 100% en ligne.",
                    economie: "192€/an",
                    type: "Internet"
                  },
                  {
                    nom: "Thomas R.",
                    ville: "Lyon (69)",
                    texte: "Changement de fournisseur gaz sans aucune coupure. Très simple.",
                    economie: "215€/an",
                    type: "Gaz"
                  }
                ].map((t, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {t.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.nom}</p>
                        <p className="text-xs text-muted-foreground">{t.ville}</p>
                      </div>
                      <span className="ml-auto text-xs bg-secondary/10 text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                        {t.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">"{t.texte}"</p>
                    <p className="text-sm font-bold text-primary">Économie : {t.economie}</p>
                    <div className="flex gap-0.5 mt-2">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="text-yellow-400 text-xs">★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center max-w-2xl">
              <p className="text-sm font-medium opacity-75 mb-2 uppercase tracking-wide">
                Gratuit · Sans engagement · Sans coupure
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Prêt à économiser à {page.ville} ?
              </h2>
              <p className="opacity-90 mb-6 text-sm">
                Comparez les offres énergie et internet à {page.ville} en quelques secondes.
              </p>
              <Link
                to={compareUrl}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold text-base hover:bg-white/90 transition-colors"
              >
                Comparer gratuitement <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs opacity-60 mt-4">
                Résultat en 30 secondes · Aucune carte bancaire requise
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VilleSeoPage;
