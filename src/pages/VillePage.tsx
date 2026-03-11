import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Leaf, Star, Loader2, ChevronRight, Users, Zap, Globe } from 'lucide-react';

interface Ville {
  id: string;
  slug: string;
  nom: string;
  code_postal: string;
  code_insee: string;
  departement: string | null;
  region: string | null;
  population: number | null;
  nb_logements: number | null;
  conso_moyenne_kwh: number | null;
  reseau: string | null;
  nom_eld: string | null;
  prix_moyen_kwh: number | null;
}

interface Offre {
  id: string;
  fournisseur: string;
  nom_offre: string;
  type: string;
  prix_kwh: number;
  abonnement_annuel: number;
  prix_annuel_6000kwh?: number;
  economie_vs_trv: number;
  label_vert: boolean;
  selectra_score: string;
  url_souscription: string;
}

export default function VillePage() {
  const { slug } = useParams<{ slug: string }>();
  const [ville, setVille] = useState<Ville | null>(null);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [villesProches, setVillesProches] = useState<Ville[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch ville
      const { data: villeData, error } = await supabase
        .from('villes' as any)
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !villeData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const v = villeData as any as Ville;
      setVille(v);

      // Fetch offres + villes proches in parallel
      const [offresRes, prochesRes] = await Promise.all([
        supabase.functions.invoke('selectra-offers', {
          body: { type: 'electricite', code_postal: v.code_postal },
        }),
        supabase
          .from('villes' as any)
          .select('slug, nom, code_postal, conso_moyenne_kwh, population, departement')
          .eq('departement', v.departement)
          .neq('slug', slug)
          .order('population', { ascending: false })
          .limit(6),
      ]);

      if (offresRes.data?.offres) {
        setOffres(offresRes.data.offres);
      }
      if (prochesRes.data) {
        setVillesProches(prochesRes.data as any as Ville[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !ville) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <h1 className="text-2xl font-bold">Commune non trouvée</h1>
          <p className="text-muted-foreground">Cette page n'existe pas encore.</p>
          <Button asChild><Link to="/">Retour à l'accueil</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const conso = ville.conso_moyenne_kwh || 6000;
  const prix_trv = 0.2516;
  const economie_max = Math.round(
    offres[0]
      ? (prix_trv - offres[0].prix_kwh) * conso
      : 300
  );

  const comparerUrl = `/comparer?cp=${ville.code_postal}&ville=${ville.nom}&type=electricite`;

  return (
    <>
      <Helmet>
        <title>Comparateur électricité {ville.nom} ({ville.code_postal}) — Meilleure offre 2026</title>
        <meta name="description" content={`Comparez les offres électricité à ${ville.nom} (${ville.code_postal}). ${ville.population?.toLocaleString('fr-FR') || ''} habitants économisent jusqu'à ${economie_max}€/an. Réseau ${ville.reseau}. Comparaison gratuite en 30 secondes.`} />
        <link rel="canonical" href={`https://switchly.fr/electricite-gaz/${ville.slug}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* HERO */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              ⚡ Comparateur certifié
            </span>
            <h1 className="text-2xl md:text-4xl font-bold mb-3">
              Comparateur électricité {ville.nom} ({ville.code_postal})
            </h1>
            <p className="text-muted-foreground mb-6">
              Économisez jusqu'à <span className="font-bold text-secondary">{economie_max}€/an</span> sur votre facture électricité
            </p>
            <Button size="lg" asChild>
              <Link to={comparerUrl}>Comparer gratuitement →</Link>
            </Button>
          </div>
        </section>

        {/* RÉASSURANCE */}
        <div className="border-y border-border bg-card">
          <div className="container mx-auto px-4 py-3 flex flex-wrap justify-center gap-4 md:gap-8 text-xs text-muted-foreground">
            {['✅ Gratuit', '🔒 Sans engagement', '⚡ Sans coupure', '⏱ Résultat en 30s'].map(b => (
              <span key={b} className="font-medium">{b}</span>
            ))}
          </div>
        </div>

        <main className="flex-1">
          {/* CHIFFRES CLÉS */}
          <section className="py-10">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Users, label: 'Habitants', value: ville.population?.toLocaleString('fr-FR') || 'N/A' },
                  { icon: Zap, label: 'Conso moyenne', value: `${conso.toLocaleString('fr-FR')} kWh/an` },
                  { icon: Globe, label: 'Réseau', value: `${ville.reseau}${ville.nom_eld ? ` (${ville.nom_eld})` : ''}` },
                ].map(c => (
                  <div key={c.label} className="bg-card border border-border rounded-2xl p-5 text-center">
                    <c.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-lg font-bold">{c.value}</p>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* OFFRES */}
          <section className="py-10 bg-muted/30">
            <div className="container mx-auto px-4 max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold mb-1">
                Les meilleures offres électricité à {ville.nom} en 2026
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Triées par économies — Prix actualisés quotidiennement
              </p>

              <div className="space-y-3">
                {offres.slice(0, 5).map((o, i) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-card border rounded-2xl p-4 ${i === 0 ? 'border-primary shadow-md' : 'border-border'}`}
                  >
                    {i === 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                        <Star className="w-3 h-3 fill-primary" /> Meilleure offre
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-sm">{o.fournisseur}</p>
                        <p className="text-xs text-muted-foreground">{o.nom_offre}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {o.label_vert && (
                            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Leaf className="w-3 h-3" /> Offre verte
                            </span>
                          )}
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            Prix {o.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-secondary">+{o.economie_vs_trv}€</p>
                        <p className="text-xs text-muted-foreground">/an vs EDF</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant={i === 0 ? 'default' : 'outline'}
                      asChild
                    >
                      <a href={o.url_souscription} target="_blank" rel="noopener noreferrer">
                        Souscrire en ligne <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* POURQUOI CHANGER */}
          <section className="py-10">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-xl font-bold mb-6">Pourquoi changer de fournisseur à {ville.nom} ?</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', title: 'Même électricité', desc: `L'électricité reste identique, seul le contrat change. Réseau ${ville.reseau}.` },
                  { icon: '💰', title: 'Économies réelles', desc: `Les habitants de ${ville.nom} peuvent économiser jusqu'à ${economie_max}€/an.` },
                  { icon: '🔄', title: 'Simple et rapide', desc: 'Changement en 21 jours max, 100% en ligne, sans coupure.' },
                ].map(b => (
                  <div key={b.title} className="bg-card border border-border rounded-2xl p-5">
                    <span className="text-2xl">{b.icon}</span>
                    <h3 className="font-semibold mt-2 mb-1">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DONNÉES LOCALES */}
          <section className="py-10 bg-muted/30">
            <div className="container mx-auto px-4 max-w-2xl">
              <h2 className="text-xl font-bold mb-4">L'électricité à {ville.nom} en chiffres</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Consommation moyenne', `${conso.toLocaleString('fr-FR')} kWh/an`],
                      ['Nombre de foyers', ville.nb_logements?.toLocaleString('fr-FR') || 'N/A'],
                      ['Gestionnaire réseau', `${ville.reseau}${ville.nom_eld ? ` — ${ville.nom_eld}` : ''}`],
                      ['Prix de référence (TRV)', '0,2516 €/kWh'],
                      ['Économie potentielle', `jusqu'à ${economie_max}€/an`],
                      ['Département', ville.departement || 'N/A'],
                    ].map(([label, value], i) => (
                      <tr key={label} className={i > 0 ? 'border-t border-border' : ''}>
                        <td className="py-3 px-4 text-muted-foreground">{label}</td>
                        <td className="py-3 px-4 font-medium text-right">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Source : Enedis Open Data, CRE 2026</p>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-10">
            <div className="container mx-auto px-4 max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Questions fréquentes</h2>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="q1" className="bg-card border border-border rounded-2xl px-4">
                  <AccordionTrigger className="text-sm font-medium">
                    Quel est le meilleur fournisseur d'électricité à {ville.nom} ?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    En 2026, les offres les plus compétitives à {ville.nom} permettent d'économiser jusqu'à {economie_max}€/an
                    par rapport au tarif réglementé EDF. L'offre {offres[0]?.nom_offre || 'Extra Eco'} de {offres[0]?.fournisseur || 'OHM Énergie'}
                    est actuellement la moins chère pour une consommation de {conso.toLocaleString('fr-FR')} kWh/an.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2" className="bg-card border border-border rounded-2xl px-4">
                  <AccordionTrigger className="text-sm font-medium">
                    Comment changer de fournisseur à {ville.nom} ?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Le changement de fournisseur à {ville.nom} est gratuit, sans coupure et 100% en ligne.
                    La procédure prend moins de 10 minutes et le changement effectif intervient sous 21 jours maximum.
                    Le réseau {ville.reseau} reste le même — seul votre contrat change.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3" className="bg-card border border-border rounded-2xl px-4">
                  <AccordionTrigger className="text-sm font-medium">
                    Qui gère le réseau électrique à {ville.nom} ?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {ville.nom_eld
                      ? `Le réseau électrique de ${ville.nom} est géré par ${ville.nom_eld}, une Entreprise Locale de Distribution (ELD). Cela ne change pas votre capacité à choisir librement votre fournisseur.`
                      : `Le réseau électrique de ${ville.nom} est géré par Enedis, le gestionnaire de réseau national qui dessert 95% des communes françaises. Vous pouvez choisir librement votre fournisseur.`
                    }
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* CTA FINAL */}
          <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
            <div className="container mx-auto px-4 max-w-2xl text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Prêt à économiser {economie_max}€ à {ville.nom} ?
              </h2>
              <p className="text-white/80 text-sm mb-6">
                Gratuit · Sans engagement · Résultat immédiat
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to={comparerUrl}>Comparer gratuitement maintenant →</Link>
              </Button>
            </div>
          </section>

          {/* VILLES PROCHES */}
          {villesProches.length > 0 && (
            <section className="py-10">
              <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-lg font-bold mb-4">Comparer dans d'autres villes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {villesProches.map(v => (
                    <Link
                      key={v.slug}
                      to={`/electricite-gaz/${v.slug}`}
                      className="bg-card border border-border rounded-xl p-3 hover:border-primary transition-colors group"
                    >
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        Électricité {v.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">({v.code_postal})</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* BREADCRUMB */}
          <div className="border-t border-border py-4">
            <div className="container mx-auto px-4 max-w-3xl">
              <nav className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                <Link to="/" className="hover:text-primary">Accueil</Link>
                <ChevronRight className="w-3 h-3" />
                <span>Électricité</span>
                {ville.departement && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{ville.departement}</span>
                  </>
                )}
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{ville.nom}</span>
              </nav>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
