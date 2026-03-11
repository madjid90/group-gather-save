import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Zap, Wifi, MapPin, Loader2, BarChart3, MousePointerClick, Star, Clock, Shield } from 'lucide-react';
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
      if (!slug) { setNotFound(true); setIsLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from('local_seo_pages')
          .select('*')
          .eq('slug', slug)
          .eq('publie', true)
          .single();
        if (error || !data) { setNotFound(true); } else { setPage(data); }
      } catch (err) {
        console.error('Erreur chargement page:', err);
        setNotFound(true);
      } finally { setIsLoading(false); }
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
            <p className="text-muted-foreground mb-6">Cette page n'existe pas ou n'est plus disponible.</p>
            <Button asChild><Link to="/">Retour à l'accueil</Link></Button>
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
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        {page.mots_cles && <meta name="keywords" content={page.mots_cles.join(', ')} />}
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
          "provider": { "@type": "Organization", "name": "Switchly", "url": "https://switchly.fr", "logo": "https://switchly.fr/favicon.png" },
          "areaServed": { "@type": "City", "name": page.ville, ...(page.code_postal && { "postalCode": page.code_postal }), "addressCountry": "FR" },
          "serviceType": "Comparateur d'énergie",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "description": "Service de comparaison gratuit" }
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
          {/* Hero Section - matches landing HeroSection */}
          <section className="relative min-h-[60svh] flex items-center overflow-hidden py-10 sm:py-12 lg:py-16">
            <div className="absolute inset-0 bg-gradient-subtle" aria-hidden="true" />
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
                >
                  <MapPin className="w-3 h-3" />
                  {page.ville} {page.code_postal && `(${page.code_postal})`}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-4 leading-tight"
                >
                  {page.titre}
                </motion.h1>

                {page.contenu_hero && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-base lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                  >
                    {page.contenu_hero}
                  </motion.p>
                )}

                {/* Widget CP pré-rempli - matches landing card style */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card border border-border rounded-2xl p-4 shadow-lg max-w-xl mx-auto mb-6"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={page.code_postal || ''}
                        readOnly
                        className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-medium outline-none"
                      />
                    </div>
                    <Button variant="hero" size="lg" className="whitespace-nowrap" asChild>
                      <Link to={compareUrl}>
                        Comparer gratuitement <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground"
                >
                  <span>✓ Sans coupure</span><span className="text-border">|</span>
                  <span>✓ 100% gratuit</span><span className="text-border">|</span>
                  <span>✓ Sans engagement</span><span className="text-border">|</span>
                  <span>✓ Résultat immédiat</span>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Stats - matches landing style */}
          <section className="py-10 sm:py-12 lg:py-16 bg-card">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-6 max-w-3xl mx-auto">
                {[
                  { value: '400€', label: "max d'économies/an" },
                  { value: '30s', label: 'pour comparer' },
                  { value: '100%', label: 'gratuit' },
                  { value: '0', label: 'coupure garantie' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-background rounded-lg lg:rounded-2xl p-3 lg:p-6 border border-border text-center card-hover"
                  >
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-[10px] lg:text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Comment ça marche - matches HowItWorksSection */}
          <section className="py-10 sm:py-12 lg:py-16 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-6 lg:mb-10"
              >
                <span className="inline-block text-primary font-semibold text-xs uppercase tracking-wide mb-2">
                  Comment ça marche
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
                  Comparer à {page.ville} en 3 étapes
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 max-w-4xl mx-auto">
                {[
                  { icon: Search, num: '1', title: 'Entrez votre code postal', desc: `Indiquez le ${page.code_postal || 'code postal'} et votre type de contrat en 30 secondes.` },
                  { icon: BarChart3, num: '2', title: 'Comparez les offres', desc: `Toutes les offres disponibles à ${page.ville} s'affichent instantanément, triées par économies.` },
                  { icon: MousePointerClick, num: '3', title: 'Souscrivez en ligne', desc: 'Choisissez votre offre et souscrivez directement. Sans coupure, sans déplacement.' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="relative"
                  >
                    <div className="bg-card rounded-lg lg:rounded-2xl p-3 lg:p-8 h-full border border-border card-hover">
                      <div className="absolute -top-2 lg:-top-4 left-3 lg:left-8 bg-gradient-hero text-primary-foreground text-[10px] lg:text-xs font-bold px-2 lg:px-3 py-0.5 lg:py-1 rounded-full">
                        Étape {step.num}
                      </div>
                      <div className="w-10 h-10 lg:w-16 lg:h-16 rounded-lg lg:rounded-2xl bg-primary/10 flex items-center justify-center mb-2 lg:mb-6 mt-1 mx-auto lg:mx-0">
                        <step.icon className="w-5 h-5 lg:w-8 lg:h-8 text-primary" />
                      </div>
                      <h3 className="text-xs lg:text-xl font-semibold text-foreground mb-1 lg:mb-4 text-center lg:text-left">
                        {step.title}
                      </h3>
                      <p className="text-[10px] lg:text-lg text-muted-foreground text-center lg:text-left leading-tight">
                        {step.desc}
                      </p>
                    </div>
                    {i < 2 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contenu principal */}
          {page.contenu_principal && (
            <section className="py-10 sm:py-12 lg:py-16 bg-card">
              <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-3xl mx-auto"
                >
                  <div 
                    className="prose prose-sm lg:prose-lg dark:prose-invert max-w-none 
                      prose-headings:font-bold prose-headings:text-foreground 
                      prose-h2:text-xl prose-h2:lg:text-3xl prose-h3:text-base prose-h3:lg:text-xl
                      prose-p:text-muted-foreground prose-p:leading-relaxed
                      prose-li:text-muted-foreground
                      prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: page.contenu_principal }} 
                  />
                </motion.div>
              </div>
            </section>
          )}

          {/* Avantages - matches AdvantagesSection */}
          {page.contenu_avantages && (
            <section className="py-10 sm:py-12 lg:py-16 bg-background">
              <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-6 lg:mb-10"
                >
                  <span className="inline-block text-secondary font-semibold text-xs uppercase tracking-wide mb-2">
                    Nos avantages
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
                    Pourquoi comparer son énergie à {page.ville} avec Switchly ?
                  </h2>
                  <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs font-medium">Électricité</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                      <Wifi className="w-3 h-3" />
                      <span className="text-xs font-medium">Internet</span>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-6 max-w-4xl mx-auto mb-6 lg:mb-10">
                  {[
                    { icon: Search, title: 'Toutes les offres du marché', desc: `Switchly compare toutes les offres disponibles à ${page.ville} en 30 secondes.`, color: 'primary' as const },
                    { icon: Zap, title: 'Économies réelles', desc: 'Les foyers qui changent de fournisseur économisent en moyenne 200 à 400€/an.', color: 'secondary' as const },
                    { icon: Shield, title: 'Multi-services', desc: 'Énergie et internet : économisez sur tous vos contrats.', color: 'primary' as const },
                  ].map((adv, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="group"
                    >
                      <div className="bg-card rounded-lg lg:rounded-2xl p-3 lg:p-8 h-full border border-border card-hover text-center">
                        <div className={`w-10 h-10 lg:w-16 lg:h-16 rounded-lg lg:rounded-2xl mx-auto mb-2 lg:mb-6 flex items-center justify-center transition-transform group-hover:scale-110 ${
                          adv.color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'
                        }`}>
                          <adv.icon className={`w-5 h-5 lg:w-8 lg:h-8 ${adv.color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                        </div>
                        <h3 className="text-xs lg:text-xl font-semibold text-foreground mb-1 lg:mb-3">{adv.title}</h3>
                        <p className="text-[10px] lg:text-base text-muted-foreground leading-tight">{adv.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Contenu avantages from DB */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-3xl mx-auto"
                >
                  <div 
                    className="prose prose-sm lg:prose-lg dark:prose-invert max-w-none 
                      prose-headings:font-bold prose-headings:text-foreground 
                      prose-p:text-muted-foreground prose-p:leading-relaxed
                      prose-li:text-muted-foreground prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: page.contenu_avantages }} 
                  />
                </motion.div>
              </div>
            </section>
          )}

          {/* Témoignages - matches TestimonialsSection */}
          <section className="py-10 sm:py-12 lg:py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-subtle" />
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-6 lg:mb-10"
              >
                <span className="inline-block text-primary font-semibold text-xs uppercase tracking-wide mb-2">
                  Témoignages
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-2 lg:mb-4">
                  Ce que disent nos utilisateurs
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 max-w-4xl mx-auto">
                {[
                  { nom: 'Camille P.', ville: 'Nantes (44)', texte: '30 secondes de comparaison, 23% moins cher avec EDF. Je recommande.', economie: '276€/an', type: 'Électricité', avatar: 'C' },
                  { nom: 'Nadia K.', ville: 'Bordeaux (33)', texte: 'Ma box internet est passée de 45€ à 29€/mois. Démarche 100% en ligne.', economie: '192€/an', type: 'Internet', avatar: 'N' },
                  { nom: 'Thomas R.', ville: 'Lyon (69)', texte: 'Changement de fournisseur gaz sans aucune coupure. Très simple.', economie: '215€/an', type: 'Gaz', avatar: 'T' },
                ].map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="bg-card rounded-lg md:rounded-2xl p-3 md:p-5 h-full border border-border shadow-switchly">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                          💰 {t.economie}
                        </span>
                        <span className="text-xs text-muted-foreground">{t.type}</span>
                      </div>
                      <div className="flex gap-0.5 md:gap-1 mb-1.5 md:mb-3">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-foreground mb-2 md:mb-4 text-xs md:text-sm leading-relaxed">"{t.texte}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-semibold text-xs">
                          {t.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-xs">{t.nom}</p>
                          <p className="text-xs text-muted-foreground">{t.ville}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final - matches CTASection */}
          <section className="py-10 sm:py-12 lg:py-16 bg-card">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-hero p-6 md:p-10 lg:p-12 text-center max-w-4xl mx-auto"
              >
                <div className="absolute inset-0 opacity-10" aria-hidden="true">
                  <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary-foreground blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-primary-foreground blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 flex-wrap">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs font-medium">Électricité</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground">
                      <Wifi className="w-3 h-3" />
                      <span className="text-xs font-medium">Internet</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-primary-foreground/75 mb-2 uppercase tracking-wide">
                    Gratuit · Sans engagement · Sans coupure
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-primary-foreground mb-3 lg:mb-4">
                    Prêt à économiser à {page.ville} ?
                  </h2>
                  <p className="text-[14px] leading-relaxed lg:text-xl text-primary-foreground/90 mb-6 lg:mb-8 max-w-2xl mx-auto">
                    Comparez les offres énergie et internet à {page.ville} en quelques secondes.
                  </p>

                  <Button
                    variant="secondary"
                    size="xl"
                    className="group py-5 md:py-6 px-8 md:px-10 text-base md:text-lg"
                    asChild
                  >
                    <Link to={compareUrl}>
                      Comparer gratuitement
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  <p className="text-xs text-primary-foreground/60 mt-4">
                    Résultat en 30 secondes · Aucune carte bancaire requise
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VilleSeoPage;
